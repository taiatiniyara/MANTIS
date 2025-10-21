import * as Location from 'expo-location';
import { gpsTracking } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface GPSPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
}

class GPSService {
  private trackingTaskName = 'background-location-task';
  private isTracking = false;
  private lastKnownLocation: LocationData | null = null;

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<GPSPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return { granted: false, canAskAgain: false };
    }
  }

  /**
   * Request background location permissions (for continuous tracking)
   */
  async requestBackgroundPermissions(): Promise<GPSPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.requestBackgroundPermissionsAsync();
      return {
        granted: status === 'granted',
        canAskAgain,
      };
    } catch (error) {
      console.error('Error requesting background permissions:', error);
      return { granted: false, canAskAgain: false };
    }
  }

  /**
   * Check if location permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get current location (one-time)
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.warn('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 0,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp,
      };

      this.lastKnownLocation = locationData;
      
      // Cache for offline use
      await AsyncStorage.setItem('last_known_location', JSON.stringify(locationData));

      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Try to return cached location
      try {
        const cached = await AsyncStorage.getItem('last_known_location');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (cacheError) {
        console.error('Error reading cached location:', cacheError);
      }
      
      return null;
    }
  }

  /**
   * Get last known location (from cache)
   */
  getLastKnownLocation(): LocationData | null {
    return this.lastKnownLocation;
  }

  /**
   * Start background location tracking
   */
  async startTracking(userId: string): Promise<boolean> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        console.warn('Cannot start tracking: no permission');
        return false;
      }

      // Check if already tracking
      if (this.isTracking) {
        console.log('Already tracking location');
        return true;
      }

      // Start location updates in foreground
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 100, // 100 meters
        },
        async (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            speed: location.coords.speed,
            heading: location.coords.heading,
            timestamp: location.timestamp,
          };

          this.lastKnownLocation = locationData;

          // Upload to database
          try {
            await gpsTracking.track({
              user_id: userId,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              accuracy: locationData.accuracy ?? undefined,
              altitude: locationData.altitude ?? undefined,
              speed: locationData.speed ?? undefined,
              heading: locationData.heading ?? undefined,
            });
            console.log('Location tracked:', locationData);
          } catch (error) {
            console.error('Error tracking location:', error);
            // Queue for later if offline
            await this.queueLocationForSync(userId, locationData);
          }
        }
      );

      this.isTracking = true;
      console.log('Location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop location tracking
   */
  async stopTracking(): Promise<void> {
    try {
      this.isTracking = false;
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  /**
   * Check if currently tracking
   */
  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  /**
   * Queue location for sync when offline
   */
  private async queueLocationForSync(userId: string, location: LocationData): Promise<void> {
    try {
      const queueKey = 'gps_sync_queue';
      const existing = await AsyncStorage.getItem(queueKey);
      const queue = existing ? JSON.parse(existing) : [];
      
      queue.push({
        user_id: userId,
        ...location,
        queued_at: Date.now(),
      });

      await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
      console.log('Location queued for sync');
    } catch (error) {
      console.error('Error queuing location:', error);
    }
  }

  /**
   * Sync queued locations
   */
  async syncQueuedLocations(userId: string): Promise<number> {
    try {
      const queueKey = 'gps_sync_queue';
      const existing = await AsyncStorage.getItem(queueKey);
      
      if (!existing) {
        return 0;
      }

      const queue = JSON.parse(existing);
      let synced = 0;

      for (const location of queue) {
        try {
          await gpsTracking.track({
            user_id: userId,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            altitude: location.altitude,
            speed: location.speed,
            heading: location.heading,
          });
          synced++;
        } catch (error) {
          console.error('Error syncing queued location:', error);
          break; // Stop on first error
        }
      }

      // Remove synced items
      if (synced > 0) {
        const remaining = queue.slice(synced);
        if (remaining.length > 0) {
          await AsyncStorage.setItem(queueKey, JSON.stringify(remaining));
        } else {
          await AsyncStorage.removeItem(queueKey);
        }
      }

      console.log(`Synced ${synced} queued locations`);
      return synced;
    } catch (error) {
      console.error('Error syncing queued locations:', error);
      return 0;
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async getAddressFromCoordinates(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses && addresses.length > 0) {
        const addr = addresses[0];
        const parts = [
          addr.name,
          addr.street,
          addr.city,
          addr.region,
          addr.country,
        ].filter(Boolean);
        
        return parts.join(', ');
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points (in meters)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

// Export singleton instance
export const gpsService = new GPSService();
