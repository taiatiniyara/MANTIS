// Map styling for Google Maps in MANTIS Mobile
// Provides theme-aware map styles for light and dark modes

import { MapStyleElement } from 'react-native-maps';

/**
 * Light theme map style (standard Google Maps appearance)
 */
export const lightMapStyle: MapStyleElement[] = [
  // Subtle adjustments for better readability
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
];

/**
 * Dark theme map style (night mode)
 * Based on Google's night mode palette with MANTIS brand colors
 */
export const darkMapStyle: MapStyleElement[] = [
  // Base map elements
  {
    elementType: 'geometry',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#242f3e' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746855' }],
  },
  
  // Administrative areas
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  
  // Points of interest
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  
  // Roads
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  
  // Transit
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  
  // Water
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

/**
 * Default map region for Fiji
 * Centers on Suva with appropriate zoom level
 */
export const FIJI_DEFAULT_REGION = {
  latitude: -18.1416,
  longitude: 178.4419,
  latitudeDelta: 0.5, // Zoom level
  longitudeDelta: 0.5,
};

/**
 * Map configuration constants
 */
export const MAP_CONFIG = {
  // Default zoom for single location view
  SINGLE_LOCATION_DELTA: 0.01, // ~1km radius
  
  // Zoom range limits
  MIN_ZOOM_LEVEL: 5,
  MAX_ZOOM_LEVEL: 20,
  
  // Animation duration
  ANIMATION_DURATION: 300,
  
  // Marker size
  MARKER_SIZE: 40,
  
  // Map padding
  EDGE_PADDING: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
  },
};

/**
 * Get map style based on color scheme
 */
export const getMapStyle = (isDark: boolean): MapStyleElement[] => {
  return isDark ? darkMapStyle : lightMapStyle;
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (
  latitude: number,
  longitude: number,
  precision: number = 6
): string => {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
};

/**
 * Calculate region from coordinates with padding
 */
export const getRegionForCoordinates = (
  latitude: number,
  longitude: number,
  delta: number = MAP_CONFIG.SINGLE_LOCATION_DELTA
) => {
  return {
    latitude,
    longitude,
    latitudeDelta: delta,
    longitudeDelta: delta,
  };
};

/**
 * Check if coordinates are valid
 */
export const isValidCoordinate = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Check if coordinates are within Fiji bounds
 * Fiji: approximately -20° to -15° latitude, 177° to 180° longitude
 */
export const isWithinFiji = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -20.5 &&
    latitude <= -15.5 &&
    longitude >= 176.5 &&
    longitude <= 181
  );
};
