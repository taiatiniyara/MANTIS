"use client";

import { useState, useCallback } from "react";
import { MapComponent } from "./map-component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLocation?: { lat: number; lng: number };
  label?: string;
}

export function LocationPicker({
  onLocationSelect,
  initialLocation,
  label = "Select Location",
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(initialLocation || null);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setSelectedLocation({ lat, lng });
      
      // Reverse geocode to get address
      // @ts-ignore - Google Maps loaded dynamically
      if (typeof window.google !== "undefined") {
        // @ts-ignore
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat, lng } },
          (results: any, status: any) => {
            if (status === "OK" && results && results[0]) {
              const formattedAddress = results[0].formatted_address;
              setAddress(formattedAddress);
              onLocationSelect(lat, lng, formattedAddress);
            } else {
              onLocationSelect(lat, lng);
            }
          }
        );
      } else {
        onLocationSelect(lat, lng);
      }
    },
    [onLocationSelect]
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // @ts-ignore - Google Maps loaded dynamically
    if (typeof window.google !== "undefined") {
      // @ts-ignore
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery }, (results: any, status: any) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          setSelectedLocation({ lat, lng });
          setAddress(results[0].formatted_address);
          onLocationSelect(lat, lng, results[0].formatted_address);
        } else {
          alert("Location not found. Please try a different search.");
        }
      });
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          handleMapClick(lat, lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your current location. Please select manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>{label}</Label>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
          <Button onClick={handleUseCurrentLocation} variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Current
          </Button>
        </div>
      </div>

      <MapComponent
        center={selectedLocation || { lat: -18.1416, lng: 178.4419 }}
        zoom={selectedLocation ? 15 : 12}
        markers={
          selectedLocation
            ? [
                {
                  id: "selected",
                  position: selectedLocation,
                  title: "Selected Location",
                },
              ]
            : []
        }
        onMapClick={handleMapClick}
        height="400px"
      />

      {selectedLocation && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-1">Selected Location:</p>
          <p className="text-xs text-muted-foreground mb-1">
            Latitude: {selectedLocation.lat.toFixed(6)}, Longitude:{" "}
            {selectedLocation.lng.toFixed(6)}
          </p>
          {address && (
            <p className="text-xs text-muted-foreground">Address: {address}</p>
          )}
        </div>
      )}
    </div>
  );
}
