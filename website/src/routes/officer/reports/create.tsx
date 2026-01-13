import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxEmpty,
} from "@/components/ui/combobox";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, MapPin, Search, Camera, X } from "lucide-react";
import { MapPicker } from "@/components/ui/map";

export const Route = createFileRoute("/officer/reports/create")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user, userMetadata } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Offences state
  const [offences, setOffences] = useState<any[]>([]);
  const [isLoadingOffences, setIsLoadingOffences] = useState(true);
  const [selectedOffence, setSelectedOffence] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    offenceCode: "",
    description: "",
    fineAmount: "",
    vehiclePlate: "",
    driverName: "",
    driverLicense: "",
    location: "",
    latitude: -18.1416, // Default to Suva, Fiji
    longitude: 178.4419,
  });

  // Fetch offences from database
  useEffect(() => {
    const fetchOffences = async () => {
      setIsLoadingOffences(true);
      try {
        const { data, error } = await supabase
          .from("offences")
          .select("*")
          .eq("active", true)
          .order("code", { ascending: true });

        if (error) {
          console.error("Error fetching offences:", error);
          setError("Failed to load offences list");
        } else {
          console.log("Offences loaded:", data);
          setOffences(data || []);
        }
      } catch (err) {
        console.error("Error loading offences:", err);
        setError("Failed to load offences list");
      } finally {
        setIsLoadingOffences(false);
      }
    };

    fetchOffences();
  }, []);

  // Auto-detect location on component mount
  useEffect(() => {
    detectCurrentLocation();
  }, []);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
        reverseGeocode(latitude, longitude);
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Error detecting location:", error);
        setIsDetectingLocation(false);
        // Fall back to default location (Suva, Fiji)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOffenceSelect = (offenceValue: string | null) => {
    if (!offenceValue) return;
    const offence = offences.find((o) => `${o.code} - ${o.name}` === offenceValue);
    if (offence) {
      setSelectedOffence(offence);
      // Handle both camelCase and snake_case from Supabase
      const penalty = (offence as any).fixed_penalty || (offence as any).fixedPenalty || 0;
      setFormData((prev) => ({
        ...prev,
        offenceCode: offence.code || "",
        fineAmount: penalty.toString(),
        description: offence.description || "",
      }));
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    // Reverse geocode to get address
    reverseGeocode(lat, lng);
  };

  const geocodeAddress = async () => {
    if (!formData.location.trim()) return;

    setIsGeocoding(true);
    setError(null);
    try {
      // Using Photon geocoding API - has proper CORS support
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(
          formData.location + ", Fiji",
        )}&limit=1`,
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].geometry.coordinates;
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
      } else {
        setError(
          "Location not found. Please try a different address or use the map.",
        );
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setError(
        "Geocoding service unavailable. Please use the map to select location.",
      );
    } finally {
      setIsGeocoding(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using Photon reverse geocoding API - has proper CORS support
      const response = await fetch(
        `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`,
      );

      if (!response.ok) {
        console.warn(`Reverse geocoding failed: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const properties = data.features[0].properties;

        // Build a readable address from available properties
        const parts = [
          properties.name,
          properties.street,
          properties.city || properties.district,
          properties.state,
          properties.country,
        ].filter(Boolean);

        if (parts.length > 0) {
          setFormData((prev) => ({
            ...prev,
            location: parts.join(", "),
          }));
        }
      }
    } catch (err) {
      // Silently fail - geocoding is optional
      console.warn("Reverse geocoding unavailable:", err);
      // Set a generic location based on coordinates
      setFormData((prev) => ({
        ...prev,
        location:
          prev.location || `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      }));
    }
  };

  const handlePhotoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files);
    const validPhotos = newPhotos.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isUnder10MB = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isImage && isUnder10MB;
    });

    if (validPhotos.length !== newPhotos.length) {
      setError("Some files were skipped. Only images under 10MB are allowed.");
    }

    setPhotos((prev) => [...prev, ...validPhotos]);

    // Create preview URLs
    validPhotos.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotosToSupabase = async (
    infringementId: string,
  ): Promise<string[]> => {
    if (photos.length === 0) return [];

    const uploadedPaths: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const fileExt = photo.name.split(".").pop();
      const fileName = `${infringementId}_${Date.now()}_${i}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from("evidence")
        .upload(filePath, photo, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading photo:", error);
        throw new Error(`Failed to upload photo: ${error.message}`);
      }

      if (data) {
        uploadedPaths.push(data.path);
      }
    }

    return uploadedPaths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!formData.offenceCode || !formData.fineAmount) {
        setError("Offence code and fine amount are required");
        setIsSubmitting(false);
        return;
      }

      // Parse fine amount
      const fineAmount = parseInt(formData.fineAmount);
      if (isNaN(fineAmount) || fineAmount <= 0) {
        setError("Fine amount must be a positive number");
        setIsSubmitting(false);
        return;
      }

      // Create GeoJSON Point for location with coordinates
      const locationGeoJSON = JSON.stringify({
        type: "Point",
        coordinates: [formData.longitude, formData.latitude],
        properties: {
          address: formData.location || `${formData.latitude.toFixed(6)}, ${formData.longitude.toFixed(6)}`,
        },
      });

      // Create infringement record
      const { data: infringementData, error: insertError } = await supabase
        .from("infringements")
        .insert({
          agency_id: userMetadata?.agency_id || "",
          team_id: userMetadata?.team_id || null,
          officer_id: user?.id || "",
          offence_code: formData.offenceCode,
          description: formData.description || null,
          fine_amount: fineAmount,
          location: locationGeoJSON,
          status: "pending",
          issued_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError || !infringementData) {
        console.error("Error creating infringement:", insertError);
        setError(insertError?.message || "Failed to create infringement");
        setIsSubmitting(false);
        return;
      }

      // Upload photos if any
      if (photos.length > 0) {
        try {
          setIsUploadingPhotos(true);
          const uploadedPaths = await uploadPhotosToSupabase(
            infringementData.id,
          );

          // Save evidence file records to database
          if (uploadedPaths.length > 0) {
            const evidenceRecords = uploadedPaths.map((path) => ({
              infringement_id: infringementData.id,
              file_path: path,
              file_type: "image",
            }));

            const { error: evidenceError } = await supabase
              .from("evidence_files")
              .insert(evidenceRecords);

            if (evidenceError) {
              console.error("Error saving evidence records:", evidenceError);
              // Don't fail the whole operation, just show a warning
              alert(
                "Infringement created successfully, but some evidence photos could not be saved."
              );
            }
          }
        } catch (uploadError: any) {
          console.error("Error uploading photos:", uploadError);
          // Storage RLS policy issue - show helpful message
          if (uploadError.message?.includes("row-level security")) {
            alert(
              "Infringement created successfully!\n\nNote: Photo upload failed due to storage permissions. Please contact your administrator to configure storage access policies."
            );
          } else {
            alert(
              "Infringement created successfully, but evidence photos could not be uploaded."
            );
          }
        } finally {
          setIsUploadingPhotos(false);
        }
      }

      // Success - navigate back to reports list
      navigate({ to: "/officer/reports" });
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/officer/reports" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">New Infringement</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Issue a new traffic infringement notice
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Infringement Details</CardTitle>
            <CardDescription>
              Fill in the details of the traffic violation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Offence Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Offence Information</h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="offenceCode"
                    className="required"
                  >
                    Select Offence *
                  </Label>
                  {isLoadingOffences ? (
                    <div className="text-sm text-muted-foreground">
                      Loading offences...
                    </div>
                  ) : (
                    <Combobox
                      items={offences.map(o => `${o.code} - ${o.name}`)}
                      value={selectedOffence ? `${selectedOffence.code} - ${selectedOffence.name}` : ""}
                      onValueChange={handleOffenceSelect}
                    >
                      <ComboboxInput
                        placeholder="Search offences by code or name..."
                        showTrigger
                        showClear
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>No offence found</ComboboxEmpty>
                        <ComboboxList>
                          {(label) => {
                            const offence = offences.find(o => `${o.code} - ${o.name}` === label);
                            return offence ? (
                              <ComboboxItem key={offence.id} value={label}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {offence.code} - {offence.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    FJD {(offence as any).fixed_penalty || (offence as any).fixedPenalty || 0} • {offence.severity}
                                  </span>
                                </div>
                              </ComboboxItem>
                            ) : null;
                          }}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  )}
                  {selectedOffence && (
                    <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                      <strong>Selected:</strong> {selectedOffence.code} - {selectedOffence.name}
                      <br />
                      <strong>Penalty:</strong> FJD {(selectedOffence as any).fixed_penalty || (selectedOffence as any).fixedPenalty || 0}
                      {selectedOffence.description && (
                        <>
                          <br />
                          <strong>Description:</strong> {selectedOffence.description}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="fineAmount"
                    className="required"
                  >
                    Fine Amount (FJD) *
                  </Label>
                  <Input
                    id="fineAmount"
                    name="fineAmount"
                    type="number"
                    min="1"
                    value={formData.fineAmount}
                    onChange={handleInputChange}
                    placeholder="100"
                    required
                    disabled={!!selectedOffence}
                  />
                  {selectedOffence && (
                    <p className="text-xs text-muted-foreground">
                      Auto-filled from selected offence
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Additional Notes</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add any additional details about the violation..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  Location
                  {isDetectingLocation && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Detecting your location...)
                    </span>
                  )}
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Victoria Parade, Suva"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={geocodeAddress}
                    disabled={isGeocoding || !formData.location.trim()}
                    className="w-full sm:w-auto"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isGeocoding ? "Searching..." : "Search"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isDetectingLocation
                    ? "Automatically detecting your current location..."
                    : "Enter an address and click Search, or use the map to pinpoint the location"}
                </p>

                {/* Map */}
                <div className="mt-4 h-75 sm:h-100 rounded-lg overflow-hidden border">
                  <MapPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onLocationChange={handleLocationChange}
                  />
                </div>

                {/* Coordinates Display */}
                <div className="text-xs text-muted-foreground mt-2 break-all">
                  Coordinates: {formData.latitude.toFixed(6)},{" "}
                  {formData.longitude.toFixed(6)}
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">
                Vehicle Information (Optional)
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehiclePlate">Vehicle Plate Number</Label>
                  <Input
                    id="vehiclePlate"
                    name="vehiclePlate"
                    value={formData.vehiclePlate}
                    onChange={handleInputChange}
                    placeholder="e.g., AB-1234"
                  />
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">
                Driver Information (Optional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name</Label>
                  <Input
                    id="driverName"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleInputChange}
                    placeholder="Full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverLicense">License Number</Label>
                  <Input
                    id="driverLicense"
                    name="driverLicense"
                    value={formData.driverLicense}
                    onChange={handleInputChange}
                    placeholder="License number"
                  />
                </div>
              </div>
            </div>

            {/* Evidence Photos */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">Evidence Photos</h3>
              <p className="text-xs text-muted-foreground">
                Capture photos of the violation (max 10MB per photo)
              </p>

              {/* Photo Upload Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handlePhotoSelection}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take/Upload Photos
                </Button>
                {photos.length > 0 && (
                  <span className="text-sm text-muted-foreground flex items-center">
                    {photos.length} photo{photos.length > 1 ? "s" : ""} selected
                  </span>
                )}
              </div>

              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {photoPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square"
                    >
                      <img
                        src={preview}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || isUploadingPhotos}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting
                  ? isUploadingPhotos
                    ? "Uploading photos..."
                    : "Creating..."
                  : "Create Infringement"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/officer/reports" })}
                disabled={isSubmitting || isUploadingPhotos}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
