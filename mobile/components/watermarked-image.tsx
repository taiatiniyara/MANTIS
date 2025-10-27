import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';

interface WatermarkedImageProps {
  imageUri: string;
  timestamp: string;
  officerName: string;
  latitude: number | null;
  longitude: number | null;
  vehicleId?: string;
  infringementType?: string;
  onCapture: (uri: string) => void;
}

export function WatermarkedImage({
  imageUri,
  timestamp,
  officerName,
  latitude,
  longitude,
  vehicleId,
  infringementType,
  onCapture,
}: WatermarkedImageProps) {
  const viewRef = useRef<View>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 1920, height: 1080 });

  // Get original image dimensions
  useEffect(() => {
    Image.getSize(
      imageUri,
      (width, height) => {
        // Keep original dimensions but max out at 1920 width
        const maxWidth = 1920;
        const aspectRatio = height / width;
        
        if (width > maxWidth) {
          setImageDimensions({
            width: maxWidth,
            height: Math.round(maxWidth * aspectRatio),
          });
        } else {
          setImageDimensions({ width, height });
        }
      },
      (error) => {
        console.error('Error getting image size:', error);
        // Fallback to default dimensions
        setImageDimensions({ width: 1920, height: 1080 });
      }
    );
  }, [imageUri]);

  const captureWatermarkedImage = useCallback(async () => {
    if (!viewRef.current) return;

    try {
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.9,
      });
      onCapture(uri);
    } catch (error) {
      console.error('Error capturing watermarked image:', error);
    }
  }, [onCapture]);

  // Auto-capture after component mounts and image loads
  useEffect(() => {
    // Wait for image dimensions to be set
    if (imageDimensions.width === 1920 && imageDimensions.height === 1080) {
      // Still waiting for actual dimensions
      return;
    }
    
    // Small delay to ensure image is rendered
    const timer = setTimeout(() => {
      captureWatermarkedImage();
    }, 200);
    return () => clearTimeout(timer);
  }, [imageDimensions, captureWatermarkedImage]);

  const locationText = latitude && longitude
    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    : 'Location unavailable';

  const watermarkBarHeight = vehicleId || infringementType ? 260 : 200;
  const containerHeight = imageDimensions.height + watermarkBarHeight;

  return (
    <View 
      ref={viewRef} 
      style={[styles.container, { width: imageDimensions.width, height: containerHeight }]} 
      collapsable={false}
    >
      <View style={[styles.watermarkBar, { width: imageDimensions.width }]}>
        <View style={styles.watermarkContent}>
          <View style={styles.watermarkRow}>
            <Text style={styles.watermarkIcon}>📸</Text>
            <Text style={styles.watermarkText}>{timestamp}</Text>
          </View>
          <View style={styles.watermarkRow}>
            <Ionicons name="person" size={12} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.watermarkText}>{officerName}</Text>
          </View>
          <View style={styles.watermarkRow}>
            <Ionicons name="location" size={12} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.watermarkText} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
          {vehicleId && (
            <View style={styles.watermarkRow}>
              <Ionicons name="car" size={12} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.watermarkText}>{vehicleId}</Text>
            </View>
          )}
          {infringementType && (
            <View style={styles.watermarkRow}>
              <Ionicons name="warning" size={12} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.watermarkText} numberOfLines={1}>
                {infringementType}
              </Text>
            </View>
          )}
          <View style={styles.watermarkRow}>
            <Ionicons name="shield-checkmark" size={12} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.watermarkText}>MANTIS Traffic System</Text>
          </View>
        </View>
      </View>
      <Image
        source={{ uri: imageUri }}
        style={[styles.image, { width: imageDimensions.width, height: imageDimensions.height }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  image: {
    backgroundColor: '#000',
  },
  watermarkBar: {
    height: 200,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
  },
  watermarkContent: {
    gap: 14,
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  watermarkIcon: {
    fontSize: 28,
    width: 36,
  },
  watermarkText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    fontFamily: 'monospace',
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
});
