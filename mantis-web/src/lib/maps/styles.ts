/**
 * Map styling for light and dark themes
 * Customized to match MANTIS orange/slate color palette
 */

export const lightMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#cbd5e1' }], // slate-300
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#dbeafe' }], // blue-100
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f8fafc' }], // slate-50
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#f0fdf4' }], // green-50
  },
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#334155' }], // slate-700
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }],
  },
];

export const darkMapStyles: google.maps.MapTypeStyle[] = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }], // slate-900
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#475569' }], // slate-600
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#1e3a8a' }], // blue-900
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }], // slate-800
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#14532d' }], // green-900
  },
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e2e8f0' }], // slate-200
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#1e293b' }], // slate-800
  },
];
