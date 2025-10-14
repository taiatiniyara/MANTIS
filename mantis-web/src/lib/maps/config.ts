/**
 * Google Maps Configuration
 * Centralized configuration for all map-related settings
 */

export const FIJI_CENTER = {
  lat: parseFloat(import.meta.env.VITE_MAP_CENTER_LAT || '-18.1416'),
  lng: parseFloat(import.meta.env.VITE_MAP_CENTER_LNG || '178.4419'),
};

export const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

export const DEFAULT_ZOOM = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM || '10', 10);

export const DEFAULT_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  mapTypeControl: true,
  gestureHandling: 'greedy',
  styles: [], // Will be populated with theme-specific styles
};

export const HEATMAP_OPTIONS: google.maps.visualization.HeatmapLayerOptions = {
  radius: 20,
  opacity: 0.6,
  gradient: [
    'rgba(16, 185, 129, 0)',    // Transparent green
    'rgba(16, 185, 129, 0.6)',  // Green (low)
    'rgba(251, 191, 36, 0.8)',  // Yellow (medium)
    'rgba(249, 115, 22, 0.9)',  // Orange (high)
    'rgba(220, 38, 38, 1)',     // Red (very high)
  ],
};

export const FIJI_BOUNDS = {
  north: -15.5,
  south: -21.0,
  east: 181.0,
  west: 176.5,
};

export const MARKER_ICONS = {
  issued: '/markers/issued-marker.svg',
  paid: '/markers/paid-marker.svg',
  voided: '/markers/voided-marker.svg',
  disputed: '/markers/disputed-marker.svg',
  default: '/markers/default-marker.svg',
};

export const CLUSTER_STYLES = [
  {
    textColor: 'white',
    textSize: 12,
    url: '/markers/cluster-small.svg',
    height: 40,
    width: 40,
  },
  {
    textColor: 'white',
    textSize: 13,
    url: '/markers/cluster-medium.svg',
    height: 50,
    width: 50,
  },
  {
    textColor: 'white',
    textSize: 14,
    url: '/markers/cluster-large.svg',
    height: 60,
    width: 60,
  },
];
