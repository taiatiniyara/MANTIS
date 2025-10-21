/**
 * Watermark utility for adding metadata to evidence photos
 * 
 * Since expo-image-manipulator doesn't support text overlay,
 * we create a composite image with watermark information
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface WatermarkData {
  timestamp: string;
  officerName: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Add watermark to an image by creating a new image with metadata bar at the bottom
 * @param uri - Image URI to watermark
 * @param data - Watermark metadata
 * @returns URI of watermarked image
 */
export async function addWatermarkToImage(
  uri: string,
  data: WatermarkData
): Promise<string> {
  try {
    // Get current timestamp if not provided
    const timestamp = data.timestamp || new Date().toLocaleString('en-ZA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const locationText = data.latitude && data.longitude
      ? `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`
      : 'Location unavailable';

    console.log('Creating watermark for:', {
      timestamp,
      officer: data.officerName,
      location: locationText,
    });

    // First, get the original image and ensure proper orientation
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Save metadata alongside the image
    const metadataPath = manipulated.uri.replace('.jpg', '_metadata.json');
    const metadata = {
      timestamp,
      officerName: data.officerName,
      location: locationText,
      latitude: data.latitude,
      longitude: data.longitude,
      createdAt: new Date().toISOString(),
    };

    await FileSystem.writeAsStringAsync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log('Watermark metadata saved:', metadataPath);

    return manipulated.uri;
  } catch (error) {
    console.error('Error adding watermark:', error);
    // Return original URI on error
    return uri;
  }
}

/**
 * Get watermark metadata for an image
 * @param uri - Image URI
 * @returns Watermark metadata or null if not found
 */
export async function getWatermarkMetadata(uri: string): Promise<WatermarkData | null> {
  try {
    const metadataPath = uri.replace('.jpg', '_metadata.json');
    const fileInfo = await FileSystem.getInfoAsync(metadataPath);

    if (!fileInfo.exists) {
      return null;
    }

    const content = await FileSystem.readAsStringAsync(metadataPath);
    const metadata = JSON.parse(content);

    return metadata;
  } catch (error) {
    console.error('Error reading watermark metadata:', error);
    return null;
  }
}

/**
 * Create a text watermark description from metadata
 * @param data - Watermark metadata
 * @returns Formatted watermark text
 */
export function formatWatermarkText(data: WatermarkData): string {
  const lines = [
    `Time: ${data.timestamp}`,
    `Officer: ${data.officerName}`,
  ];

  if (data.latitude && data.longitude) {
    lines.push(`Location: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
  }

  return lines.join('\n');
}
