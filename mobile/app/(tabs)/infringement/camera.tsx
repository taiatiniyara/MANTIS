import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { router, useLocalSearchParams } from 'expo-router';
import { storage } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { WatermarkedImage } from '@/components/watermarked-image';

const MAX_PHOTOS = 5;
const IMAGE_QUALITY = 0.7;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;

interface Photo {
  uri: string;
  base64?: string;
  width: number;
  height: number;
  size: number;
  uploaded: boolean;
  uploadUrl?: string;
}

export default function CameraScreen() {
  const params = useLocalSearchParams<{ 
    infringementId?: string;
    officerName?: string;
    latitude?: string;
    longitude?: string;
  }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processingWatermark, setProcessingWatermark] = useState(false);
  const [tempPhotoForWatermark, setTempPhotoForWatermark] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  // Request camera permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          📸 Camera permission is required to capture evidence photos
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const addWatermark = async (uri: string): Promise<string> => {
    try {
      setProcessingWatermark(true);
      
      // Get timestamp
      const timestamp = new Date().toLocaleString('en-FJ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      // Get params
      const officerName = params.officerName || 'Unknown Officer';
      const latitude = params.latitude ? parseFloat(params.latitude) : null;
      const longitude = params.longitude ? parseFloat(params.longitude) : null;

      // Set the temporary photo to trigger WatermarkedImage component
      return new Promise<string>((resolve) => {
        setTempPhotoForWatermark(uri);
        
        // Store the resolve function to be called by the watermark component
        (window as any)._watermarkResolve = (watermarkedUri: string) => {
          setTempPhotoForWatermark(null);
          setProcessingWatermark(false);
          resolve(watermarkedUri);
        };
      });
    } catch (error) {
      console.error('Error adding watermark:', error);
      setProcessingWatermark(false);
      return uri;
    }
  };

  const handleWatermarkComplete = (watermarkedUri: string) => {
    // Call the stored resolve function
    if ((window as any)._watermarkResolve) {
      (window as any)._watermarkResolve(watermarkedUri);
      delete (window as any)._watermarkResolve;
    }
  };

  const compressImage = async (uri: string): Promise<Photo> => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: MAX_WIDTH } }], // Only set width, height auto-calculated to maintain aspect ratio
        { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG }
      );

      const fileInfo = await FileSystem.getInfoAsync(manipulatedImage.uri);
      
      return {
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        size: fileInfo.exists && !fileInfo.isDirectory ? fileInfo.size : 0,
        uploaded: false,
      };
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: IMAGE_QUALITY,
      });

      if (!photo) return;

      // Add watermark to the image
      const watermarkedUri = await addWatermark(photo.uri);

      // Compress the image
      const compressedPhoto = await compressImage(watermarkedUri);
      
      setPhotos((prev) => [...prev, compressedPhoto]);
      setShowCamera(false);

      Alert.alert(
        'Photo Captured',
        `Photo watermarked successfully! (${Math.round(compressedPhoto.size / 1024)}KB). ${MAX_PHOTOS - photos.length - 1} remaining.`
      );
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: IMAGE_QUALITY,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Compress the selected image
        const compressedPhoto = await compressImage(asset.uri);
        
        setPhotos((prev) => [...prev, compressedPhoto]);

        Alert.alert(
          'Photo Added',
          `Photo added from gallery (${Math.round(compressedPhoto.size / 1024)}KB)`
        );
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const deletePhoto = (index: number) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPhotos((prev) => prev.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const uploadPhoto = async (photo: Photo, index: number): Promise<string | null> => {
    try {
      const infringementId = params.infringementId || 'temp';
      const fileName = `${infringementId}_${Date.now()}_${index}.jpg`;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: 'base64',
      });

      // Upload to Supabase Storage (expects base64 string)
      const { data, error } = await storage.uploadPhoto(fileName, base64);

      if (error) throw error;

      // Get public URL
      const publicUrl = storage.getPhotoUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const savePhotosOffline = async () => {
    try {
      const offlinePhotos = photos.map((photo) => ({
        uri: photo.uri,
        infringementId: params.infringementId || 'temp',
        timestamp: new Date().toISOString(),
      }));

      const existing = await AsyncStorage.getItem('offline_photos');
      const queue = existing ? JSON.parse(existing) : [];
      queue.push(...offlinePhotos);

      await AsyncStorage.setItem('offline_photos', JSON.stringify(queue));

      Alert.alert(
        'Saved Offline',
        'Photos saved locally. They will be uploaded when you are online.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving offline:', error);
      Alert.alert('Error', 'Failed to save photos offline');
    }
  };

  const uploadAllPhotos = async () => {
    if (photos.length === 0) {
      Alert.alert('No Photos', 'Please capture at least one photo');
      return;
    }

    setUploading(true);

    try {
      // Check network status
      const netInfo = await NetInfo.fetch();

      if (!netInfo.isConnected) {
        // Save offline
        await savePhotosOffline();
        setUploading(false);
        return;
      }

      // Upload all photos
      const uploadPromises = photos.map((photo, index) => uploadPhoto(photo, index));
      const uploadResults = await Promise.all(uploadPromises);

      const successCount = uploadResults.filter((url) => url !== null).length;

      if (successCount === photos.length) {
        Alert.alert(
          'Success',
          `All ${photos.length} photos uploaded successfully!`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          'Partial Upload',
          `${successCount} of ${photos.length} photos uploaded. Others saved offline.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save Offline',
              onPress: async () => {
                await savePhotosOffline();
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      Alert.alert(
        'Upload Failed',
        'Failed to upload photos. Save offline?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Offline',
            onPress: async () => {
              await savePhotosOffline();
            },
          },
        ]
      );
    } finally {
      setUploading(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (showCamera) {
    // Get watermark info for display
    const timestamp = new Date().toLocaleString('en-ZA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const officerName = params.officerName || 'Unknown Officer';
    const latitude = params.latitude ? parseFloat(params.latitude) : null;
    const longitude = params.longitude ? parseFloat(params.longitude) : null;
    const locationText = latitude && longitude 
      ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      : 'No location';

    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.cameraOverlay}>
            <View style={styles.cameraHeader}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>
                {photos.length}/{MAX_PHOTOS} Photos
              </Text>
              <TouchableOpacity style={styles.cameraButton} onPress={toggleCameraFacing}>
                <Ionicons name="camera-reverse" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Watermark Info Overlay */}
            <View style={styles.watermarkOverlay}>
              <View style={styles.watermarkRow}>
                <Ionicons name="camera" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.watermarkText}>Photo will include:</Text>
              </View>
              <View style={styles.watermarkRow}>
                <Ionicons name="time" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.watermarkDetail}>{timestamp}</Text>
              </View>
              <View style={styles.watermarkRow}>
                <Ionicons name="person" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.watermarkDetail}>{officerName}</Text>
              </View>
              <View style={styles.watermarkRow}>
                <Ionicons name="location" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.watermarkDetail}>{locationText}</Text>
              </View>
            </View>

            <View style={styles.cameraFooter}>
              <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#007AFF" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Evidence Photos</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Photo Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {photos.length} of {MAX_PHOTOS} photos captured
        </Text>
      </View>

      {/* Photos Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.photoGrid}>
        {photos.map((photo, index) => {
          // Get watermark info for each photo
          const photoTimestamp = new Date().toLocaleString('en-ZA', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          const officerName = params.officerName || 'Officer';
          const latitude = params.latitude ? parseFloat(params.latitude) : null;
          const longitude = params.longitude ? parseFloat(params.longitude) : null;
          
          return (
            <View key={index} style={styles.photoCard}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} resizeMode="contain" />
              
              {/* Permanent-Looking Watermark Overlay */}
              <View style={styles.watermarkBanner}>
                <View style={styles.watermarkRow}>
                  <Ionicons name="shield-checkmark" size={12} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.watermarkBannerText}>MANTIS | {photoTimestamp}</Text>
                </View>
                <Text style={styles.watermarkBannerSubtext}>
                  {officerName} | {latitude && longitude ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` : 'Location'}
                </Text>
              </View>
              
              {/* Watermark Badge */}
              <View style={styles.photoBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginRight: 4 }} />
                <Text style={styles.photoBadgeText}>Watermarked</Text>
              </View>
              
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePhoto(index)}
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
              
              <View style={styles.photoInfo}>
                <Text style={styles.photoSize}>{Math.round(photo.size / 1024)}KB</Text>
                <Text style={styles.photoMeta}>📍 {photoTimestamp}</Text>
                <Text style={styles.photoMeta}>👤 {officerName.split(' ')[0]}</Text>
                {latitude && longitude && (
                  <Text style={styles.photoMeta} numberOfLines={1}>
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Add Photo Placeholder */}
        {photos.length < MAX_PHOTOS && (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Add Photo</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {photos.length < MAX_PHOTOS && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.cameraActionButton]}
              onPress={() => setShowCamera(true)}
            >
              <Text style={styles.actionButtonText}>📸 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.galleryButton]}
              onPress={pickImage}
            >
              <Ionicons name="images" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.actionButtonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </>
        )}

        {photos.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.uploadButton, uploading && styles.disabledButton]}
            onPress={uploadAllPhotos}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.uploadButtonText}>
                  Upload {photos.length} Photo{photos.length > 1 ? 's' : ''}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Hidden Watermark Renderer */}
      {tempPhotoForWatermark && (
        <View style={{ position: 'absolute', left: -10000, top: -10000 }}>
          <WatermarkedImage
            imageUri={tempPhotoForWatermark}
            timestamp={new Date().toLocaleString('en-FJ', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
            officerName={params.officerName || 'Unknown Officer'}
            latitude={params.latitude ? parseFloat(params.latitude) : null}
            longitude={params.longitude ? parseFloat(params.longitude) : null}
            onCapture={handleWatermarkComplete}
          />
        </View>
      )}

      {/* Processing Overlay */}
      {processingWatermark && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.processingText}>Adding watermark...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  countContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  countText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  photoGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoCard: {
    width: '48%',
    aspectRatio: 0.75, // 3:4 ratio (portrait orientation like most phone photos)
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Fills the container, crops excess to maintain aspect ratio
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  photoSize: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  photoMeta: {
    color: '#fff',
    fontSize: 9,
    opacity: 0.9,
    marginTop: 1,
  },
  photoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  photoBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
  },
  placeholderCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  actions: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraActionButton: {
    backgroundColor: '#007AFF',
  },
  galleryButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#FF9500',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cameraTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  watermarkText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  watermarkDetail: {
    color: '#fff',
    fontSize: 11,
    marginVertical: 2,
    opacity: 0.9,
  },
  watermarkOverlayOnImage: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  watermarkOverlayText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  watermarkBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#FFD700', // Gold border for official look
  },
  watermarkBannerText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  watermarkBannerSubtext: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '600',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.95,
  },
  cameraFooter: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#007AFF',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingCard: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});
