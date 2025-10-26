"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapComponentProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title?: string;
    onClick?: () => void;
  }>;
  polygons?: Array<{
    id: string;
    path: Array<{ lat: number; lng: number }>;
    strokeColor?: string;
    fillColor?: string;
    fillOpacity?: number;
    title?: string;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
  className?: string;
}

export function MapComponent({
  center = { lat: -18.1416, lng: 178.4419 }, // Suva, Fiji default
  zoom = 12,
  markers = [],
  polygons = [],
  onMapClick,
  height = "500px",
  className = "",
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polygonsRef = useRef<L.Polygon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add click listener
    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;
    setIsLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update center and zoom
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView([center.lat, center.lng], zoom);
  }, [center.lat, center.lng, zoom]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const marker = L.marker([markerData.position.lat, markerData.position.lng]);

      if (markerData.title) {
        marker.bindTooltip(markerData.title);
      }

      if (markerData.onClick) {
        marker.on("click", markerData.onClick);
      }

      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [markers]);

  // Update polygons
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing polygons
    polygonsRef.current.forEach((polygon) => polygon.remove());
    polygonsRef.current = [];

    // Add new polygons
    polygons.forEach((polygonData) => {
      const latlngs = polygonData.path.map((coord) => [coord.lat, coord.lng] as L.LatLngTuple);

      const polygon = L.polygon(latlngs, {
        color: polygonData.strokeColor || "#FF0000",
        weight: 2,
        opacity: 0.8,
        fillColor: polygonData.fillColor || "#FF0000",
        fillOpacity: polygonData.fillOpacity || 0.35,
      });

      if (polygonData.title) {
        polygon.bindPopup(polygonData.title);
      }

      polygon.addTo(mapRef.current!);
      polygonsRef.current.push(polygon);
    });
  }, [polygons]);

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
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
    </div>
  );
}
