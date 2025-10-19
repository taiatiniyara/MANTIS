import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

interface LocationTrackingOptions {
  enableBackgroundTracking?: boolean;
  trackingInterval?: number; // milliseconds
  distanceInterval?: number; // meters
}

const LOCATION_HISTORY_KEY = '@mantis_location_history';
const MAX_HISTORY_ITEMS = 1000;

export function useLocationTracking(options: LocationTrackingOptions = {}) {
  const {
    enableBackgroundTracking = false,
    trackingInterval = 30000, // 30 seconds
    distanceInterval = 50, // 50 meters
  } = options;

  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    requestPermission();
    
    return () => {
      stopTracking();
    };
  }, []);

  const requestPermission = async () => {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      setPermission(foregroundStatus);

      if (foregroundStatus !== 'granted') {
        setError('Location permission not granted');
        return false;
      }

      if (enableBackgroundTracking) {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          setError('Background location permission not granted');
        }
      }

      return foregroundStatus === 'granted';
    } catch (err) {
      setError('Failed to request location permission');
      console.error(err);
      return false;
    }
  };

  const startTracking = async () => {
    const hasPermission = permission === 'granted' || await requestPermission();
    
    if (!hasPermission) {
      return;
    }

    try {
      // Get initial location
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords: LocationCoordinates = {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        altitude: initialLocation.coords.altitude,
        accuracy: initialLocation.coords.accuracy,
        heading: initialLocation.coords.heading,
        speed: initialLocation.coords.speed,
        timestamp: initialLocation.timestamp,
      };

      setLocation(coords);
      await saveLocationToHistory(coords);

      // Start watching location changes
      watchSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: trackingInterval,
          distanceInterval: distanceInterval,
        },
        (newLocation) => {
          const newCoords: LocationCoordinates = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            altitude: newLocation.coords.altitude,
            accuracy: newLocation.coords.accuracy,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
            timestamp: newLocation.timestamp,
          };

          setLocation(newCoords);
          saveLocationToHistory(newCoords);
        }
      );

      setIsTracking(true);
      setError(null);
    } catch (err) {
      setError('Failed to start location tracking');
      console.error(err);
    }
  };

  const stopTracking = () => {
    if (watchSubscription.current) {
      watchSubscription.current.remove();
      watchSubscription.current = null;
    }
    setIsTracking(false);
  };

  const getCurrentLocation = async (): Promise<LocationCoordinates | null> => {
    const hasPermission = permission === 'granted' || await requestPermission();
    
    if (!hasPermission) {
      return null;
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords: LocationCoordinates = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        altitude: currentLocation.coords.altitude,
        accuracy: currentLocation.coords.accuracy,
        heading: currentLocation.coords.heading,
        speed: currentLocation.coords.speed,
        timestamp: currentLocation.timestamp,
      };

      setLocation(coords);
      return coords;
    } catch (err) {
      setError('Failed to get current location');
      console.error(err);
      return null;
    }
  };

  const saveLocationToHistory = async (coords: LocationCoordinates) => {
    try {
      const historyJson = await AsyncStorage.getItem(LOCATION_HISTORY_KEY);
      const history: LocationCoordinates[] = historyJson ? JSON.parse(historyJson) : [];

      history.unshift(coords);

      // Keep only the most recent items
      if (history.length > MAX_HISTORY_ITEMS) {
        history.splice(MAX_HISTORY_ITEMS);
      }

      await AsyncStorage.setItem(LOCATION_HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.error('Failed to save location to history:', err);
    }
  };

  const getLocationHistory = async (): Promise<LocationCoordinates[]> => {
    try {
      const historyJson = await AsyncStorage.getItem(LOCATION_HISTORY_KEY);
      return historyJson ? JSON.parse(historyJson) : [];
    } catch (err) {
      console.error('Failed to get location history:', err);
      return [];
    }
  };

  const clearLocationHistory = async () => {
    try {
      await AsyncStorage.removeItem(LOCATION_HISTORY_KEY);
    } catch (err) {
      console.error('Failed to clear location history:', err);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  return {
    location,
    isTracking,
    error,
    permission,
    startTracking,
    stopTracking,
    getCurrentLocation,
    getLocationHistory,
    clearLocationHistory,
    calculateDistance,
  };
}
