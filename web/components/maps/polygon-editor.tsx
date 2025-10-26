"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Coordinate {
  lat: number;
  lng: number;
}

interface PolygonEditorProps {
  initialPolygon: Coordinate[];
  onChange: (polygon: Coordinate[]) => void;
  height?: number;
}

export default function PolygonEditor({
  initialPolygon,
  onChange,
  height = 400,
}: PolygonEditorProps) {
  const mapRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      // Create map centered on initial polygon or default location
      const center =
        initialPolygon.length > 0
          ? [initialPolygon[0].lat, initialPolygon[0].lng]
          : [-33.8688, 151.2093]; // Sydney default

      const map = L.map("polygon-editor-map").setView(
        center as [number, number],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;

      // Create feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);
      drawnItemsRef.current = drawnItems;

      // Initialize draw control
      const drawControl = new L.Control.Draw({
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: "#3b82f6",
              weight: 2,
            },
          },
          polyline: false,
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItems,
          remove: true,
        },
      });
      map.addControl(drawControl);

      // Handle polygon creation
      map.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        drawnItems.clearLayers(); // Remove existing polygon
        drawnItems.addLayer(layer);

        const latlngs = layer.getLatLngs()[0];
        const coordinates = latlngs.map((latlng: L.LatLng) => ({
          lat: latlng.lat,
          lng: latlng.lng,
        }));

        onChange(coordinates);
      });

      // Handle polygon editing
      map.on(L.Draw.Event.EDITED, (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: any) => {
          const latlngs = layer.getLatLngs()[0];
          const coordinates = latlngs.map((latlng: L.LatLng) => ({
            lat: latlng.lat,
            lng: latlng.lng,
          }));

          onChange(coordinates);
        });
      });

      // Handle polygon deletion
      map.on(L.Draw.Event.DELETED, () => {
        onChange([]);
      });
    }

    // Add initial polygon if exists
    if (
      initialPolygon.length > 0 &&
      drawnItemsRef.current &&
      !polygonLayerRef.current
    ) {
      const latlngs = initialPolygon.map((coord) => [coord.lat, coord.lng]);

      const polygon = L.polygon(latlngs as L.LatLngExpression[], {
        color: "#3b82f6",
        weight: 2,
      });

      drawnItemsRef.current.addLayer(polygon);
      polygonLayerRef.current = polygon;

      // Fit map to polygon bounds
      if (mapRef.current) {
        mapRef.current.fitBounds(polygon.getBounds());
      }
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        polygonLayerRef.current = null;
        drawnItemsRef.current = null;
      }
    };
  }, []);

  // Update polygon when initialPolygon changes
  useEffect(() => {
    if (drawnItemsRef.current && mapRef.current) {
      drawnItemsRef.current.clearLayers();
      polygonLayerRef.current = null;

      if (initialPolygon.length > 0) {
        const latlngs = initialPolygon.map((coord) => [coord.lat, coord.lng]);

        const polygon = L.polygon(latlngs as L.LatLngExpression[], {
          color: "#3b82f6",
          weight: 2,
        });

        drawnItemsRef.current.addLayer(polygon);
        polygonLayerRef.current = polygon;

        mapRef.current.fitBounds(polygon.getBounds());
      }
    }
  }, [initialPolygon]);

  return (
    <div
      id="polygon-editor-map"
      style={{ height: `${height}px`, width: "100%" }}
      className="rounded-md border"
    />
  );
}
