/**
 * MANTIS Mobile - Create Infringement Screen
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { addToSyncQueue, getDraft, isOfflineMode } from '@/lib/offline';
import * as Network from 'expo-network';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createInfringement, getOffences, upsertDriver, upsertVehicle, uploadEvidenceFile } from '@/lib/database';
import { NewInfringement, Offence, GeoJSONPoint, NewDriver, NewVehicle } from '@/lib/types';
import { formatCurrency } from '@/lib/formatting';
import OSMMap from '@/components/OSMMap';
import { addWatermarkToImage, WatermarkData } from '@/lib/watermark';
import { WatermarkedImage } from '@/components/WatermarkedImage';
import { queryKeys } from '@/lib/queryKeys';

interface PhotoItem {
  uri: string;
  type: string;
  name: string;
  watermarkData?: WatermarkData;
}

export default function CreateInfringementScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const draftId = params.draftId as string | undefined;

  // Form state
  const [step, setStep] = useState<'offence' | 'driver' | 'vehicle' | 'location' | 'evidence' | 'review'>('offence');
  const offencesQuery = useQuery({
    queryKey: queryKeys.offencesActive,
    queryFn: async () => {
      const { data, error } = await getOffences({ active: true });
      if (error) {
        throw new Error(error.message || 'Failed to load offences');
      }
      return data ?? [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const loading = offencesQuery.isPending;
  const queryClient = useQueryClient();
  const submittingMutation = useMutation({
    mutationFn: async (isDraft: boolean) => {
      if (!user || !selectedOffence) {
        throw new Error('Missing required information');
      }

      if (!isDraft && (!driverLicense || !vehiclePlate)) {
        throw new Error('Driver license and vehicle plate are required');
      }

      // Check if we should queue for later sync
      const shouldQueue = !isOnline && !isDraft;

      let driver_id: string | null = null;
      let vehicle_id: string | null = null;

      // Create or lookup driver if license provided
      if (driverLicense) {
        const newDriver: NewDriver = {
          license_number: driverLicense,
          full_name: 'Unknown', // Will be updated later when more info is available
          address: null,
          dob: null,
        };
        const { data: driver, error: driverError } = await upsertDriver(newDriver);
        if (driver) {
          driver_id = driver.id;
        } else if (driverError) {
          throw new Error(driverError.message || 'Failed to create/update driver');
        }
      }

      // Create or lookup vehicle if plate provided
      if (vehiclePlate) {
        const newVehicle: NewVehicle = {
          plate_number: vehiclePlate,
          make: null,
          model: null,
          color: null,
          owner_id: driver_id,
        };
        const { data: vehicle, error: vehicleError } = await upsertVehicle(newVehicle);
        if (vehicle) {
          vehicle_id = vehicle.id;
        } else if (vehicleError) {
          throw new Error(vehicleError.message || 'Failed to create/update vehicle');
        }
      }

      const geoLocation: GeoJSONPoint | null = currentLocation ? {
        type: 'Point',
        coordinates: [currentLocation.coords.longitude, currentLocation.coords.latitude],
      } : null;

      const newInfringement: NewInfringement = {
        agency_id: user.agency_id,
        team_id: user.team_id,
        officer_id: user.id,
        driver_id: driver_id,
        vehicle_id: vehicle_id,
        offence_code: selectedOffence.code,
        description: description || locationDescription || null,
        fine_amount: selectedOffence.fixed_penalty,
        location: geoLocation ? JSON.stringify(geoLocation) : null,
        jurisdiction_location_id: null,
        status: isDraft ? 'draft' : 'pending',
      };

      if (shouldQueue) {
        await addToSyncQueue('infringement', newInfringement);
        if (photos.length > 0) {
          for (const photo of photos) {
            await addToSyncQueue('evidence', {
              infringementId: 'pending',
              fileUri: photo.uri,
              fileType: photo.type,
            });
          }
        }
        return { queued: true, isDraft } as const;
      }

      const { data, error } = await createInfringement(newInfringement);
      if (error || !data) {
        throw new Error(error?.message || 'Failed to create infringement');
      }

      let photoWarning = false;
      if (photos.length > 0 && !isDraft) {
        try {
          const uploadPromises = photos.map(photo =>
            uploadEvidenceFile(data.id, photo.uri, photo.type)
          );
          await Promise.all(uploadPromises);
        } catch (photoError) {
          console.error('Error uploading photos:', photoError);
          photoWarning = true;
        }
      }

      return { queued: false, isDraft, photoWarning } as const;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.infringementsByOfficer(user?.id, 100) });
      queryClient.invalidateQueries({ queryKey: queryKeys.drafts });
    },
  });

  const submitting = submittingMutation.isPending;
  const [isOnline, setIsOnline] = useState(true);

  const checkNetworkStatus = useCallback(async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const offline = await isOfflineMode();
      setIsOnline((networkState.isConnected ?? false) && !offline);
    } catch (error) {
      console.error('Error checking network:', error);
    }
  }, []);

  useEffect(() => {
    checkNetworkStatus();
  }, [checkNetworkStatus]);

  // Offence
  const offences = useMemo(() => offencesQuery.data ?? [], [offencesQuery.data]);
  const [selectedOffence, setSelectedOffence] = useState<Offence | null>(null);
  const [description, setDescription] = useState('');

  // Driver
  const [driverLicense, setDriverLicense] = useState('');

  // Vehicle
  const [vehiclePlate, setVehiclePlate] = useState('');

  // Location
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationDescription, setLocationDescription] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Evidence
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const loadDraftData = useCallback(async () => {
    if (!draftId) return;
    
    try {
      const draft = await getDraft(draftId);
      if (draft) {
        // Pre-fill form with draft data
        if (draft.data.offence_code) {
          // Will need to find and set the offence after offences are loaded
          setTimeout(() => {
            const offence = offences.find(o => o.code === draft.data.offence_code);
            if (offence) setSelectedOffence(offence);
          }, 500);
        }
        
        if (draft.data.description) setDescription(draft.data.description);
        
        // Parse location if exists
        if (draft.data.location) {
          try {
            const geoJSON = JSON.parse(draft.data.location);
            if (geoJSON.type === 'Point' && geoJSON.coordinates) {
              setCurrentLocation({
                coords: {
                  latitude: geoJSON.coordinates[1],
                  longitude: geoJSON.coordinates[0],
                  altitude: null,
                  accuracy: null,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null,
                },
                timestamp: Date.now(),
              } as Location.LocationObject);
            }
          } catch (e) {
            console.error('Error parsing location:', e);
          }
        }
        
        // Load photos
        if (draft.photos && draft.photos.length > 0) {
          setPhotos(draft.photos.map(p => ({
            uri: p.uri,
            type: p.file_type,
            name: `photo_${Date.now()}.jpg`,
          })));
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      Alert.alert('Error', 'Failed to load draft data');
    }
  }, [draftId, offences]);

  const reverseGeocodeMutation = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MANTIS Mobile App',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }

      const data = await response.json();
      if (data.display_name) {
        return data.display_name as string;
      }

      if (data.address) {
        const parts = [
          data.address.road,
          data.address.suburb,
          data.address.city || data.address.town,
          data.address.country,
        ].filter(Boolean);
        return parts.join(', ');
      }

      return '';
    },
  });

  const updateLocationDescription = useCallback(async (lat: number, lng: number) => {
    try {
      const address = await reverseGeocodeMutation.mutateAsync({ lat, lng });
      if (address !== undefined) {
        setLocationDescription(address);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  }, [reverseGeocodeMutation]);

  const getCurrentLocation = useCallback(async () => {
    setLoadingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setCurrentLocation(location);
      
      await updateLocationDescription(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Failed to get current location');
    } finally {
      setLoadingLocation(false);
    }
  }, [updateLocationDescription]);

  const requestLocationPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      getCurrentLocation();
    }
  }, [getCurrentLocation]);

  useEffect(() => {
    requestLocationPermission();
    if (draftId) {
      loadDraftData();
    }
  }, [draftId, loadDraftData, requestLocationPermission]);

  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setCurrentLocation({
      coords: {
        latitude: lat,
        longitude: lng,
        altitude: null,
        accuracy: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    } as Location.LocationObject);
    
    // Fetch address for the selected location
    await updateLocationDescription(lat, lng);
  };

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Prepare watermark data
      const watermarkData: WatermarkData = {
        vehiclePlate: vehiclePlate || undefined,
        driverLicense: driverLicense || undefined,
        officerName: user?.display_name || 'Unknown Officer',
        agencyName: user?.agency?.name || 'Unknown Agency',
        address: locationDescription || undefined,
        latitude: currentLocation?.coords.latitude,
        longitude: currentLocation?.coords.longitude,
        timestamp: new Date(),
      };

      // Process image with watermark metadata
      const watermarkedUri = await addWatermarkToImage(asset.uri, watermarkData);
      
      setPhotos([...photos, {
        uri: watermarkedUri,
        type: 'image/jpeg',
        name: `evidence_${Date.now()}.jpg`,
        watermarkData,
      }]);
      
      Alert.alert(
        'Photo Captured',
        'Photo has been watermarked with infringement details.',
        [{ text: 'OK' }]
      );
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: `evidence_${Date.now()}_${index}.jpg`,
      }));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      const result = await submittingMutation.mutateAsync(isDraft);
      if (result.queued) {
        Alert.alert(
          'Queued for Sync',
          'Infringement saved and will be synced when you\'re back online.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }

      if (result.photoWarning) {
        Alert.alert(
          'Warning',
          'Infringement created but some photos failed to upload. You can try uploading them again later.'
        );
      }

      Alert.alert(
        'Success',
        result.isDraft ? 'Draft saved successfully' : 'Infringement created successfully',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error submitting:', error);
      Alert.alert('Error', error?.message || 'An unexpected error occurred');
    }
  };

  const renderOffenceStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>Select Offence</ThemedText>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <TextInput
            style={[styles.input, { color: colors.foreground, borderColor: colors.icon }]}
            placeholder="Search offences..."
            placeholderTextColor={colors.icon}
          />
          <ScrollView style={styles.offenceList}>
            {offences.slice(0, 10).map((offence) => (
              <TouchableOpacity
                key={offence.id}
                style={[
                  styles.offenceItem,
                  selectedOffence?.id === offence.id && { backgroundColor: colors.tint + '20' }
                ]}
                onPress={() => setSelectedOffence(offence)}
              >
                <ThemedText style={styles.offenceCode}>{offence.code}</ThemedText>
                <ThemedText style={styles.offenceName}>{offence.name}</ThemedText>
                <ThemedText style={styles.offenceFine}>{formatCurrency(offence.fixed_penalty)}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {selectedOffence && (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.tint }]}
              onPress={() => setStep('driver')}
            >
              <ThemedText style={styles.buttonText}>Next: Driver Details</ThemedText>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  const renderDriverStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>Driver Information</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>License Number *</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.icon }]}
          placeholder="Enter license number"
          placeholderTextColor={colors.icon}
          value={driverLicense}
          onChangeText={setDriverLicense}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.tint }]}
          onPress={() => setStep('offence')}
        >
          <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>Back</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.tint }]}
          onPress={() => setStep('vehicle')}
        >
          <ThemedText style={styles.buttonText}>Next: Vehicle</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVehicleStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>Vehicle Information</ThemedText>
      
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Plate Number *</ThemedText>
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.icon }]}
          placeholder="Enter plate number"
          placeholderTextColor={colors.icon}
          value={vehiclePlate}
          onChangeText={setVehiclePlate}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.tint }]}
          onPress={() => setStep('driver')}
        >
          <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>Back</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.tint }]}
          onPress={() => setStep('location')}
        >
          <ThemedText style={styles.buttonText}>Next: Location</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>Location & Description</ThemedText>
      
      {/* Interactive Map */}
      <View style={styles.mapPreview}>
        <OSMMap
          initialLat={currentLocation?.coords.latitude ?? 37.7749}
          initialLng={currentLocation?.coords.longitude ?? -122.4194}
          onLocationSelect={handleMapLocationSelect}
        />
      </View>

      <ThemedText style={styles.mapHint}>📍 Tap on the map to select location</ThemedText>
      
      <View style={styles.locationBox}>
        {loadingLocation ? (
          <ActivityIndicator size="small" />
        ) : currentLocation ? (
          <>
            <ThemedText style={styles.locationText}>
              📍 Lat: {currentLocation.coords.latitude.toFixed(6)}
            </ThemedText>
            <ThemedText style={styles.locationText}>
              📍 Lon: {currentLocation.coords.longitude.toFixed(6)}
            </ThemedText>
            {locationDescription && (
              <View style={styles.addressBox}>
                <ThemedText style={styles.addressLabel}>Address:</ThemedText>
                <ThemedText style={styles.addressText}>{locationDescription}</ThemedText>
              </View>
            )}
          </>
        ) : (
          <ThemedText style={styles.locationText}>No location captured</ThemedText>
        )}
        <TouchableOpacity
          style={[styles.smallButton, { backgroundColor: colors.tint }]}
          onPress={getCurrentLocation}
        >
          <ThemedText style={styles.buttonText}>
            {currentLocation ? 'Use My Location' : 'Get My Location'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>
          Location Description {reverseGeocodeMutation.isPending && '(Loading address...)'}
        </ThemedText>
        <TextInput
          style={[styles.textArea, { color: colors.foreground, borderColor: colors.icon }]}
          placeholder="e.g., Queens Road near Victoria Parade intersection"
          placeholderTextColor={colors.icon}
          value={locationDescription}
          onChangeText={setLocationDescription}
          multiline
          numberOfLines={3}
          editable={!reverseGeocodeMutation.isPending}
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Additional Description</ThemedText>
        <TextInput
          style={[styles.textArea, { color: colors.foreground, borderColor: colors.icon }]}
          placeholder="Add any additional notes about the infringement..."
          placeholderTextColor={colors.icon}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.stepButtons}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.tint }]}
          onPress={() => setStep('vehicle')}
        >
          <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>Back</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.tint }]}
          onPress={() => setStep('evidence')}
        >
          <ThemedText style={styles.buttonText}>Next: Evidence</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEvidenceStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>Photo Evidence</ThemedText>
      
      <ThemedText style={styles.infoText}>
        ℹ️ Photos are automatically watermarked with vehicle, driver, officer, agency, location, and GPS coordinates.
      </ThemedText>
      
      <View style={styles.photoButtons}>
        <TouchableOpacity
          style={[styles.photoButton, { backgroundColor: colors.tint }]}
          onPress={takePicture}
        >
          <ThemedText style={styles.buttonText}>📷 Take Photo</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.photoButton, { backgroundColor: colors.tint }]}
          onPress={pickFromGallery}
        >
          <ThemedText style={styles.buttonText}>🖼️ From Gallery</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.photoScrollView} showsVerticalScrollIndicator={true}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoPreviewContainer}>
            <ThemedText style={styles.photoLabel}>📷 Photo {index + 1}</ThemedText>
            {photo.watermarkData ? (
              <WatermarkedImage
                imageUri={photo.uri}
                watermarkData={photo.watermarkData}
                style={styles.watermarkedPreview}
              />
            ) : (
              <View style={styles.photoThumb}>
                <ThemedText style={styles.photoIndex}>Photo {index + 1}</ThemedText>
              </View>
            )}
            <TouchableOpacity
              style={[styles.removePhotoButton, { backgroundColor: '#FF5252' }]}
              onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
            >
              <ThemedText style={styles.removePhotoText}>✕ Remove</ThemedText>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <ThemedText style={styles.hint}>
        {photos.length} photo(s) attached with watermarks
      </ThemedText>

      <View style={styles.stepButtons}>
        <TouchableOpacity
          style={[styles.backButton, { borderColor: colors.tint }]}
          onPress={() => setStep('location')}
        >
          <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>Back</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.tint }]}
          onPress={() => setStep('review')}
        >
          <ThemedText style={styles.buttonText}>Review</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReviewStep = () => (
    <View style={styles.stepContainer}>
      <ThemedText type="subtitle" style={styles.stepTitle}>Review & Submit</ThemedText>
      
      <View style={styles.reviewSection}>
        <ThemedText style={styles.reviewLabel}>Offence:</ThemedText>
        <ThemedText style={styles.reviewValue}>
          {selectedOffence?.code} - {selectedOffence?.name}
        </ThemedText>
        <ThemedText style={styles.reviewValue}>
          Fine: {selectedOffence && formatCurrency(selectedOffence.fixed_penalty)}
        </ThemedText>
      </View>

      <View style={styles.reviewSection}>
        <ThemedText style={styles.reviewLabel}>Driver:</ThemedText>
        <ThemedText style={styles.reviewValue}>License: {driverLicense || 'Not provided'}</ThemedText>
      </View>

      <View style={styles.reviewSection}>
        <ThemedText style={styles.reviewLabel}>Vehicle:</ThemedText>
        <ThemedText style={styles.reviewValue}>Plate: {vehiclePlate || 'Not provided'}</ThemedText>
      </View>

      <View style={styles.reviewSection}>
        <ThemedText style={styles.reviewLabel}>Evidence:</ThemedText>
        <ThemedText style={styles.reviewValue}>
          {photos.length} watermarked photo(s) {photos.length > 0 ? '(with infringement details)' : ''}
        </ThemedText>
        {photos.length > 0 && (
          <ThemedText style={[styles.reviewValue, { fontSize: 12, marginTop: 4 }]}>
            ✓ Each photo includes: Vehicle plate, driver license, officer name, agency, location & GPS
          </ThemedText>
        )}
        <ThemedText style={styles.reviewValue}>
          Location: {currentLocation ? `${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}` : 'Not captured'}
        </ThemedText>
        {locationDescription && (
          <ThemedText style={[styles.reviewValue, { fontSize: 12, marginTop: 4 }]}>
            📍 {locationDescription}
          </ThemedText>
        )}
      </View>

      {!isOnline && (
        <View style={styles.offlineWarning}>
          <ThemedText style={styles.offlineText}>
            🔴 Offline Mode - Infringement will be queued for sync
          </ThemedText>
        </View>
      )}

      <View style={styles.submitButtons}>
        <TouchableOpacity
          style={[styles.draftButton, { borderColor: colors.tint }]}
          onPress={() => handleSubmit(true)}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={colors.tint} />
          ) : (
            <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
              Save Draft
            </ThemedText>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.tint }]}
          onPress={() => handleSubmit(false)}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Submit</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backLink}
        onPress={() => setStep('evidence')}
      >
        <ThemedText style={[styles.link, { color: colors.tint }]}>← Back to edit</ThemedText>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {['offence', 'driver', 'vehicle', 'location', 'evidence', 'review'].map((s, i) => (
              <View
                key={s}
                style={[
                  styles.progressDot,
                  step === s && { backgroundColor: colors.tint },
                  { borderColor: colors.icon },
                ]}
              />
            ))}
          </View>

          {step === 'offence' && renderOffenceStep()}
          {step === 'driver' && renderDriverStep()}
          {step === 'vehicle' && renderVehicleStep()}
          {step === 'location' && renderLocationStep()}
          {step === 'evidence' && renderEvidenceStep()}
          {step === 'review' && renderReviewStep()}
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  stepContainer: {
    gap: 16,
  },
  stepTitle: {
    marginBottom: 8,
  },
  offenceList: {
    maxHeight: 400,
  },
  offenceItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  offenceCode: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offenceName: {
    marginBottom: 4,
  },
  offenceFine: {
    fontWeight: '600',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  mapPreview: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mapHint: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  locationBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 8,
  },
  locationText: {
    fontSize: 14,
  },
  addressBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    width: '100%',
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoScrollView: {
    maxHeight: 400,
    marginVertical: 12,
  },
  photoPreviewContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.8,
  },
  watermarkedPreview: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  photoThumb: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndex: {
    fontSize: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoButton: {
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  removePhotoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hint: {
    opacity: 0.7,
    fontSize: 14,
  },
  reviewSection: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 4,
  },
  reviewLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reviewValue: {
    opacity: 0.8,
  },
  offlineWarning: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  offlineText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  stepButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  backButtonText: {
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  smallButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  draftButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  helpBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
