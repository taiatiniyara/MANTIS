/**
 * MANTIS Mobile - Create Infringement Screen
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
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
import { formatCurrency, generateTin } from '@/lib/formatting';
import OSMMap from '@/components/OSMMap';
import { addWatermarkToImage, WatermarkData } from '@/lib/watermark';
import { WatermarkedImage } from '@/components/WatermarkedImage';
import { queryKeys } from '@/lib/queryKeys';
import ViewShot, { CaptureOptions } from 'react-native-view-shot';

const DEFAULT_CAPTURE_OPTIONS: CaptureOptions = {
  format: 'jpg',
  quality: 0.92,
  result: 'tmpfile',
};

interface PhotoItem {
  uri: string;
  type: string;
  name: string;
  watermarkData?: WatermarkData;
  processedUri?: string;
  width?: number;
  height?: number;
}

export default function CreateInfringementScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const draftId = params.draftId as string | undefined;
  const tinParam = useMemo(() => {
    const value = params.tin;
    return Array.isArray(value) ? value[0] : value;
  }, [params.tin]);
  const [tin] = useState<string>(() => tinParam || generateTin());

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
  const viewShotRefs = useRef<Record<string, ViewShot | null>>({});
  const viewShotReady = useRef<Record<string, boolean>>({});
  const scrollRef = useRef<ScrollView>(null);

  const waitForLayout = async (ms = 260) => new Promise(resolve => setTimeout(resolve, ms));

  const prepareWatermarkedPhotos = useCallback(async (items: PhotoItem[]) => {
    // Give React a moment to mount hidden ViewShot surfaces before capture
    await waitForLayout();

    const prepared = await Promise.all(items.map(async (photo) => {
      if (!photo.watermarkData) return photo;

      // Try to locate the ViewShot surface for this photo (use both processed and original keys)
      const candidateKeys = [photo.processedUri, photo.uri].filter(Boolean) as string[];
      let ref: ViewShot | null | undefined;
      let captureKey: string | undefined;

      for (const key of candidateKeys) {
        if (viewShotRefs.current[key]) {
          ref = viewShotRefs.current[key];
          captureKey = key;
          break;
        }
      }

      if (!ref || !ref.capture || !captureKey) {
        console.warn('Watermark capture ref not ready for photo', candidateKeys);
        return photo;
      }

      // Wait until the ViewShot has laid out; retry a few times before giving up
      for (let attempt = 0; attempt < 8; attempt++) {
        if (viewShotReady.current[captureKey]) break;
        await waitForLayout(260);
      }

      try {
        let capturedUri: string | undefined | null;
        for (let attempt = 0; attempt < 3; attempt++) {
          capturedUri = await ref.capture();
          if (capturedUri) break;
          await waitForLayout(180 + attempt * 40);
        }

        if (capturedUri) {
          console.log('Watermark baked into image', { captureKey, capturedUri });
          return { ...photo, processedUri: capturedUri };
        }

        console.warn('Watermark capture returned empty uri', captureKey);
      } catch (error) {
        console.error('Error capturing watermarked photo', error);
      }

      return photo;
    }));

    return prepared;
  }, []);
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
        tin,
        driver_id: driver_id,
        vehicle_id: vehicle_id,
        offence_code: selectedOffence.code,
        description: description || locationDescription || null,
        fine_amount: selectedOffence.fixed_penalty,
        location: geoLocation ? JSON.stringify(geoLocation) : null,
        jurisdiction_location_id: null,
        status: isDraft ? 'draft' : 'pending',
      };

      const preparedPhotos = await prepareWatermarkedPhotos(photos);
      setPhotos(preparedPhotos);

      // Ensure we only ever upload/queue the baked, watermarked asset
      const finalizedPhotos = preparedPhotos.map((photo) => {
        const uploadUri = photo.processedUri || photo.uri;

        if (photo.watermarkData && !photo.processedUri) {
          throw new Error('Watermark is still rendering. Please wait a moment and try again.');
        }

        return { ...photo, uploadUri };
      });

      if (shouldQueue) {
        await addToSyncQueue('infringement', newInfringement);
        if (finalizedPhotos.length > 0) {
          for (const photo of finalizedPhotos) {
            await addToSyncQueue('evidence', {
              infringementId: 'pending',
              fileUri: photo.uploadUri,
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
      if (finalizedPhotos.length > 0 && !isDraft) {
        try {
          const uploadResults = await Promise.all(
            finalizedPhotos.map(photo =>
              uploadEvidenceFile(data.id, photo.uploadUri, photo.type || 'image/jpeg')
            )
          );

          const failedUpload = uploadResults.find(result => result.error);
          if (failedUpload) {
            throw new Error(failedUpload.error?.message || 'Failed to upload evidence photo');
          }
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

  const buildWatermarkPayload = useCallback((): WatermarkData => ({
    platformName: 'MANTIS',
    tin,
    officerName: user?.display_name || 'Unknown Officer',
    agencyName: user?.agency?.name || 'Unknown Agency',
    locationEnglish: locationDescription || undefined,
    latitude: currentLocation?.coords.latitude,
    longitude: currentLocation?.coords.longitude,
    timestamp: new Date(),
  }), [tin, user?.display_name, user?.agency?.name, locationDescription, currentLocation?.coords.latitude, currentLocation?.coords.longitude]);

  // Automatically bake the watermark into a file as soon as a photo is added
  useEffect(() => {
    const pending = photos.filter((photo) => photo.watermarkData && !photo.processedUri);
    if (pending.length === 0) return;

    let cancelled = false;

    (async () => {
      const processed = await prepareWatermarkedPhotos(pending);
      if (cancelled) return;

      setPhotos((current) => current.map((photo) => {
        // match by original uri (pre-processed) and current uri
        const updated = processed.find((item) => item.uri === photo.uri || item.uri === photo.processedUri);
        if (updated?.processedUri) {
          // Replace the working URI so future previews and uploads use the baked version
          return { ...photo, uri: updated.processedUri, processedUri: updated.processedUri };
        }
        return photo;
      }));
    })();

    return () => {
      cancelled = true;
    };
  }, [photos, prepareWatermarkedPhotos]);

  const resetForm = useCallback(() => {
    setStep('offence');
    setSelectedOffence(null);
    setDescription('');
    setDriverLicense('');
    setVehiclePlate('');
    setCurrentLocation(null);
    setLocationDescription('');
    setPhotos([]);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

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
            width: (p as any).width,
            height: (p as any).height,
          })));
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      Alert.alert('Error', 'Failed to load draft data');
    }
  }, [draftId, offences]);

  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  const reverseGeocodeAddress = useCallback(async (lat: number, lng: number) => {
    const isAbortLike = (err: unknown) => {
      const name = (err as any)?.name?.toString()?.toLowerCase();
      const msg = (err as any)?.message?.toString()?.toLowerCase();
      return name === 'aborterror' || msg?.includes('aborted');
    };

    const fetchWithTimeout = async (url: string, timeoutMs = 4000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        // Avoid setting forbidden headers like User-Agent that can cause RN fetch to throw
        return await fetch(url, { signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
    };

    const parseNominatim = (data: any) => {
      if (data?.display_name) return data.display_name as string;
      if (data?.address) {
        const parts = [
          data.address.road,
          data.address.suburb,
          data.address.city || data.address.town,
          data.address.country,
        ].filter(Boolean);
        if (parts.length) return parts.join(', ');
      }
      return '';
    };

    const parsePhoton = (data: any) => {
      const feature = data?.features?.[0];
      const props = feature?.properties;
      if (!props) return '';
      const parts = [
        props.name,
        props.street,
        props.district || props.city,
        props.state,
        props.country,
      ].filter(Boolean);
      return parts.length ? parts.join(', ') : '';
    };

    setIsReverseGeocoding(true);
    try {
      // Try Nominatim first
      try {
        const contactEmail = process.env.EXPO_PUBLIC_NOMINATIM_EMAIL;
        const emailParam = contactEmail ? `&email=${encodeURIComponent(contactEmail)}` : '';
        const res = await fetchWithTimeout(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1${emailParam}`
        );
        if (res?.ok) {
          const data = await res.json();
          const address = parseNominatim(data);
          if (address) return address;
        }
      } catch (err) {
        const msg = (err as any)?.message?.toString()?.toLowerCase();
        if (!isAbortLike(err) && !msg?.includes('network request failed')) {
          console.warn('Nominatim reverse geocode failed', err);
        }
      }

      // Fallback to native geocoder (uses device provider and often succeeds when third parties block requests)
      try {
        const nativeResults = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        const nativeAddress = nativeResults?.[0];
        if (nativeAddress) {
          const parts = [
            nativeAddress.name,
            nativeAddress.street,
            nativeAddress.city || nativeAddress.district,
            nativeAddress.region,
            nativeAddress.country,
          ].filter(Boolean);
          if (parts.length) return parts.join(', ');
        }
      } catch (err) {
        const msg = (err as any)?.message?.toString()?.toLowerCase();
        if (!isAbortLike(err) && !msg?.includes('network request failed')) {
          console.warn('Native reverse geocode failed', err);
        }
      }

      // Fallback to Photon (often less strict)
      try {
        const res = await fetchWithTimeout(
          `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&limit=1`
        );
        if (res?.ok) {
          const data = await res.json();
          const address = parsePhoton(data);
          if (address) return address;
        }
      } catch (err) {
        const msg = (err as any)?.message?.toString()?.toLowerCase();
        if (!isAbortLike(err) && !msg?.includes('network request failed')) {
          console.warn('Photon reverse geocode failed', err);
        }
      }

      // Last resort: plain coordinates
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } finally {
      setIsReverseGeocoding(false);
    }
  }, []);

  const updateLocationDescription = useCallback(async (lat: number, lng: number) => {
    const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    try {
      const address = await reverseGeocodeAddress(lat, lng);
      setLocationDescription(address ?? fallback);
    } catch (error) {
      console.error('Error fetching address:', error);
      setLocationDescription(fallback);
    }
  }, [reverseGeocodeAddress]);

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

  // Run once on mount to avoid repeated permission prompts / flicker
  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);

  useEffect(() => {
    if (draftId) {
      loadDraftData();
    }
  }, [draftId, loadDraftData]);

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
      const watermarkData = buildWatermarkPayload();

      // Process image with watermark metadata
      const watermarkedUri = await addWatermarkToImage(asset.uri, watermarkData);

      setPhotos([...photos, {
        uri: watermarkedUri,
        type: 'image/jpeg',
        name: `evidence_${Date.now()}.jpg`,
        watermarkData,
        width: asset.width,
        height: asset.height,
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
      const watermarkData = buildWatermarkPayload();
      const newPhotos = await Promise.all(result.assets.map(async (asset, index) => {
        const processedUri = await addWatermarkToImage(asset.uri, watermarkData);
        return {
          uri: processedUri,
          type: 'image/jpeg',
          name: `evidence_${Date.now()}_${index}.jpg`,
          watermarkData,
          width: asset.width,
          height: asset.height,
        } as PhotoItem;
      }));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    try {
      const result = await submittingMutation.mutateAsync(isDraft);
      if (result.queued) {
        resetForm();
        Alert.alert(
          'Queued for Sync',
          'Infringement saved and will be synced when you\'re back online.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (result.photoWarning) {
        Alert.alert(
          'Warning',
          'Infringement created but some photos failed to upload. You can try uploading them again later.'
        );
      }

      resetForm();
      Alert.alert(
        'Success',
        result.isDraft ? 'Draft saved successfully' : 'Infringement created successfully',
        [{ text: 'OK' }]
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
          Location Description {isReverseGeocoding && '(Loading address...)'}
        </ThemedText>
        <TextInput
          style={[styles.textArea, { color: colors.foreground, borderColor: colors.icon }]}
          placeholder="e.g., Queens Road near Victoria Parade intersection"
          placeholderTextColor={colors.icon}
          value={locationDescription}
          onChangeText={setLocationDescription}
          multiline
          numberOfLines={3}
          editable={!isReverseGeocoding}
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
            ✓ Each photo includes: MANTIS label, TIN, date/time, location (EN), GPS coordinates, officer, agency
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
      <ScrollView ref={scrollRef} style={styles.scrollView}>
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

      {/* Hidden capture surfaces to burn watermarks into files before upload */}
      <View style={styles.hiddenCaptureContainer} pointerEvents="none">
        {photos.map((photo, index) => {
          // Capture at the photo's native resolution when available for crisper watermark text
          const targetWidth = photo.width || 1080;
          const targetHeight = photo.height || Math.round((photo.width || 1080) * (3 / 4));
          const captureKey = photo.processedUri ? photo.processedUri : photo.uri;
          return (
            <ViewShot
              key={`capture-${captureKey}-${index}`}
              ref={(ref) => {
                if (ref) {
                  viewShotRefs.current[captureKey] = ref;
                } else {
                  delete viewShotRefs.current[captureKey];
                }
              }}
              options={{ ...DEFAULT_CAPTURE_OPTIONS, width: targetWidth, height: targetHeight }}
              style={[styles.capturePreview, { width: targetWidth, height: targetHeight }]}
              onLayout={() => { viewShotReady.current[captureKey] = true; }}
            >
              {photo.watermarkData ? (
                <WatermarkedImage
                  imageUri={photo.uri}
                  watermarkData={photo.watermarkData}
                  style={{ width: targetWidth, height: targetHeight }}
                  dimensions={{ width: targetWidth, height: targetHeight }}
                  onReady={() => { viewShotReady.current[captureKey] = true; }}
                />
              ) : (
                <Image
                  source={{ uri: photo.uri }}
                  style={{ width: targetWidth, height: targetHeight }}
                  onLoadEnd={() => { viewShotReady.current[captureKey] = true; }}
                />
              )}
            </ViewShot>
          );
        })}
      </View>
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
  hiddenCaptureContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.001,
    zIndex: 0,
  },
  capturePreview: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
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
