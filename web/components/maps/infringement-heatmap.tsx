"use client";

import { useEffect, useRef, useState } from "react";
import { MapComponent } from "./map-component";
import { Card } from "@/components/ui/card";

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
  const mapRef = useRef<any>(null);
  const heatmapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initHeatmap = async () => {
      // @ts-ignore - Google Maps loaded dynamically
      if (typeof window.google === "undefined") {
        setIsLoading(false);
        return;
      }

      // Wait for map to be initialized
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!mapRef.current) return;

      // Convert infringements to heat map data
      const heatmapData = infringements
        .filter((inf) => inf.latitude && inf.longitude)
        .map(
          // @ts-ignore
          (inf) => new window.google.maps.LatLng(inf.latitude, inf.longitude)
        );

      // Create heatmap layer
      // @ts-ignore
      const heatmap = new window.google.maps.visualization.HeatmapLayer({
        data: heatmapData,
        radius: 30,
        opacity: 0.8,
      });

      heatmap.setMap(mapRef.current);
      heatmapRef.current = heatmap;
      setIsLoading(false);
    };

    initHeatmap();

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }
    };
  }, [infringements]);

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

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Infringement Hotspots</h3>
        <p className="text-sm text-muted-foreground">
          Showing {infringements.length} infringements with location data
        </p>
      </div>
      
      <div style={{ height }}>
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading heatmap...</p>
            </div>
          </div>
        )}
        
        <MapComponent
          center={center}
          zoom={12}
          height={height}
        />
      </div>
    </Card>
  );
}
