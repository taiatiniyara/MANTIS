"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface InfringementHeatmapProps {
  infringements: Array<{
    id: string;
    latitude: number;
    longitude: number;
    type?: string;
  }>;
  height?: string;
}

export function InfringementHeatmap({
  infringements,
  height = "600px",
}: InfringementHeatmapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const heatLayerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Calculate center from infringements
    const center =
      infringements.length > 0
        ? {
            lat:
              infringements.reduce((sum, inf) => sum + inf.latitude, 0) /
              infringements.length,
            lng:
              infringements.reduce((sum, inf) => sum + inf.longitude, 0) /
              infringements.length,
          }
        : { lat: -18.1416, lng: 178.4419 };

    const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setIsLoading(false);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing heatmap layer
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Convert infringements to heatmap data format
    const heatmapData = infringements
      .filter((inf) => inf.latitude && inf.longitude)
      .map((inf) => [inf.latitude, inf.longitude, 0.5] as [number, number, number]);

    if (heatmapData.length > 0) {
      // @ts-ignore - leaflet.heat types
      const heatLayer = (L as any).heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: "blue",
          0.5: "lime",
          0.7: "yellow",
          1.0: "red",
        },
      });

      heatLayer.addTo(mapRef.current);
      heatLayerRef.current = heatLayer;
    }
  }, [infringements]);

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Infringement Hotspots</h3>
        <p className="text-sm text-muted-foreground">
          Showing {infringements.length} infringements with location data
        </p>
      </div>
      
      <div className="relative" style={{ height }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading heatmap...</p>
            </div>
          </div>
        )}
        
        <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      </div>
    </Card>
  );
}
