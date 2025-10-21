import React, { useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { captureRef } from 'react-native-view-shot';

interface WatermarkedImageProps {
  imageUri: string;
  timestamp: string;
  officerName: string;
  latitude: number | null;
  longitude: number | null;
  onCapture: (uri: string) => void;
}

export function WatermarkedImage({
  imageUri,
  timestamp,
  officerName,
  latitude,
  longitude,
  onCapture,
}: WatermarkedImageProps) {
  const viewRef = useRef<View>(null);

  const captureWatermarkedImage = useCallback(async () => {
    if (!viewRef.current) return;

    try {
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.8,
      });
      onCapture(uri);
    } catch (error) {
      console.error('Error capturing watermarked image:', error);
    }
  }, [onCapture]);

  // Auto-capture after component mounts and image loads
  React.useEffect(() => {
    // Small delay to ensure image is rendered
    const timer = setTimeout(() => {
      captureWatermarkedImage();
    }, 100);
    return () => clearTimeout(timer);
  }, [captureWatermarkedImage]);

  const locationText = latitude && longitude
    ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    : 'Location unavailable';

  return (
    <View ref={viewRef} style={styles.container} collapsable={false}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.watermarkBar}>
        <View style={styles.watermarkContent}>
          <View style={styles.watermarkRow}>
            <Text style={styles.watermarkIcon}>📸</Text>
            <Text style={styles.watermarkText}>{timestamp}</Text>
          </View>
          <View style={styles.watermarkRow}>
            <Text style={styles.watermarkIcon}>👤</Text>
            <Text style={styles.watermarkText}>{officerName}</Text>
          </View>
          <View style={styles.watermarkRow}>
            <Text style={styles.watermarkIcon}>📍</Text>
            <Text style={styles.watermarkText} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
          <View style={styles.watermarkRow}>
            <Text style={styles.watermarkIcon}>🚔</Text>
            <Text style={styles.watermarkText}>MANTIS Traffic System</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 1920, // Full HD width
    height: 1200, // Image + watermark bar
    backgroundColor: '#000',
  },
  image: {
    width: 1920,
    height: 1080,
    backgroundColor: '#000',
  },
  watermarkBar: {
    width: 1920,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  watermarkContent: {
    gap: 8,
  },
  watermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  watermarkIcon: {
    fontSize: 18,
    width: 24,
  },
  watermarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    flex: 1,
  },
});
