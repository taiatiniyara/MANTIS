import { useState, useCallback, useEffect } from "react";
import Map, {
  GeolocateControl,
  Marker,
  NavigationControl,
  type MapLayerMouseEvent,
  type ViewState,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { cn } from "@/lib/utils";

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange?: (lat: number, lng: number) => void;
  className?: string;
}

type ViewStateWithSize = ViewState & { width: number; height: number };

export function MapPicker({
  latitude = -18.1416, // Default to Fiji
  longitude = 178.4419,
  onLocationChange,
  className,
}: MapPickerProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number }>({
    lat: latitude,
    lng: longitude,
  });

  const [viewState, setViewState] = useState<ViewStateWithSize>({
    latitude,
    longitude,
    zoom: 12,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    width: 800,
    height: 400,
  });

  const isSameView = (next: ViewStateWithSize, prev: ViewStateWithSize) =>
    next.latitude === prev.latitude &&
    next.longitude === prev.longitude &&
    next.zoom === prev.zoom &&
    (next.pitch ?? 0) === (prev.pitch ?? 0) &&
    (next.bearing ?? 0) === (prev.bearing ?? 0) &&
    next.width === prev.width &&
    next.height === prev.height &&
    JSON.stringify(next.padding ?? { top: 0, right: 0, bottom: 0, left: 0 }) ===
      JSON.stringify(prev.padding ?? { top: 0, right: 0, bottom: 0, left: 0 });

  // Keep internal state in sync if the caller changes the coordinates
  useEffect(() => {
    setMarker({ lat: latitude, lng: longitude });
    setViewState((prev) => {
      const next: ViewStateWithSize = { ...prev, latitude, longitude };
      return isSameView(next, prev) ? prev : next;
    });
  }, [latitude, longitude]);

  const onMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const { lat, lng } = event.lngLat;
      setMarker({ lat, lng });
      if (onLocationChange) {
        onLocationChange(lat, lng);
      }
    },
    [onLocationChange]
  );

  const handleMove = useCallback((event: ViewStateChangeEvent) => {
    setViewState((prev) => {
      const next: ViewStateWithSize = {
        ...prev,
        ...event.viewState,
        width: (event.viewState as any).width ?? prev.width,
        height: (event.viewState as any).height ?? prev.height,
      };
      return isSameView(next, prev) ? prev : next;
    });
  }, []);

  return (
    <div
      className={cn(
        "relative h-100 w-full rounded-lg overflow-hidden border",
        className
      )}
    >
      <Map attributionControl={false}
        mapLib={maplibregl}
        {...viewState}
        onMove={handleMove}
        onClick={onMapClick}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl />
        <GeolocateControl
          trackUserLocation
          onGeolocate={(e: any) => {
            const { latitude, longitude } = e.coords;
            setMarker({ lat: latitude, lng: longitude });
            if (onLocationChange) {
              onLocationChange(latitude, longitude);
            }
          }}
        />
        {marker && (
          <Marker latitude={marker.lat} longitude={marker.lng}>
            <div className="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
