/**
 * MANTIS Mobile - Watermarked Image Component
 * 
 * Displays an image with watermark overlay
 */

import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { WatermarkData, buildWatermarkText } from '@/lib/watermark';

interface WatermarkedImageProps {
  imageUri: string;
  watermarkData: WatermarkData;
  style?: any;
  showWatermark?: boolean;
}

export function WatermarkedImage({ 
  imageUri, 
  watermarkData, 
  style,
  showWatermark = true 
}: WatermarkedImageProps) {
  const watermarkText = buildWatermarkText(watermarkData);
  const lines = watermarkText.split('\n');

  return (
    <View style={[styles.container, style]}>
      <Image 
        source={{ uri: imageUri }} 
        style={styles.image}
        resizeMode="cover"
      />
      {showWatermark && (
        <View style={styles.watermarkContainer}>
          <View style={styles.watermarkBox}>
            {lines.map((line, index) => (
              <Text key={index} style={styles.watermarkText}>
                {line}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  watermarkContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  watermarkBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 10,
    borderRadius: 6,
  },
  watermarkText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
    fontFamily: 'System',
  },
});
