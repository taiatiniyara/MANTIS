import { useState, useCallback } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { MapSkeleton } from './map-skeleton';
import { FIJI_CENTER, MAP_CONTAINER_STYLE } from '@/lib/maps/config';
import { Button } from '@/components/ui/button';
import { Crosshair, MapPin } from 'lucide-react';

interface LocationPickerProps {
  initialPosition?: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

export function LocationPicker({
  initialPosition,
  onLocationSelect,
  height = '400px',
}: LocationPickerProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [position, setPosition] = useState(initialPosition || FIJI_CENTER);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string>();

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setLoading(true);
      try {
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({
          location: { lat, lng },
        });

        if (result.results[0]) {
          const formattedAddress = result.results[0].formatted_address;
          setAddress(formattedAddress);
          onLocationSelect(lat, lng, formattedAddress);
        } else {
          onLocationSelect(lat, lng);
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
        onLocationSelect(lat, lng);
      } finally {
        setLoading(false);
      }
    },
    [onLocationSelect]
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setPosition({ lat, lng });
        reverseGeocode(lat, lng);
      }
    },
    [reverseGeocode]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setPosition({ lat, lng });
        reverseGeocode(lat, lng);
      }
    },
    [reverseGeocode]
  );

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition({ lat, lng });
          reverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  }, [reverseGeocode]);

  if (loadError) {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 p-4" style={{ height }}>
        <p className="text-sm text-red-600">Error loading map. Please check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div style={{ height }}>
        <MapSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          Select Location on Map
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={loading}
        >
          <Crosshair className="w-4 h-4 mr-2" />
          Use My Location
        </Button>
      </div>

      <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <GoogleMap
          center={position}
          zoom={16}
          mapContainerStyle={{ ...MAP_CONTAINER_STYLE, height }}
          onClick={handleMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: true,
            mapTypeControl: false,
          }}
        >
          <Marker
            position={position}
            draggable
            onDragEnd={handleMarkerDragEnd}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#F97316', // orange-500
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
              scale: 12,
            }}
          />
        </GoogleMap>
      </div>

      <div className="text-xs text-slate-500 space-y-1">
        {loading ? (
          <p className="flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Loading address...
          </p>
        ) : (
          <>
            <p>Click on the map or drag the marker to select a location</p>
            {address && (
              <p className="font-medium text-slate-700 dark:text-slate-300">
                📍 {address}
              </p>
            )}
            {position && (
              <p className="text-slate-400">
                Coordinates: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
