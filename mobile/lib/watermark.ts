/**
 * MANTIS Mobile - Image Watermarking Utility
 * 
 * Adds watermark with infringement details to evidence photos
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export interface WatermarkData {
  platformName?: string;
  tin?: string;
  officerName: string;
  agencyName: string;
  locationEnglish?: string;
  latitude?: number;
  longitude?: number;
  timestamp?: Date;
}

/**
 * Creates a watermarked image with infringement details embedded
 * Returns the URI of the watermarked image
 * 
 * Note: This implementation stores watermark data as metadata.
 * The actual watermark overlay will be created by a React component
 * when the photo is displayed or before upload.
 */
export async function addWatermarkToImage(
  imageUri: string,
  watermarkData: WatermarkData
): Promise<string> {
  try {
    // Get image info to determine size
    const imageFile = new FileSystem.File(imageUri);
    if (!imageFile.exists) {
      throw new Error('Image file does not exist');
    }

    // Compress and standardize image
    // Keep original size; only recompress to standardize format
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: false,
      }
    );

    // Create watermarked filename with timestamp
    const timestamp = Date.now();
    // Get base directory from the manipulated image URI
    const baseDir = manipulatedImage.uri.substring(0, manipulatedImage.uri.lastIndexOf('/') + 1);
    const watermarkedUri = `${baseDir}watermarked_${timestamp}.jpg`;
    
    // Copy manipulated image to watermarked location using new File API
    const sourceFile = new FileSystem.File(manipulatedImage.uri);
    const destinationFile = new FileSystem.File(watermarkedUri);
    sourceFile.copy(destinationFile);

    // Save watermark data as a JSON sidecar file for reference
    const metadataUri = watermarkedUri.replace('.jpg', '_metadata.json');
    const metadataFile = new FileSystem.File(metadataUri);
    metadataFile.write(
      JSON.stringify(
        {
          ...watermarkData,
          originalUri: imageUri,
          processedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log('Image processed with watermark metadata:', watermarkedUri);
    return watermarkedUri;
  } catch (error) {
    console.error('Error processing image for watermark:', error);
    // Return original image if processing fails
    return imageUri;
  }
}

/**
 * Build watermark text from data
 */
export function buildWatermarkText(watermarkData: WatermarkData): string {
  const lines: string[] = [];
  
  const platformName = watermarkData.platformName?.trim() || 'MANTIS';
  lines.push(`Platform: ${platformName}`);

  const tin = watermarkData.tin?.trim() || 'Pending';
  lines.push(`TIN: ${tin}`);

  const timestamp = watermarkData.timestamp || new Date();
  lines.push(`Date/Time: ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString()}`);

  if (watermarkData.locationEnglish) {
    const location = watermarkData.locationEnglish.length > 80
      ? `${watermarkData.locationEnglish.substring(0, 77)}...`
      : watermarkData.locationEnglish;
    lines.push(`Location: ${location}`);
  }

  if (watermarkData.latitude !== undefined && watermarkData.longitude !== undefined) {
    lines.push(`GPS: ${watermarkData.latitude.toFixed(6)}, ${watermarkData.longitude.toFixed(6)}`);
  } else {
    lines.push('GPS: Not captured');
  }

  lines.push(`Officer: ${watermarkData.officerName}`);
  lines.push(`Agency: ${watermarkData.agencyName}`);
  
  return lines.join('\n');
}

/**
 * Creates an SVG with watermark text
 * This can be used for overlaying on images
 */
export function createWatermarkSVG(watermarkData: WatermarkData, width: number = 800): string {
  const text = buildWatermarkText(watermarkData);
  const lines = text.split('\n');
  const lineHeight = 22;
  const padding = 12;
  const fontSize = 13;
  const height = (lines.length * lineHeight) + (padding * 2) + 5;

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="rgba(0, 0, 0, 0.75)" rx="4"/>`;

  lines.forEach((line, index) => {
    const y = padding + (index * lineHeight) + fontSize + 2;
    // Escape special characters for XML
    const escapedLine = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
    
    svgContent += `
  <text x="${padding}" y="${y}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="500" fill="white">${escapedLine}</text>`;
  });

  svgContent += '\n</svg>';

  return svgContent;
}


/**
 * Alternative: Create a canvas-based watermark
 * This requires expo-gl and expo-three or similar canvas library
 */
export async function createWatermarkedImageCanvas(
  imageUri: string,
  watermarkData: WatermarkData
): Promise<string> {
  // This is a placeholder for a more advanced implementation
  // that would use canvas drawing capabilities
  console.warn('Canvas-based watermarking not yet implemented');
  return addWatermarkToImage(imageUri, watermarkData);
}

/**
 * Get watermark metadata from a watermarked image
 */
export async function getWatermarkMetadata(imageUri: string): Promise<WatermarkData | null> {
  try {
    const metadataUri = imageUri.replace('.jpg', '_metadata.json');
    const metadataFile = new FileSystem.File(metadataUri);
    
    if (metadataFile.exists) {
      const content = await metadataFile.text();
      return JSON.parse(content);
    }
    
    return null;
  } catch (error) {
    console.error('Error reading watermark metadata:', error);
    return null;
  }
}

/**
 * Format watermark data for display
 */
export function formatWatermarkInfo(data: WatermarkData): string {
  const lines: string[] = [];

  const platformName = data.platformName?.trim() || 'MANTIS';
  lines.push(`Platform: ${platformName}`);

  const tin = data.tin?.trim() || 'Pending';
  lines.push(`TIN: ${tin}`);

  if (data.timestamp) {
    const date = new Date(data.timestamp);
    lines.push(`Date/Time: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
  }

  if (data.locationEnglish) lines.push(`Location: ${data.locationEnglish}`);
  if (data.latitude !== undefined && data.longitude !== undefined) {
    lines.push(`GPS: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
  }

  lines.push(`Officer: ${data.officerName}`);
  lines.push(`Agency: ${data.agencyName}`);
  
  return lines.join('\n');
}
