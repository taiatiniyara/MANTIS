import { useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { MapSkeleton } from './map-skeleton';
import { FIJI_CENTER, MAP_CONTAINER_STYLE } from '@/lib/maps/config';
import { getDirectionsUrl } from '@/lib/maps/utils';
import { Button } from '@/components/ui/button';
import { Navigation } from 'lucide-react';
import type { Infringement } from '@/lib/api/infringements';

interface InfringementMapViewProps {
  infringement: Infringement;
  height?: string;
  zoom?: number;
  showInfoWindow?: boolean;
  onDirectionsClick?: () => void;
}

export function InfringementMapView({
  infringement,
  height = '400px',
  zoom = 16,
  showInfoWindow = true,
  onDirectionsClick,
}: InfringementMapViewProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [showInfo, setShowInfo] = useState(showInfoWindow);

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

  // Extract coordinates from location object
  const position = {
    lat: infringement.location?.lat || FIJI_CENTER.lat,
    lng: infringement.location?.lng || FIJI_CENTER.lng,
  };

  const handleDirectionsClick = () => {
    if (onDirectionsClick) {
      onDirectionsClick();
    } else {
      window.open(getDirectionsUrl(position.lat, position.lng), '_blank');
    }
  };

  return (
    <div style={{ height }} className="w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
      <GoogleMap
        center={position}
        zoom={zoom}
        mapContainerStyle={{ ...MAP_CONTAINER_STYLE, height }}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeControl: false,
        }}
      >
        <Marker
          position={position}
          onClick={() => setShowInfo(true)}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#F97316', // orange-500
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 10,
          }}
        >
          {showInfo && (
            <InfoWindow onCloseClick={() => setShowInfo(false)}>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {infringement.offence?.description || 'Infringement'}
                </h3>
                <p className="text-sm text-slate-600 mb-1">
                  Fine: ${infringement.fine_amount?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-slate-500 mb-2">
                  {infringement.vehicle?.reg_number || 'Unknown vehicle'}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDirectionsClick}
                  className="w-full"
                >
                  <Navigation className="w-3 h-3 mr-2" />
                  Get Directions
                </Button>
              </div>
            </InfoWindow>
          )}
        </Marker>
      </GoogleMap>
    </div>
  );
}
