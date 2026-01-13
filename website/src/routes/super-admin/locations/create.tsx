import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { H2 } from "@/components/ui/heading";
import {
  InputWithLabel,
  SelectWithLabel,
} from "@/components/ui/inputWithLabel";
import { Label } from "@/components/ui/label";
import { MapPicker } from "@/components/ui/map";
import FormSubmission from "@/components/form";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { tableNames, type Agency, type NewLocation } from "@/lib/supabase/schema";
import LoadingComponent from "@/components/puffLoader";

export const Route = createFileRoute("/super-admin/locations/create")({
  component: RouteComponent,
});

const LOCATION_TYPES = [
  { value: "country", label: "Country" },
  { value: "division", label: "Division" },
  { value: "province", label: "Province" },
  { value: "municipal", label: "Municipal" },
  { value: "ward", label: "Ward" },
  { value: "station", label: "Station" },
  { value: "office", label: "Office" },
];

function RouteComponent() {
  const navigate = useNavigate();
  const [latitude, setLatitude] = useState(-18.1416);
  const [longitude, setLongitude] = useState(178.4419);

  const handleLocationChange = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const agencies = useSupabaseQuery<Agency>({
    queryKey: ["agencies"],
    tableName: "agencies",
  });

  if (agencies.isLoading) return <LoadingComponent />;

  if (agencies.error)
    return <div>Error loading agencies: {agencies.error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <H2>Create New Location</H2>
        <p className="text-muted-foreground mt-2">
          Add a new location to the system hierarchy
        </p>
      </div>

      <FormSubmission
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);

          const name = formData.get("name") as string;
          const type = formData.get("type") as string;
          const parent_id = formData.get("parent_id") as string;
          const agency_id = formData.get("agency_id") as string;
          // Create GeoJSON point
          const geom = JSON.stringify({
            type: "Point",
            coordinates: [longitude, latitude],
          });

          const locationData: NewLocation = {
            name: name,
            type: type,
            geom: geom,
            agency_id: agency_id
          };

          if (parent_id) locationData.parent_id = parent_id;
          if (agency_id) locationData.agency_id = agency_id;

          const { error } = await supabase
            .from(tableNames.locations)
            .insert(locationData)
            .select()
            .single();

          if (error) {
            toast.error(`Failed to create location: ${error.message}`);
          } else {
            toast.success("Location created successfully!");
            navigate({ to: "/super-admin/locations" });
          }
        }}
        btnText="Create Location"
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <InputWithLabel
              label="Location Name"
              name="name"
              type="text"
              placeholder="e.g., Suva City Council Office"
              required
            />
          </div>

          <SelectWithLabel
            label="Location Type"
            name="type"
            options={LOCATION_TYPES}
          />

          <InputWithLabel
            label="Parent Location ID (Optional)"
            name="parent_id"
            type="text"
            placeholder="UUID of parent location"
          />

          <SelectWithLabel
            label="Associated Agency (Optional)"
            name="agency_id"
            options={agencies.data!.map((agency) => ({
              value: agency.id,
              label: agency.name,
            }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Location on Map</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Click on the map to set the location coordinates
          </p>
          <MapPicker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={handleLocationChange}
          />
          <div className="grid grid-cols-2 gap-4 mt-4">
            <InputWithLabel
              label="Latitude"
              name="latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              required
            />
            <InputWithLabel
              label="Longitude"
              name="longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              required
            />
          </div>
        </div>
      </FormSubmission>
    </div>
  );
}
