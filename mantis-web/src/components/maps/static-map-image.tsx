import { getStaticMapUrl } from '@/lib/maps/utils';
import { useState } from 'react';

interface StaticMapImageProps {
  lat: number;
  lng: number;
  width?: number;
  height?: number;
  zoom?: number;
  markerColor?: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Static map image using Google Static Maps API
 * More cost-effective than dynamic maps for simple displays
 * $2 per 1,000 requests vs $7 per 1,000 for dynamic maps
 */
export function StaticMapImage({
  lat,
  lng,
  width = 300,
  height = 200,
  zoom = 16,
  markerColor = 'orange',
  alt = 'Location map',
  className = '',
  onClick,
}: StaticMapImageProps) {
  const [error, setError] = useState(false);

  const mapUrl = getStaticMapUrl(lat, lng, { width, height, zoom, markerColor });

  if (error) {
    return (
      <div
        className={`bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <p className="text-sm text-slate-500">Map unavailable</p>
      </div>
    );
  }

  return (
    <img
      src={mapUrl}
      alt={alt}
      width={width}
      height={height}
      className={`rounded-lg ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''} ${className}`}
      onClick={onClick}
      onError={() => setError(true)}
    />
  );
}
