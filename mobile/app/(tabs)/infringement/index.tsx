import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  Image as RNImage,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { 
  infringements, 
  infringementTypes, 
  categories as categoriesAPI, 
  storage 
} from "@/lib/supabase";
import { gpsService, LocationData } from "@/lib/gps-service";
import { geocodingService, GeocodedAddress } from "@/lib/geocoding-service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { CameraView, useCameraPermissions } from "expo-camera";
import { WatermarkedImage } from "@/components/watermarked-image";
import { MapWithSearch } from "@/components/map-with-search";

interface InfringementCategory {
  id: string;
  name: string;
}

interface InfringementType {
  id: string;
  code: string;
  description: string;
  fine_amount: number;
  category_id?: string;
}

export default function RecordScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<InfringementCategory[]>([]);
  const [types, setTypes] = useState<InfringementType[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [isOnline, setIsOnline] = useState(true);

  // Form fields
  const [vehicleId, setVehicleId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");

  // Type picker modal
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Map picker modal
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Camera modal
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [watermarkedPhotos, setWatermarkedPhotos] = useState<string[]>([]);
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);

  // Auto-generate notes when form data changes
  useEffect(() => {
    generateDescription();
    generateNotes();
  }, [vehicleId, selectedType, location]);

  // Filtered types based on search
  const filteredTypes = types.filter((type) => {
    const matchesSearch =
      searchQuery === "" ||
      type.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory =
      !selectedCategory || type.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        setCapturedPhotos((prev) => [...prev, photo.uri]);
        Alert.alert("Success", "Photo captured! Processing watermark...");
        setProcessingPhoto(true);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to capture photo");
    }
  };

  const handleWatermarkedCapture = (
    originalUri: string,
    watermarkedUri: string
  ) => {
    setWatermarkedPhotos((prev) => [...prev, watermarkedUri]);
    setProcessingPhoto(false);
    console.log("Watermarked photo ready:", watermarkedUri);
  };

  const generateDescription = () => {
    if (!vehicleId && !selectedType) {
      setDescription("");
      return;
    }

    const parts: string[] = [];

    // Add vehicle info
    if (vehicleId.trim()) {
      parts.push(vehicleId.trim().toUpperCase());
    }

    // Add infringement type code only
    if (selectedType) {
      const typeData = types.find((t) => t.id === selectedType);
      if (typeData) {
        parts.push(typeData.code);
      }
    }

    // Add short timestamp
    const now = new Date();
    const shortDate = now.toLocaleDateString("en-FJ", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    parts.push(shortDate);

    // Create short description
    const desc = parts.join(" - ");
    setDescription(desc);
  };

  const generateNotes = () => {
    if (!vehicleId && !selectedType && !location) {
      setNotes("");
      return;
    }

    const parts: string[] = [];

    // Add vehicle info
    if (vehicleId.trim()) {
      parts.push(`Vehicle: ${vehicleId.trim().toUpperCase()}`);
    }

    // Add infringement type details
    if (selectedType) {
      const typeData = types.find((t) => t.id === selectedType);
      if (typeData) {
        parts.push(`Violation: ${typeData.code} - ${typeData.description}`);
        parts.push(`Fine Amount: $${typeData.fine_amount}`);
      }
    }

    // Add location details
    if (location) {
      // Add address if available
      if (locationAddress) {
        parts.push(`Location: ${locationAddress}`);
      }
      // Add coordinates
      parts.push(
        `Coordinates: ${location.latitude.toFixed(
          6
        )}, ${location.longitude.toFixed(6)}`
      );
    }

    // Add timestamp (shorter format)
    const now = new Date();
    const timestamp = now.toLocaleString("en-FJ", {
      dateStyle: "short",
      timeStyle: "short",
    });
    parts.push(`Recorded: ${timestamp}`);

    // Add officer info
    if (profile?.full_name) {
      parts.push(`Recording Officer: ${profile.full_name}`);
    }
    if (profile?.position) {
      parts.push(`Position: ${profile.position}`);
    }
    if (profile?.agency_id) {
      parts.push(`Agency: Fiji Police Force`); // TODO: Fetch agency name from database
    }

    setNotes(parts.join("\n"));
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check connectivity
      const netInfo = await NetInfo.fetch();
      setIsOnline(netInfo.isConnected ?? false);

      // Get current location
      const hasPermission = await gpsService.hasPermissions();
      if (hasPermission) {
        const loc = await gpsService.getCurrentLocation();
        setLocation(loc);
        
        // Geocode the location to get address
        if (loc) {
          const address = await geocodingService.reverseGeocode(
            loc.latitude,
            loc.longitude
          );
          if (address) {
            setLocationAddress(address.formattedAddress);
          }
        }
      } else {
        Alert.alert(
          "GPS Required",
          "Location permission is needed to record infringements",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Enable GPS",
              onPress: async () => {
                const result = await gpsService.requestPermissions();
                if (result.granted) {
                  const loc = await gpsService.getCurrentLocation();
                  setLocation(loc);
                }
              },
            },
          ]
        );
      }

      // Load infringement types
      if (netInfo.isConnected) {
        const [typesResult, categoriesResult] = await Promise.all([
          infringementTypes.list(),
          categoriesAPI.list(),
        ]);
        
        if (typesResult.error) {
          console.error("Error loading types:", typesResult.error);
          Alert.alert("Error", "Failed to load infringement types");
        } else if (typesResult.data) {
          setTypes(typesResult.data);
          // Cache types for offline use
          await AsyncStorage.setItem(
            "infringement_types",
            JSON.stringify(typesResult.data)
          );
        }

        if (categoriesResult.error) {
          console.error("Error loading categories:", categoriesResult.error);
        } else if (categoriesResult.data) {
          setCategories(categoriesResult.data);
          // Cache categories for offline use
          await AsyncStorage.setItem(
            "infringement_categories",
            JSON.stringify(categoriesResult.data)
          );
        }
      } else {
        // Load cached types and categories
        const [cachedTypes, cachedCategories] = await Promise.all([
          AsyncStorage.getItem("infringement_types"),
          AsyncStorage.getItem("infringement_categories"),
        ]);
        
        if (cachedTypes) {
          setTypes(JSON.parse(cachedTypes));
        }
        if (cachedCategories) {
          setCategories(JSON.parse(cachedCategories));
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load required data");
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    try {
      const loc = await gpsService.getCurrentLocation();
      setLocation(loc);
      
      // Geocode the location to get address
      if (loc) {
        const address = await geocodingService.reverseGeocode(
          loc.latitude,
          loc.longitude
        );
        if (address) {
          setLocationAddress(address.formattedAddress);
        }
      }
      
      Alert.alert("Success", "Location updated");
    } catch (error) {
      Alert.alert("Error", "Failed to get current location");
    }
  };

  const handleMapLocationSelect = (address: GeocodedAddress) => {
    // Update location from map selection
    setLocation({
      latitude: address.latitude,
      longitude: address.longitude,
      accuracy: null,
      altitude: null,
      speed: null,
      heading: null,
      timestamp: Date.now(),
    });
    setLocationAddress(address.formattedAddress);
    setShowMapPicker(false);
    Alert.alert("Success", "Location selected from map");
  };

  const validateForm = (): boolean => {
    if (!vehicleId.trim()) {
      Alert.alert("Validation Error", "Vehicle ID is required");
      return false;
    }

    if (!selectedType) {
      Alert.alert("Validation Error", "Please select an infringement type");
      return false;
    }

    if (!location) {
      Alert.alert(
        "Validation Error",
        "Location is required. Please enable GPS and retry."
      );
      return false;
    }

    return true;
  };

  const saveOffline = async (data: any) => {
    try {
      const queue = await AsyncStorage.getItem("offline_infringements");
      const queueData = queue ? JSON.parse(queue) : [];
      queueData.push({
        ...data,
        offline: true,
        created_at: new Date().toISOString(),
      });
      await AsyncStorage.setItem(
        "offline_infringements",
        JSON.stringify(queueData)
      );

      Alert.alert(
        "Saved Offline",
        "Infringement saved locally. It will sync when you are online.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Error saving offline:", error);
      Alert.alert("Error", "Failed to save infringement offline");
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const selectedTypeData = types.find((t) => t.id === selectedType);
      if (!selectedTypeData) {
        throw new Error("Invalid infringement type");
      }

      const infringementData = {
        vehicle_id: vehicleId.trim().toUpperCase(),
        type_id: selectedType,
        officer_id: profile?.id,
        latitude: location!.latitude,
        longitude: location!.longitude,
        // location_address: locationAddress || null, // TODO: Add this column to database first
        description: description.trim() || null,
        notes: notes.trim() || null,
        issued_at: new Date().toISOString(),
      };

      // Check if online
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        // Save offline
        await saveOffline(infringementData);
        return;
      }

      // New Infringement first
      const { data: infringementRecord, error } = await infringements.create(
        infringementData
      );

      if (error) {
        throw error;
      }

      // Upload watermarked photos if any
      let uploadedPhotosCount = 0;
      if (watermarkedPhotos.length > 0 && infringementRecord?.id) {
        Alert.alert(
          "Uploading",
          `Uploading ${watermarkedPhotos.length} photo(s)...`
        );

        for (let i = 0; i < watermarkedPhotos.length; i++) {
          const photoUri = watermarkedPhotos[i];
          const timestamp = new Date().getTime();
          const fileName = `${infringementRecord.id}_${timestamp}_${i}.jpg`;

          try {
            const { error: uploadError } = await storage.uploadPhotoFromUri(
              fileName,
              photoUri,
              "evidence-photos"
            );

            if (uploadError) {
              console.error("Error uploading photo:", uploadError);
            } else {
              uploadedPhotosCount++;
            }
          } catch (uploadErr) {
            console.error("Exception uploading photo:", uploadErr);
          }
        }
      }

      const successMessage =
        watermarkedPhotos.length > 0
          ? `Infringement recorded successfully! ${uploadedPhotosCount} of ${watermarkedPhotos.length} photo(s) uploaded.`
          : "Infringement recorded successfully";

      Alert.alert("Success", successMessage, [
        {
          text: "Record Another",
          onPress: () => {
            // Clear form
            setVehicleId("");
            setSelectedType(null);
            setDescription("");
            setNotes("");
            setCapturedPhotos([]);
            setWatermarkedPhotos([]);
            refreshLocation();
          },
        },
        {
          text: "Done",
          onPress: () => {
            // Clear form and go back
            setVehicleId("");
            setSelectedType(null);
            setDescription("");
            setNotes("");
            setCapturedPhotos([]);
            setWatermarkedPhotos([]);
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error submitting infringement:", error);

      // If network error, offer to save offline
      if (
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      ) {
        Alert.alert("Network Error", "Unable to submit online. Save offline?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save Offline",
            onPress: async () => {
              await saveOffline({
                vehicle_id: vehicleId.trim().toUpperCase(),
                type_id: selectedType,
                officer_id: profile?.id,
                latitude: location!.latitude,
                longitude: location!.longitude,
                description: description.trim() || null,
                notes: notes.trim() || null,
                issued_at: new Date().toISOString(),
              });
            },
          },
        ]);
      } else {
        Alert.alert(
          "Error",
          "Failed to record infringement. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top"]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Record Infringement</Text>
          </View>

          {/* Status Bar */}
          <View style={styles.statusBar}>
            <View
              style={[
                styles.statusBadge,
                isOnline ? styles.online : styles.offline,
              ]}
            >
              <Ionicons
                name={isOnline ? "wifi" : "wifi-outline"}
                size={14}
                color={isOnline ? "#10B981" : "#EF4444"}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.statusText}>
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
            {location && (
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={refreshLocation}
              >
                <Ionicons
                  name="refresh"
                  size={16}
                  color="#007AFF"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.refreshText}>Refresh GPS</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Location Card */}
          {location ? (
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Ionicons name="location" size={18} color="#10B981" />
                <Text style={styles.locationTitle}>Current Location</Text>
                <TouchableOpacity
                  style={styles.mapButton}
                  onPress={() => setShowMapPicker(true)}
                >
                  <Ionicons name="map" size={16} color="#007AFF" />
                  <Text style={styles.mapButtonText}>Map</Text>
                </TouchableOpacity>
              </View>
              
              {/* Editable Address Field */}
              <View style={styles.addressInputContainer}>
                <Text style={styles.addressLabel}>Address:</Text>
                <TextInput
                  style={styles.addressInput}
                  value={locationAddress}
                  onChangeText={setLocationAddress}
                  placeholder="Enter address manually if needed..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={2}
                />
                <TouchableOpacity
                  style={styles.addressRefreshButton}
                  onPress={async () => {
                    if (location) {
                      const address = await geocodingService.reverseGeocode(
                        location.latitude,
                        location.longitude
                      );
                      if (address) {
                        setLocationAddress(address.formattedAddress);
                        Alert.alert("Success", "Address refreshed from GPS location");
                      } else {
                        Alert.alert("Info", "Could not determine address from GPS");
                      }
                    }
                  }}
                >
                  <Ionicons name="refresh" size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.locationCoords}>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
              <Text style={styles.locationAccuracy}>
                Accuracy: ±{Math.round(location.accuracy || 0)}m
              </Text>
            </View>
          ) : (
            <View style={styles.alertBox}>
              <View style={styles.alertHeader}>
                <Ionicons name="warning" size={20} color="#DC2626" />
                <Text style={styles.alertTitle}> No GPS Location</Text>
              </View>
              <Text style={styles.alertText}>
                Location is required to record infringements
              </Text>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={async () => {
                  const result = await gpsService.requestPermissions();
                  if (result.granted) {
                    const loc = await gpsService.getCurrentLocation();
                    setLocation(loc);
                  }
                }}
              >
                <Text style={styles.alertButtonText}>Enable GPS</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Vehicle ID */}
            <View style={styles.formGroup}>
              <View style={styles.labelWithIcon}>
                <Ionicons
                  name="car"
                  size={18}
                  color="#000"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.label}>Vehicle Registration *</Text>
              </View>
              <TextInput
                style={styles.input}
                value={vehicleId}
                onChangeText={setVehicleId}
                placeholder="e.g., ABC123GP"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Infringement Category */}
            <View style={styles.formGroup}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="apps-outline" size={16} color="#666" />
                <Text style={styles.label}> Category *</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  selectedCategory && styles.pickerButtonSelected,
                ]}
                onPress={() => setShowCategoryPicker(true)}
              >
                {selectedCategory ? (
                  <View style={styles.pickerContent}>
                    <Text style={styles.pickerTextSelected}>
                      {categories.find((c) => c.id === selectedCategory)?.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.pickerPlaceholder}>
                    Select category first...
                  </Text>
                )}
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Infringement Type */}
            <View style={styles.formGroup}>
              <View style={styles.labelWithIcon}>
                <Ionicons name="warning-outline" size={16} color="#666" />
                <Text style={styles.label}> Infringement Type *</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.pickerButton,
                  selectedType && styles.pickerButtonSelected,
                  !selectedCategory && styles.pickerButtonDisabled,
                ]}
                onPress={() => {
                  if (!selectedCategory) {
                    Alert.alert(
                      "Select Category First",
                      "Please select a category before choosing an infringement type"
                    );
                    return;
                  }
                  setShowTypePicker(true);
                }}
                disabled={!selectedCategory}
              >
                {selectedType ? (
                  <View style={styles.pickerContent}>
                    <Text style={styles.pickerTextSelected}>
                      {types.find((t) => t.id === selectedType)?.code}
                    </Text>
                    <Text style={styles.pickerSubtext}>
                      {types.find((t) => t.id === selectedType)?.description}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.pickerPlaceholder}>
                    {selectedCategory
                      ? "Select infringement type..."
                      : "Select category first..."}
                  </Text>
                )}
                <Text style={styles.pickerArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Selected Type Details */}
            {selectedType && (
              <View style={styles.typeDetailsCard}>
                <Text style={styles.typeDetailsTitle}>
                  {types.find((t) => t.id === selectedType)?.description}
                </Text>
                <Text style={styles.typeDetailsFine}>
                  Fine: ${types.find((t) => t.id === selectedType)?.fine_amount}
                </Text>
              </View>
            )}

            {/* Description */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <View style={styles.labelWithIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#000"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.label}>Summary</Text>
                </View>
                <TouchableOpacity
                  onPress={generateDescription}
                  style={styles.refreshNotesButton}
                >
                  <Ionicons
                    name="refresh"
                    size={16}
                    color="#007AFF"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.refreshNotesText}>Refresh</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Auto-generated summary..."
                editable={true}
              />
            </View>

            {/* Notes */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <View style={styles.labelWithIcon}>
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color="#000"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.label}>Detailed Notes</Text>
                </View>
                <TouchableOpacity
                  onPress={generateNotes}
                  style={styles.refreshNotesButton}
                >
                  <Ionicons
                    name="refresh"
                    size={16}
                    color="#007AFF"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.refreshNotesText}>Refresh</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Detailed notes (auto-generated)..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <View style={styles.notesHint}>
                <Ionicons
                  name="information-circle"
                  size={14}
                  color="#666"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.notesHintText}>
                  Notes are auto-generated. Edit if needed.
                </Text>
              </View>
            </View>

            {/* Photo Evidence Button */}
            <View style={styles.formGroup}>
              <View style={styles.labelWithIcon}>
                <Ionicons
                  name="camera"
                  size={20}
                  color="#000"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.label}>Photo Evidence</Text>
              </View>

              {/* Show captured photos */}
              {capturedPhotos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.photoPreviewScroll}
                >
                  {capturedPhotos.map((photoUri, index) => (
                    <View key={index} style={styles.photoPreviewCard}>
                      <RNImage
                        source={{ uri: photoUri }}
                        style={styles.photoPreviewImage}
                      />
                      <TouchableOpacity
                        style={styles.photoPreviewDelete}
                        onPress={() => {
                          setCapturedPhotos((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                          setWatermarkedPhotos((prev) =>
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <Ionicons name="close" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* Hidden watermark processors */}
              <View style={{ height: 0, overflow: "hidden" }}>
                {capturedPhotos.map((photoUri, index) => {
                  // Only process if we haven't created watermark for this photo yet
                  if (watermarkedPhotos[index]) return null;

                  const selectedTypeData = types.find(
                    (t) => t.id === selectedType
                  );

                  return (
                    <WatermarkedImage
                      key={`watermark-${index}`}
                      imageUri={photoUri}
                      timestamp={new Date().toLocaleString("en-FJ", {
                        dateStyle: "full",
                        timeStyle: "long",
                      })}
                      officerName={profile?.full_name || "Unknown Officer"}
                      latitude={location?.latitude || null}
                      longitude={location?.longitude || null}
                      locationAddress={locationAddress || undefined}
                      agencyName="Fiji Police Force" // TODO: Fetch from agency table
                      vehicleId={vehicleId.trim() || undefined}
                      infringementType={
                        selectedTypeData
                          ? `${selectedTypeData.code} - ${selectedTypeData.description}`
                          : undefined
                      }
                      onCapture={(watermarkedUri) =>
                        handleWatermarkedCapture(photoUri, watermarkedUri)
                      }
                    />
                  );
                })}
              </View>

              {processingPhoto && (
                <View style={styles.processingIndicator}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.processingText}>
                    Processing watermark...
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => {
                  if (!location) {
                    Alert.alert(
                      "GPS Required",
                      "Please enable GPS before capturing evidence photos"
                    );
                    return;
                  }
                  setShowCamera(true);
                }}
              >
                <Ionicons
                  name="camera"
                  size={20}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.cameraButtonText}>
                  {capturedPhotos.length > 0
                    ? `Add More Photos (${capturedPhotos.length})`
                    : "Capture Evidence"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.cameraHint}>
                Photos are watermarked with location, time, and officer details
              </Text>
            </View>
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
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>

          {!isOnline && (
            <View style={styles.offlineNote}>
              <Ionicons
                name="information-circle"
                size={18}
                color="#FFA500"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.offlineNoteText}>
                You are offline. Infringement will be saved locally and synced
                when online.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Category List */}
            <FlatList
              data={categories}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    No categories found
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedCategory === item.id && styles.categoryItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedCategory(item.id);
                    setSelectedType(null); // Reset type when category changes
                    setShowCategoryPicker(false);
                  }}
                >
                  <View style={styles.categoryItemContent}>
                    <Text style={styles.categoryItemName}>{item.name}</Text>
                  </View>
                  {selectedCategory === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#007AFF"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Type Picker Modal */}
      <Modal
        visible={showTypePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Select Infringement Type</Text>
                {selectedCategory && (
                  <Text style={styles.modalSubtitle}>
                    Category: {categories.find((c) => c.id === selectedCategory)?.name}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#8E8E93"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by code or description..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#8E8E93" />
                </TouchableOpacity>
              )}
            </View>

            {/* Change Category Button */}
            {selectedCategory && (
              <View style={styles.changeCategoryContainer}>
                <TouchableOpacity
                  style={styles.changeCategoryButton}
                  onPress={() => {
                    setShowTypePicker(false);
                    setTimeout(() => setShowCategoryPicker(true), 300);
                  }}
                >
                  <Ionicons name="swap-horizontal" size={18} color="#007AFF" />
                  <Text style={styles.changeCategoryText}>Change Category</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Type List */}
            <FlatList
              data={filteredTypes}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>
                    {selectedCategory
                      ? "No infringement types found in this category"
                      : "No infringement types found"}
                  </Text>
                  {searchQuery && (
                    <Text style={styles.emptyHint}>
                      Try adjusting your search
                    </Text>
                  )}
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.typeItem,
                    selectedType === item.id && styles.typeItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedType(item.id);
                    setShowTypePicker(false);
                    setSearchQuery("");
                  }}
                >
                  <View style={styles.typeItemContent}>
                    <View style={styles.typeItemHeader}>
                      <Text style={styles.typeItemCode}>{item.code}</Text>
                      <Text style={styles.typeItemAmount}>
                        ${item.fine_amount}
                      </Text>
                    </View>
                    <Text style={styles.typeItemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                  {selectedType === item.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#007AFF"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowMapPicker(false)}
      >
        <SafeAreaView style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity
              onPress={() => setShowMapPicker(false)}
              style={styles.mapModalCloseButton}
            >
              <Ionicons name="close" size={24} color="#007AFF" />
              <Text style={styles.mapModalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Select Location</Text>
            <View style={{ width: 80 }} />
          </View>
          <MapWithSearch
            onLocationSelect={handleMapLocationSelect}
            initialAddress={
              location && locationAddress
                ? {
                    formattedAddress: locationAddress,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }
                : undefined
            }
            showSearchBar={true}
            allowMarkerDrag={true}
          />
        </SafeAreaView>
      </Modal>

      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraModalContainer}>
          {!cameraPermission?.granted ? (
            <View style={styles.cameraPermissionContainer}>
              <Text style={styles.cameraPermissionText}>
                📸 Camera permission required
              </Text>
              <TouchableOpacity
                style={styles.cameraPermissionButton}
                onPress={requestCameraPermission}
              >
                <Text style={styles.cameraPermissionButtonText}>
                  Grant Permission
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cameraCancelButton}
                onPress={() => setShowCamera(false)}
              >
                <Text style={styles.cameraCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView ref={cameraRef} style={styles.camera} facing="back" />
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraHeader}>
                  <TouchableOpacity
                    style={styles.cameraCloseButton}
                    onPress={() => setShowCamera(false)}
                  >
                    <Ionicons
                      name="close"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.cameraCloseText}>Close</Text>
                  </TouchableOpacity>
                  <Text style={styles.cameraPhotoCount}>
                    {capturedPhotos.length} photo
                    {capturedPhotos.length !== 1 ? "s" : ""}
                  </Text>
                </View>

                <View style={styles.cameraFooter}>
                  <TouchableOpacity
                    style={styles.cameraCaptureButton}
                    onPress={takePicture}
                  >
                    <View style={styles.cameraCaptureButtonInner} />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#007AFF",
  },
  keyboardView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  online: {
    backgroundColor: "#E8F5E9",
  },
  offline: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  locationCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    justifyContent: "space-between",
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
    color: "#333",
    flex: 1,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  mapButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 8,
  },
  addressInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    paddingTop: 10,
  },
  addressInput: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
    minHeight: 44,
  },
  addressRefreshButton: {
    backgroundColor: "#E3F2FD",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  locationCoords: {
    fontSize: 13,
    color: "#8E8E93",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  locationAccuracy: {
    fontSize: 12,
    color: "#999",
  },
  alertBox: {
    backgroundColor: "#FFF3CD",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  alertText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  alertButton: {
    backgroundColor: "#FF9800",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  alertButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  form: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  refreshNotesButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
  },
  refreshNotesText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  notesHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  notesHintText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    flex: 1,
  },
  notesHintContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  pickerButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 56,
  },
  pickerButtonSelected: {
    borderColor: "#007AFF",
  },
  pickerButtonDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
    opacity: 0.6,
  },
  pickerContent: {
    flex: 1,
  },
  pickerTextSelected: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 2,
  },
  pickerSubtext: {
    fontSize: 13,
    color: "#666",
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: "#999",
  },
  pickerArrow: {
    fontSize: 12,
    color: "#999",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
    marginTop: 4,
  },
  modalClose: {
    fontSize: 24,
    color: "#999",
    fontWeight: "300",
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  mapModalCloseButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mapModalCloseText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  searchClear: {
    fontSize: 18,
    color: "#999",
    padding: 4,
  },
  changeCategoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  changeCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E3F2FD",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  changeCategoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 12,
  },
  emptyHint: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  typeItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  typeItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  typeItemContent: {
    flex: 1,
  },
  typeItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  typeItemCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },
  typeItemAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  typeItemDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  typeItemCheck: {
    fontSize: 20,
    color: "#007AFF",
    marginLeft: 12,
    fontWeight: "600",
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  categoryItemSelected: {
    backgroundColor: "#f0f8ff",
  },
  categoryItemContent: {
    flex: 1,
  },
  categoryItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  typeDetailsCard: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  typeDetailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  typeDetailsFine: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  cameraButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cameraHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
  photoPreviewScroll: {
    marginBottom: 12,
  },
  photoPreviewCard: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  photoPreviewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPreviewDelete: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255, 0, 0, 0.8)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  photoPreviewDeleteText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  processingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  processingText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  cameraModalContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraPermissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  cameraPermissionText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  cameraPermissionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  cameraPermissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cameraCancelButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    justifyContent: "space-between",
  },
  cameraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  cameraCloseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  cameraCloseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraPhotoCount: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cameraFooter: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  cameraCaptureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#007AFF",
  },
  cameraCaptureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#007AFF",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  offlineNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  offlineNoteText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
});
