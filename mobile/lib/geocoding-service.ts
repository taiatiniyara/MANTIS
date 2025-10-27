/**
 * Geocoding Service for MANTIS Mobile
 * Provides forward and reverse geocoding with offline caching
 */

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GeocodedAddress {
  formattedAddress: string;
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export interface AddressSuggestion {
  id: string;
  description: string;
  street?: string;
  city?: string;
  region?: string;
}

class GeocodingService {
  private geocodeCache: Map<string, GeocodedAddress> = new Map();
  private reverseGeocodeCache: Map<string, GeocodedAddress> = new Map();

  /**
   * Forward geocoding: Convert address to coordinates
   */
  async geocodeAddress(address: string): Promise<GeocodedAddress | null> {
    try {
      // Check cache first
      const cacheKey = address.toLowerCase().trim();
      if (this.geocodeCache.has(cacheKey)) {
        return this.geocodeCache.get(cacheKey)!;
      }

      // Try to load from persistent storage
      const cachedData = await this.loadFromCache(`geocode_${cacheKey}`);
      if (cachedData) {
        this.geocodeCache.set(cacheKey, cachedData);
        return cachedData;
      }

      // Perform geocoding
      const results = await Location.geocodeAsync(address);
      
      if (results && results.length > 0) {
        const result = results[0];
        
        // Get full address details via reverse geocoding
        const addressDetails = await Location.reverseGeocodeAsync({
          latitude: result.latitude,
          longitude: result.longitude,
        });

        const details = addressDetails[0] || {};
        
        const geocodedAddress: GeocodedAddress = {
          formattedAddress: this.formatAddress(details),
          street: details.street ?? undefined,
          city: details.city ?? undefined,
          region: details.region ?? undefined,
          postalCode: details.postalCode ?? undefined,
          country: details.country ?? undefined,
          latitude: result.latitude,
          longitude: result.longitude,
        };

        // Cache the result
        this.geocodeCache.set(cacheKey, geocodedAddress);
        await this.saveToCache(`geocode_${cacheKey}`, geocodedAddress);

        return geocodedAddress;
      }

      return null;
    } catch (error) {
      console.error('Error geocoding address:', error);
      return null;
    }
  }

  /**
   * Reverse geocoding: Convert coordinates to address
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<GeocodedAddress | null> {
    try {
      const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
      
      // Check cache
      if (this.reverseGeocodeCache.has(cacheKey)) {
        return this.reverseGeocodeCache.get(cacheKey)!;
      }

      // Try to load from persistent storage
      const cachedData = await this.loadFromCache(`reverse_${cacheKey}`);
      if (cachedData) {
        this.reverseGeocodeCache.set(cacheKey, cachedData);
        return cachedData;
      }

      // Perform reverse geocoding
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results && results.length > 0) {
        const result = results[0];
        
        const geocodedAddress: GeocodedAddress = {
          formattedAddress: this.formatAddress(result),
          street: result.street ?? undefined,
          city: result.city ?? undefined,
          region: result.region ?? undefined,
          postalCode: result.postalCode ?? undefined,
          country: result.country ?? undefined,
          latitude,
          longitude,
        };

        // Cache the result
        this.reverseGeocodeCache.set(cacheKey, geocodedAddress);
        await this.saveToCache(`reverse_${cacheKey}`, geocodedAddress);

        return geocodedAddress;
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Format address components into a readable string
   */
  private formatAddress(address: any): string {
    const parts = [];
    
    if (address.name && address.name !== address.street) {
      parts.push(address.name);
    }
    if (address.street) {
      parts.push(address.street);
    }
    if (address.city) {
      parts.push(address.city);
    }
    if (address.region) {
      parts.push(address.region);
    }
    if (address.postalCode) {
      parts.push(address.postalCode);
    }
    if (address.country) {
      parts.push(address.country);
    }

    return parts.filter(Boolean).join(', ') || 'Unknown Location';
  }

  /**
   * Search for addresses (simple local search)
   * Note: For production, consider using Google Places API or similar
   */
  async searchAddresses(query: string): Promise<AddressSuggestion[]> {
    try {
      if (!query || query.length < 3) {
        return [];
      }

      // For now, we'll use a simple geocoding approach
      // In production, integrate Google Places Autocomplete API
      const results = await Location.geocodeAsync(query);
      
      if (results && results.length > 0) {
        const suggestions: AddressSuggestion[] = [];
        
        for (let i = 0; i < Math.min(results.length, 5); i++) {
          const result = results[i];
          const details = await Location.reverseGeocodeAsync({
            latitude: result.latitude,
            longitude: result.longitude,
          });

          if (details && details.length > 0) {
            const address = details[0];
            suggestions.push({
              id: `${result.latitude},${result.longitude}`,
              description: this.formatAddress(address),
              street: address.street ?? undefined,
              city: address.city ?? undefined,
              region: address.region ?? undefined,
            });
          }
        }

        return suggestions;
      }

      return [];
    } catch (error) {
      console.error('Error searching addresses:', error);
      return [];
    }
  }

  /**
   * Get nearby landmarks or places
   */
  async getNearbyPlaces(
    latitude: number,
    longitude: number,
    radiusMeters: number = 1000
  ): Promise<string[]> {
    try {
      // This is a placeholder for future POI/landmark lookup
      // Would integrate with Google Places API or similar service
      const address = await this.reverseGeocode(latitude, longitude);
      return address ? [address.formattedAddress] : [];
    } catch (error) {
      console.error('Error getting nearby places:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two addresses
   */
  async getDistanceBetweenAddresses(
    address1: string,
    address2: string
  ): Promise<number | null> {
    try {
      const location1 = await this.geocodeAddress(address1);
      const location2 = await this.geocodeAddress(address2);

      if (!location1 || !location2) {
        return null;
      }

      return this.calculateDistance(
        location1.latitude,
        location1.longitude,
        location2.latitude,
        location2.longitude
      );
    } catch (error) {
      console.error('Error calculating distance:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(
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

  /**
   * Save geocoded data to cache
   */
  private async saveToCache(key: string, data: GeocodedAddress): Promise<void> {
    try {
      const cacheKey = `geocache_${key}`;
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  /**
   * Load geocoded data from cache
   */
  private async loadFromCache(key: string): Promise<GeocodedAddress | null> {
    try {
      const cacheKey = `geocache_${key}`;
      const data = await AsyncStorage.getItem(cacheKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  }

  /**
   * Clear all geocoding cache
   */
  async clearCache(): Promise<void> {
    try {
      this.geocodeCache.clear();
      this.reverseGeocodeCache.clear();
      
      // Clear from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      const geocacheKeys = keys.filter(key => key.startsWith('geocache_'));
      await AsyncStorage.multiRemove(geocacheKeys);
      
      console.log('Geocoding cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Validate if coordinates are within Fiji (approximate bounds)
   */
  isWithinFiji(latitude: number, longitude: number): boolean {
    // Fiji approximate bounding box
    const minLat = -21.0;
    const maxLat = -12.0;
    const minLon = 177.0;
    const maxLon = -175.0;

    return (
      latitude >= minLat &&
      latitude <= maxLat &&
      ((longitude >= minLon && longitude <= 180) ||
        (longitude >= -180 && longitude <= maxLon))
    );
  }
}

// Export singleton instance
export const geocodingService = new GeocodingService();
