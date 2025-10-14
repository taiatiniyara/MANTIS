import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, HeatmapLayer } from '@react-google-maps/api';
import { useGoogleMaps } from '@/hooks/use-google-maps';
import { MapSkeleton } from './map-skeleton';
import { FIJI_CENTER, MAP_CONTAINER_STYLE, HEATMAP_OPTIONS } from '@/lib/maps/config';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

interface GeographicDataPoint {
  lat: number;
  lng: number;
  count: number;
  revenue?: number;
}

interface InfringementHeatmapProps {
  data: GeographicDataPoint[];
  height?: string;
  onViewportChange?: (bounds: google.maps.LatLngBounds) => void;
  showControls?: boolean;
}

export function InfringementHeatmap({
  data,
  height = '500px',
  onViewportChange,
  showControls = true,
}: InfringementHeatmapProps) {
  const { isLoaded, loadError } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Convert data to heatmap format with weighted intensity
  const heatmapData = useMemo(() => {
    if (!isLoaded) return [];

    return data.flatMap((point) => {
      // Create multiple points for higher density (based on count)
      const weight = Math.min(point.count / 10, 10); // Normalize weight
      return Array(Math.ceil(weight))
        .fill(null)
        .map(
          () =>
            new google.maps.LatLng(point.lat, point.lng)
        );
    });
  }, [data, isLoaded]);

  const handleBoundsChanged = useCallback(() => {
    if (map && onViewportChange) {
      const bounds = map.getBounds();
      if (bounds) {
        onViewportChange(bounds);
      }
    }
  }, [map, onViewportChange]);

  const handleLoad = useCallback(
    (mapInstance: google.maps.Map) => {
      setMap(mapInstance);
    },
    []
  );

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const resetView = () => {
    if (map) {
      map.setCenter(FIJI_CENTER);
      map.setZoom(10);
    }
  };

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

  const effectiveHeight = isFullscreen ? '100vh' : height;

  return (
    <div
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900' : 'relative'}`}
    >
      {showControls && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={resetView}
            className="bg-white dark:bg-slate-800 shadow-lg"
          >
            Reset View
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleFullscreen}
            className="bg-white dark:bg-slate-800 shadow-lg"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
        <div className="text-xs font-medium mb-2">Infringement Density</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(16, 185, 129, 0.6)' }} />
            <span className="text-xs">Low (1-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(251, 191, 36, 0.8)' }} />
            <span className="text-xs">Medium (6-15)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(249, 115, 22, 0.9)' }} />
            <span className="text-xs">High (16-30)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(220, 38, 38, 1)' }} />
            <span className="text-xs">Very High (30+)</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {data.length} locations
          </p>
        </div>
      </div>

      <div
        style={{ height: effectiveHeight }}
        className="w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        <GoogleMap
          center={FIJI_CENTER}
          zoom={10}
          mapContainerStyle={{ ...MAP_CONTAINER_STYLE, height: effectiveHeight }}
          onLoad={handleLoad}
          onBoundsChanged={handleBoundsChanged}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: true,
          }}
        >
          {heatmapData.length > 0 && (
            <HeatmapLayer data={heatmapData} options={HEATMAP_OPTIONS} />
          )}
        </GoogleMap>
      </div>

      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80">
          <div className="text-center p-8">
            <p className="text-slate-600 dark:text-slate-400">
              No infringement data to display
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              Try adjusting your filters
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
