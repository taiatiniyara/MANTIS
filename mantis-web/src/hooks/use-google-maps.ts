import { useLoadScript } from '@react-google-maps/api';

const libraries: ('places' | 'visualization' | 'geometry')[] = [
  'visualization', // For heatmap
  'geometry',      // For distance calculations
];

/**
 * Custom hook to load Google Maps API
 * Handles loading state and errors
 */
export function useGoogleMaps() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  return {
    isLoaded,
    loadError,
  };
}
