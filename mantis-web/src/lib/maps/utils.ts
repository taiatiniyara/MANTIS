/**
 * Map utility functions
 */

/**
 * Format coordinates to consistent precision (5 decimal places ~1m accuracy)
 */
export function formatCoordinates(lat: number, lng: number) {
  return {
    lat: parseFloat(lat.toFixed(5)),
    lng: parseFloat(lng.toFixed(5)),
  };
}

/**
 * Check if coordinates are within given bounds
 */
export function isWithinBounds(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return lat <= bounds.north && lat >= bounds.south && lng <= bounds.east && lng >= bounds.west;
}

/**
 * Calculate distance between two points in kilometers (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate Google Maps directions URL
 */
export function getDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Generate static map URL for thumbnails
 */
export function getStaticMapUrl(
  lat: number,
  lng: number,
  options: {
    width?: number;
    height?: number;
    zoom?: number;
    markerColor?: string;
  } = {}
): string {
  const { width = 300, height = 200, zoom = 16, markerColor = 'orange' } = options;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:${markerColor}|${lat},${lng}&key=${apiKey}`;
}

/**
 * Round coordinates for clustering (reduces precision for grouping nearby points)
 */
export function roundCoordinatesForClustering(
  lat: number,
  lng: number,
  precision: number = 4
): { lat: number; lng: number } {
  const factor = Math.pow(10, precision);
  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor,
  };
}

/**
 * Format address for display
 */
export function formatAddress(address: string | null | undefined): string {
  if (!address) return 'Location not available';
  return address;
}
