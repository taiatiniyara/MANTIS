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
  dimensions?: { width: number; height: number };
  onReady?: () => void;
}

export function WatermarkedImage({ 
  imageUri, 
  watermarkData, 
  style,
  showWatermark = true,
  dimensions,
  onReady,
}: WatermarkedImageProps) {
  const watermarkText = buildWatermarkText(watermarkData);
  const lines = watermarkText.split('\n');

  const baseWidth = 800; // reference width to scale watermark sizing
  const scale = dimensions?.width
    ? Math.max(1.0, Math.min(1.6, dimensions.width / baseWidth))
    : 1.0;

  const containerStyle = dimensions
    ? [{ width: dimensions.width, height: dimensions.height }, style]
    : [styles.container, style];

  const imageStyle = dimensions
    ? [{ width: '100%', height: '100%' }]
    : [styles.image];

  return (
    <View style={containerStyle}>
      <Image 
        source={{ uri: imageUri }} 
        style={imageStyle}
        resizeMode={dimensions ? 'cover' : 'cover'}
        onLoadEnd={onReady}
      />
      {showWatermark && (
        <View style={[styles.watermarkContainer, { padding: 20 * scale }]}>
          <View
            style={[
              styles.watermarkBox,
              {
                paddingVertical: 18 * scale,
                paddingHorizontal: 22 * scale,
                borderRadius: 12 * scale,
              },
            ]}
          >
            {lines.map((line, index) => (
              <Text
                key={index}
                style={[
                  styles.watermarkText,
                  {
                    fontSize: 32 * scale,
                    lineHeight: 40 * scale,
                    marginBottom: 10 * scale,
                  },
                ]}
              >
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
    padding: 20,
  },
  watermarkBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingVertical: 18,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  watermarkText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    marginBottom: 10,
    fontFamily: 'System',
  },
});
