import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { useAuth } from "@/contexts/auth-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import CameraScreen, { type CapturedPhoto } from "@/components/camera-screen";
import LocationPickerMobile from "@/components/maps/location-picker-mobile";
import {
  searchVehicle,
  getOffences,
  createInfringement,
  uploadEvidencePhotos,
  type Offence,
  type Vehicle,
} from "@/lib/api/infringements";
import {
  addToSyncQueue,
  isOnline,
  tryBackgroundSync,
} from "@/lib/api/sync-queue";

export default function CreateInfringementScreen() {
  const { profile } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  // Form state
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [driverLicence, setDriverLicence] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedOffence, setSelectedOffence] = useState<Offence | null>(null);
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [gpsCoordinates, setGpsCoordinates] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  // UI state
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleFound, setVehicleFound] = useState<Vehicle | null>(null);
  const [vehicleNotFound, setVehicleNotFound] = useState(false);
  const [offences, setOffences] = useState<Offence[]>([]);
  const [offencesLoading, setOffencesLoading] = useState(true);
  const [showOffencePicker, setShowOffencePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Load offences and check network on mount
  useEffect(() => {
    loadOffences();
    checkNetworkStatus();
  }, []);

  const checkNetworkStatus = async () => {
    const online = await isOnline();
    setIsOffline(!online);
  };

  const loadOffences = async () => {
    try {
      setOffencesLoading(true);
      const data = await getOffences();
      setOffences(data);
    } catch (error: any) {
      Alert.alert("Error", "Failed to load offences: " + error.message);
    } finally {
      setOffencesLoading(false);
    }
  };

  const handleVehicleLookup = async () => {
    if (!registrationNumber.trim()) {
      Alert.alert("Error", "Please enter a registration number");
      return;
    }

    try {
      setVehicleLoading(true);
      setVehicleFound(null);
      setVehicleNotFound(false);

      const vehicle = await searchVehicle(registrationNumber);

      if (vehicle) {
        setVehicleFound(vehicle);
        setVehicleNotFound(false);
      } else {
        setVehicleFound(null);
        setVehicleNotFound(true);
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to search vehicle: " + error.message);
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleGetLocation = async () => {
    try {
      setLocationLoading(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is required to capture GPS coordinates for the infringement.",
          [{ text: "OK" }]
        );
        return;
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy } = position.coords;

      setGpsCoordinates({
        latitude,
        longitude,
        accuracy: accuracy || 0,
      });

      // Auto-fill location description with coordinates
      const accuracyText = accuracy ? ` (±${Math.round(accuracy)}m)` : "";
      const locationText = `${latitude.toFixed(6)}, ${longitude.toFixed(
        6
      )}${accuracyText}`;

      if (!location.trim()) {
        setLocation(locationText);
      } else {
        setLocation(`${location}\nGPS: ${locationText}`);
      }

      Alert.alert(
        "Location Captured",
        `GPS coordinates captured with ${
          accuracy ? Math.round(accuracy) + "m" : "unknown"
        } accuracy.`,
        [{ text: "OK" }]
      );
    } catch (error: any) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get location: " + error.message);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleMapLocationSelect = (locationData: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setGpsCoordinates({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: 0, // Map selection has no accuracy reading
    });

    // Update location description with address
    setLocation(locationData.address);
  };

  const handlePhotosCaptured = (capturedPhotos: CapturedPhoto[]) => {
    setPhotos(capturedPhotos);
  };

  const removePhoto = (id: string) => {
    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setPhotos(photos.filter((photo) => photo.id !== id));
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!registrationNumber.trim()) {
      Alert.alert("Validation Error", "Please enter a registration number");
      return;
    }

    if (!selectedOffence) {
      Alert.alert("Validation Error", "Please select an offence");
      return;
    }

    if (!location.trim()) {
      Alert.alert("Validation Error", "Please enter a location");
      return;
    }

    try {
      setSubmitting(true);

      // Check network status
      const online = await isOnline();
      setIsOffline(!online);

      if (!online) {
        // Save offline and queue for sync
        const localId = await addToSyncQueue({
          vehicle_reg_number: registrationNumber,
          offence_id: selectedOffence.id,
          driver_licence_number: driverLicence.trim() || undefined,
          location_description: location.trim(),
          notes: notes.trim() || undefined,
          photos: photos,
          gps_coordinates: gpsCoordinates || undefined,
        });

        Alert.alert(
          "Saved Offline",
          `Infringement saved locally and will sync when you're back online.${
            photos.length > 0
              ? ` ${photos.length} photo(s) will be uploaded when synced.`
              : ""
          }`,
          [
            {
              text: "OK",
              onPress: () => {
                resetForm();
                router.push("/(tabs)/infringements");
              },
            },
          ]
        );
        return;
      }

      // Online: Create immediately
      const infringement = await createInfringement({
        vehicle_reg_number: registrationNumber,
        offence_id: selectedOffence.id,
        driver_licence_number: driverLicence.trim() || undefined,
        location_description: location.trim(),
        notes: notes.trim() || undefined,
      });

      // Upload photos if any
      if (photos.length > 0) {
        try {
          await uploadEvidencePhotos(infringement.id, photos);
        } catch (photoError: any) {
          console.warn("Failed to upload photos:", photoError);
          Alert.alert(
            "Warning",
            "Infringement created but some photos failed to upload. You can try uploading them again later.",
            [{ text: "OK" }]
          );
        }
      }

      Alert.alert(
        "Success",
        `Infringement created successfully${
          photos.length > 0 ? " with " + photos.length + " photo(s)" : ""
        }`,
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              router.push("/(tabs)/infringements");
            },
          },
        ]
      );
    } catch (error: any) {
      // If online creation fails, offer to save offline
      const online = await isOnline();
      if (online) {
        Alert.alert("Error", "Failed to create infringement: " + error.message);
      } else {
        Alert.alert(
          "Connection Error",
          "Could not create infringement. Would you like to save it offline?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Save Offline",
              onPress: async () => {
                try {
                  await addToSyncQueue({
                    vehicle_reg_number: registrationNumber,
                    offence_id: selectedOffence!.id,
                    driver_licence_number: driverLicence.trim() || undefined,
                    location_description: location.trim(),
                    notes: notes.trim() || undefined,
                    photos: photos,
                    gps_coordinates: gpsCoordinates || undefined,
                  });

                  Alert.alert(
                    "Saved Offline",
                    "Infringement saved locally and will sync when online.",
                    [
                      {
                        text: "OK",
                        onPress: () => {
                          resetForm();
                          router.push("/(tabs)/infringements");
                        },
                      },
                    ]
                  );
                } catch (offlineError: any) {
                  Alert.alert(
                    "Error",
                    "Failed to save offline: " + offlineError.message
                  );
                }
              },
            },
          ]
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setRegistrationNumber("");
    setDriverLicence("");
    setLocation("");
    setNotes("");
    setSelectedOffence(null);
    setVehicleFound(null);
    setVehicleNotFound(false);
    setPhotos([]);
    setGpsCoordinates(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Infringement</Text>
          <Text style={styles.subtitle}>Issue a new traffic infringement</Text>

          {/* Offline Indicator */}
          {isOffline && (
            <View style={styles.offlineBanner}>
              <IconSymbol name="wifi.slash" size={16} color="#f59e0b" />
              <Text style={styles.offlineText}>
                Offline Mode - Infringements will sync when connected
              </Text>
            </View>
          )}
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Vehicle Registration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>

            <Text style={styles.label}>
              Registration Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="e.g., AB1234"
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!submitting}
              />
              <TouchableOpacity
                style={styles.lookupButton}
                onPress={handleVehicleLookup}
                disabled={vehicleLoading || submitting}
              >
                {vehicleLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <IconSymbol name="magnifyingglass" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>

            {/* Vehicle Found */}
            {vehicleFound && (
              <View style={styles.vehicleCard}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={24}
                  color="#10b981"
                />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleReg}>
                    {vehicleFound.reg_number}
                  </Text>
                  {(vehicleFound.make || vehicleFound.model) && (
                    <Text style={styles.vehicleDetails}>
                      {[
                        vehicleFound.make,
                        vehicleFound.model,
                        vehicleFound.year,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </Text>
                  )}
                  {vehicleFound.color && (
                    <Text style={styles.vehicleDetails}>
                      Color: {vehicleFound.color}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Vehicle Not Found */}
            {vehicleNotFound && (
              <View style={[styles.vehicleCard, styles.vehicleNotFound]}>
                <IconSymbol
                  name="exclamationmark.triangle.fill"
                  size={24}
                  color="#f59e0b"
                />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleNotFoundText}>
                    Vehicle not found in system
                  </Text>
                  <Text style={styles.vehicleNotFoundSubtext}>
                    A new vehicle record will be created
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Driver Licence */}
          <View style={styles.section}>
            <Text style={styles.label}>Driver Licence Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              value={driverLicence}
              onChangeText={setDriverLicence}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!submitting}
            />
          </View>

          {/* Offence Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Offence <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowOffencePicker(!showOffencePicker)}
              disabled={offencesLoading || submitting}
            >
              <View style={styles.pickerContent}>
                {selectedOffence ? (
                  <View>
                    <Text style={styles.pickerValue}>
                      {selectedOffence.code}
                    </Text>
                    <Text style={styles.pickerSubtext}>
                      {selectedOffence.description}
                    </Text>
                    <Text style={styles.pickerAmount}>
                      Fine: ${selectedOffence.base_fine_amount.toFixed(2)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.pickerPlaceholder}>
                    Select an offence
                  </Text>
                )}
              </View>
              <IconSymbol
                name={showOffencePicker ? "chevron.up" : "chevron.down"}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>

            {/* Offence Picker */}
            {showOffencePicker && (
              <View style={styles.offenceList}>
                {offencesLoading ? (
                  <ActivityIndicator style={styles.loader} />
                ) : (
                  offences.map((offence) => (
                    <TouchableOpacity
                      key={offence.id}
                      style={[
                        styles.offenceItem,
                        selectedOffence?.id === offence.id &&
                          styles.offenceItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedOffence(offence);
                        setShowOffencePicker(false);
                      }}
                    >
                      <View style={styles.offenceItemContent}>
                        <Text style={styles.offenceCode}>{offence.code}</Text>
                        <Text style={styles.offenceDescription}>
                          {offence.description}
                        </Text>
                        {offence.category && (
                          <Text style={styles.offenceCategory}>
                            {offence.category}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.offenceAmount}>
                        ${offence.base_fine_amount.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Location <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Kings Road near Suva Market"
              value={location}
              onChangeText={setLocation}
              multiline
              numberOfLines={2}
              editable={!submitting}
            />
            <Text style={styles.helperText}>
              Describe the location where the infringement occurred
            </Text>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional notes or observations"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              editable={!submitting}
            />
          </View>

          {/* Evidence Photos */}
          <View style={styles.section}>
            <Text style={styles.label}>Evidence Photos</Text>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(true)}
              disabled={submitting}
            >
              <IconSymbol name="camera.fill" size={24} color="#F97316" />
              <Text style={styles.cameraButtonText}>
                {photos.length > 0
                  ? `${photos.length} Photo${
                      photos.length > 1 ? "s" : ""
                    } Attached`
                  : "Capture Evidence Photos"}
              </Text>
              <IconSymbol name="chevron.right" size={20} color="#94a3b8" />
            </TouchableOpacity>

            {/* Photo Preview */}
            {photos.length > 0 && (
              <View style={styles.photoPreviewContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {photos.map((photo) => (
                    <View key={photo.id} style={styles.photoPreview}>
                      <Image
                        source={{ uri: photo.uri }}
                        style={styles.photoImage}
                      />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => removePhoto(photo.id)}
                      >
                        <IconSymbol
                          name="xmark.circle.fill"
                          size={24}
                          color="#ef4444"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
            <Text style={styles.helperText}>
              Capture photos of the vehicle and infringement
            </Text>
          </View>

          {/* GPS Capture */}
          <View style={styles.section}>
            <Text style={styles.label}>GPS Coordinates</Text>
            
            <View style={styles.locationButtonsContainer}>
              <TouchableOpacity
                style={[styles.locationButton, styles.locationButtonPrimary]}
                onPress={handleGetLocation}
                disabled={locationLoading || submitting}
              >
                {locationLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <IconSymbol
                      name="location.fill"
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.locationButtonTextPrimary}>
                      Use GPS
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.locationButton, styles.locationButtonSecondary]}
                onPress={() => setShowMapPicker(true)}
                disabled={submitting}
              >
                <IconSymbol
                  name="map.fill"
                  size={20}
                  color="#F97316"
                />
                <Text style={styles.locationButtonTextSecondary}>
                  Pick on Map
                </Text>
              </TouchableOpacity>
            </View>

            {gpsCoordinates && (
              <View style={styles.gpsInfoCard}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={20}
                  color="#10b981"
                />
                <View style={styles.gpsInfoTextContainer}>
                  <Text style={styles.gpsCoordinatesText}>
                    {gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}
                  </Text>
                  {gpsCoordinates.accuracy > 0 && (
                    <Text style={styles.gpsAccuracyText}>
                      Accuracy: ±{Math.round(gpsCoordinates.accuracy)}m
                    </Text>
                  )}
                </View>
              </View>
            )}
            <Text style={styles.helperText}>
              Use GPS for current location or pick precise location on map
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Create Infringement</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CameraScreen
          visible={showCamera}
          onClose={() => setShowCamera(false)}
          onPhotosCaptured={handlePhotosCaptured}
          maxPhotos={5}
          existingPhotos={photos}
        />
      </Modal>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>Select Location</Text>
            <TouchableOpacity
              style={styles.mapModalCloseButton}
              onPress={() => setShowMapPicker(false)}
            >
              <IconSymbol name="xmark.circle.fill" size={28} color="#64748b" />
            </TouchableOpacity>
          </View>
          
          <LocationPickerMobile
            initialLocation={gpsCoordinates || undefined}
            onLocationSelect={handleMapLocationSelect}
            height={600}
          />

          <View style={styles.mapModalFooter}>
            <TouchableOpacity
              style={styles.mapModalConfirmButton}
              onPress={() => setShowMapPicker(false)}
            >
              <IconSymbol name="checkmark.circle.fill" size={24} color="#fff" />
              <Text style={styles.mapModalConfirmText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#fff",
    padding: 24,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },
  required: {
    color: "#ef4444",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  inputFlex: {
    flex: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  lookupButton: {
    backgroundColor: "#F97316",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  },
  vehicleCard: {
    flexDirection: "row",
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    alignItems: "center",
    gap: 12,
  },
  vehicleNotFound: {
    backgroundColor: "#fffbeb",
    borderColor: "#fcd34d",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleReg: {
    fontSize: 16,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 2,
  },
  vehicleDetails: {
    fontSize: 14,
    color: "#15803d",
  },
  vehicleNotFoundText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b45309",
    marginBottom: 2,
  },
  vehicleNotFoundSubtext: {
    fontSize: 12,
    color: "#ca8a04",
  },
  pickerButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerContent: {
    flex: 1,
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: "#94a3b8",
  },
  pickerValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  pickerSubtext: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  pickerAmount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F97316",
  },
  offenceList: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 300,
  },
  loader: {
    padding: 32,
  },
  offenceItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
    gap: 12,
  },
  offenceItemSelected: {
    backgroundColor: "#eff6ff",
  },
  offenceItemContent: {
    flex: 1,
  },
  offenceCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  offenceDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  offenceCategory: {
    fontSize: 12,
    color: "#94a3b8",
  },
  offenceAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F97316",
  },
  helperText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#F97316",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cameraButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cameraButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  photoPreviewContainer: {
    marginTop: 12,
  },
  photoPreview: {
    marginRight: 8,
    position: "relative",
  },
  photoImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  removePhotoButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  gpsButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  gpsButtonText: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  gpsButtonTextCaptured: {
    color: "#10b981",
    fontWeight: "600",
  },
  gpsCoordinatesText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  offlineText: {
    flex: 1,
    fontSize: 13,
    color: "#b45309",
    fontWeight: "500",
  },
  // Location buttons
  locationButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  locationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  locationButtonPrimary: {
    backgroundColor: "#F97316",
  },
  locationButtonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F97316",
  },
  locationButtonTextPrimary: {
    fontSize: 15,
    color: "#fff",
    fontWeight: "600",
  },
  locationButtonTextSecondary: {
    fontSize: 15,
    color: "#F97316",
    fontWeight: "600",
  },
  // GPS info card
  gpsInfoCard: {
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  gpsInfoTextContainer: {
    flex: 1,
  },
  gpsAccuracyText: {
    fontSize: 12,
    color: "#16a34a",
    marginTop: 4,
  },
  // Map modal
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  mapModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  mapModalCloseButton: {
    padding: 4,
  },
  mapModalFooter: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  mapModalConfirmButton: {
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapModalConfirmText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});
