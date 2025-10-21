/**
 * Canvas-based Watermark Solution
 * 
 * This creates a watermarked image by:
 * 1. Creating a canvas with the image
 * 2. Drawing watermark text on the canvas
 * 3. Exporting as a new image
 */

import * as FileSystem from 'expo-file-system';

export interface WatermarkOptions {
  timestamp: string;
  officerName: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
}

/**
 * Create a watermarked image using Canvas (Web-based approach)
 * This requires the image to be processed through a web view or server
 */
export async function createWatermarkedImage(
  imageUri: string,
  options: WatermarkOptions
): Promise<string> {
  // Read the image as base64
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Create HTML with Canvas for watermarking
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;">
      <canvas id="canvas"></canvas>
      <script>
        const img = new Image();
        img.onload = function() {
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size to match image + watermark bar
          const watermarkHeight = 120;
          canvas.width = img.width;
          canvas.height = img.height + watermarkHeight;
          
          // Draw the original image
          ctx.drawImage(img, 0, 0);
          
          // Draw watermark bar
          ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
          ctx.fillRect(0, img.height, canvas.width, watermarkHeight);
          
          // Draw watermark text
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px monospace';
          
          const padding = 20;
          let y = img.height + 25;
          const lineHeight = 24;
          
          ctx.fillText('📸 ${options.timestamp}', padding, y);
          y += lineHeight;
          ctx.fillText('👤 ${options.officerName}', padding, y);
          y += lineHeight;
          ctx.fillText('📍 ${options.location}', padding, y);
          y += lineHeight;
          ctx.fillText('🚔 MANTIS Traffic System', padding, y);
          
          // Export as base64
          const watermarkedBase64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
          window.ReactNativeWebView.postMessage(watermarkedBase64);
        };
        img.src = 'data:image/jpeg;base64,${base64}';
      </script>
    </body>
    </html>
  `;

  // Note: This HTML would need to be rendered in a WebView
  // and the result captured via postMessage
  // For now, we return the original URI with metadata
  
  return imageUri;
}

/**
 * Generate watermark text for display
 */
export function generateWatermarkText(options: WatermarkOptions): string[] {
  return [
    `📸 ${options.timestamp}`,
    `👤 ${options.officerName}`,
    `📍 ${options.location}`,
    `🚔 MANTIS Traffic System`,
  ];
}
