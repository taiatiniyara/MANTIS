/**
 * Custom Google Maps Style - Plain White, Blue & Slate Theme
 * For MANTIS Mobile Application
 */

export const customMapStyle = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }], // White background
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }], // Slate text
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }], // White stroke
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#cbd5e1' }], // Light slate
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#94a3b8' }], // Slate border
  },
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f8fafc' }], // Very light slate/white
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#e0f2fe' }], // Very light blue
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }], // Slate
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }], // White
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#dbeafe' }], // Light blue for parks
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1e40af' }], // Dark blue
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#e2e8f0' }], // Light slate
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#cbd5e1' }], // Slate
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#e2e8f0' }], // Light slate
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3b82f6' }], // Blue
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2563eb' }], // Darker blue
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry',
    stylers: [{ color: '#3b82f6' }], // Blue
  },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e40af' }], // Dark blue
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#f1f5f9' }], // Very light slate
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#60a5fa' }], // Light blue
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#1e40af' }], // Dark blue
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }], // White
  },
];
