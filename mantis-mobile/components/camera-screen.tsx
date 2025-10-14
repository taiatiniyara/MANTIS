import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export interface CapturedPhoto {
  uri: string;
  id: string;
}

interface CameraScreenProps {
  visible: boolean;
  onClose: () => void;
  onPhotosCaptured: (photos: CapturedPhoto[]) => void;
  maxPhotos?: number;
  existingPhotos?: CapturedPhoto[];
}

export default function CameraScreen({
  visible,
  onClose,
  onPhotosCaptured,
  maxPhotos = 5,
  existingPhotos = [],
}: CameraScreenProps) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>(existingPhotos);
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  if (!visible) return null;

  // Permission loading
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  // Permission not granted
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={80} color="#64B5F6" />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionMessage}>
            MANTIS needs access to your camera to capture evidence photos for infringements.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;

    if (photos.length >= maxPhotos) {
      Alert.alert(
        'Maximum Photos Reached',
        `You can only attach up to ${maxPhotos} photos per infringement.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo) {
        const newPhoto: CapturedPhoto = {
          uri: photo.uri,
          id: Date.now().toString(),
        };
        setPhotos([...photos, newPhoto]);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    if (photos.length >= maxPhotos) {
      Alert.alert(
        'Maximum Photos Reached',
        `You can only attach up to ${maxPhotos} photos per infringement.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant photo library access to select photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxPhotos - photos.length,
      });

      if (!result.canceled && result.assets) {
        const newPhotos: CapturedPhoto[] = result.assets.map((asset) => ({
          uri: asset.uri,
          id: Date.now().toString() + Math.random().toString(),
        }));
        setPhotos([...photos, ...newPhotos]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to select photos. Please try again.');
    }
  };

  const deletePhoto = (id: string) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPhotos(photos.filter((photo) => photo.id !== id));
        },
      },
    ]);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const handleDone = () => {
    onPhotosCaptured(photos);
    onClose();
  };

  const handleCancel = () => {
    if (photos.length > 0) {
      Alert.alert(
        'Discard Photos?',
        'Are you sure you want to discard the captured photos?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setPhotos([]);
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        {/* Top Bar */}
        <SafeAreaView style={styles.topBar}>
          <TouchableOpacity style={styles.topButton} onPress={handleCancel}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <Text style={styles.photoCount}>
            {photos.length}/{maxPhotos} Photos
          </Text>
          <TouchableOpacity style={styles.topButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={30} color="white" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Bottom Controls */}
        <View style={styles.bottomBar}>
          {/* Photo Gallery Preview */}
          {photos.length > 0 && (
            <View style={styles.galleryContainer}>
              <FlatList
                data={photos}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.thumbnailContainer}>
                    <Image source={{ uri: item.uri }} style={styles.thumbnail} />
                    <TouchableOpacity
                      style={styles.deleteThumbnail}
                      onPress={() => deletePhoto(item.id)}
                    >
                      <Ionicons name="close-circle" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryList}
              />
            </View>
          )}

          {/* Camera Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.galleryButton} onPress={pickFromGallery}>
              <Ionicons name="images" size={32} color="white" />
              <Text style={styles.galleryButtonText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.captureButton,
                photos.length >= maxPhotos && styles.captureButtonDisabled,
              ]}
              onPress={takePicture}
              disabled={photos.length >= maxPhotos}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.doneButton,
                photos.length === 0 && styles.doneButtonDisabled,
              ]}
              onPress={handleDone}
              disabled={photos.length === 0}
            >
              <Ionicons
                name="checkmark"
                size={32}
                color={photos.length === 0 ? '#666' : 'white'}
              />
              <Text
                style={[
                  styles.doneButtonText,
                  photos.length === 0 && styles.doneButtonTextDisabled,
                ]}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    width: '100%',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topButton: {
    padding: 8,
  },
  photoCount: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  galleryContainer: {
    paddingVertical: 12,
  },
  galleryList: {
    paddingHorizontal: 16,
  },
  thumbnailContainer: {
    marginRight: 8,
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  deleteThumbnail: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF5350',
    borderRadius: 12,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  galleryButton: {
    alignItems: 'center',
    padding: 8,
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  captureButtonDisabled: {
    opacity: 0.3,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  doneButton: {
    alignItems: 'center',
    padding: 8,
  },
  doneButtonDisabled: {
    opacity: 0.3,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  doneButtonTextDisabled: {
    color: '#666',
  },
});
