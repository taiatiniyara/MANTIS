"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

interface MapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    onClick?: () => void;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

export function MapComponent({
  center = { lat: -18.1416, lng: 178.4419 }, // Suva, Fiji default
  zoom = 12,
  markers = [],
  onMapClick,
  height = "500px",
  className = "",
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);

  // Load Google Maps script and initialize map
  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        // Load Google Maps (singleton pattern ensures only one load)
        await loadGoogleMaps();

        if (!isMounted || !mapRef.current || !window.google) return;

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Add click listener if callback provided
        if (onMapClick) {
          mapInstance.addListener("click", (e: any) => {
            if (e.latLng) {
              onMapClick(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        if (isMounted) {
          setMap(mapInstance);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error loading/initializing map:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load map");
          setIsLoading(false);
        }
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
    };
  }, [center.lat, center.lng, zoom, onMapClick]);

  // Update markers when they change
  useEffect(() => {
    if (!map || typeof window === 'undefined' || !(window as any).google) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    const google = (window as any).google;
    markers.forEach((markerData) => {
      const marker = new google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
      });

      if (markerData.onClick) {
        marker.addListener("click", markerData.onClick);
      }

      markersRef.current.push(marker);
    });

    // Cleanup function
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [map, markers]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-destructive font-semibold mb-2">Map Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
}
