// InfringementMapView Component
// Displays a single infringement location on an interactive map

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getMapStyle,
  getRegionForCoordinates,
  formatCoordinates,
  isValidCoordinate,
  MAP_CONFIG,
} from './map-styles';

interface InfringementMapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
  showDirections?: boolean;
  markerColor?: string;
  height?: number;
}

export function InfringementMapView({
  latitude,
  longitude,
  title = 'Infringement Location',
  description,
  showDirections = true,
  markerColor = '#F97316', // Orange for default
  height = 300,
}: InfringementMapViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('standard');

  // Validate coordinates
  if (!isValidCoordinate(latitude, longitude)) {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid coordinates</Text>
          <Text style={styles.errorSubtext}>
            {formatCoordinates(latitude, longitude)}
          </Text>
        </View>
      </View>
    );
  }

  // Get initial region
  const region = getRegionForCoordinates(latitude, longitude);

  // Open native maps app for directions
  const handleGetDirections = () => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?daddr=${latitude},${longitude}`,
      android: `${scheme}${latitude},${longitude}?q=${latitude},${longitude}(${encodeURIComponent(title)})`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`);
        }
      });
    }
  };

  // Animate to location
  const handleCenterMap = () => {
    if (mapRef.current && mapReady) {
      mapRef.current.animateToRegion(region, MAP_CONFIG.ANIMATION_DURATION);
    }
  };

  // Toggle map type
  const handleToggleMapType = () => {
    const types: Array<'standard' | 'satellite' | 'hybrid'> = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        mapType={mapType}
        customMapStyle={getMapStyle(isDark)}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onMapReady={() => setMapReady(true)}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          title={title}
          description={description}
          pinColor={markerColor}
        />
      </MapView>

      {/* Loading indicator */}
      {!mapReady && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        {/* Map type toggle */}
        <TouchableOpacity
          style={[styles.controlButton, isDark && styles.controlButtonDark]}
          onPress={handleToggleMapType}
        >
          <Text style={[styles.controlButtonText, isDark && styles.controlButtonTextDark]}>
            {mapType === 'standard' ? '🗺️' : mapType === 'satellite' ? '🛰️' : '🌐'}
          </Text>
        </TouchableOpacity>

        {/* Center map button */}
        <TouchableOpacity
          style={[styles.controlButton, isDark && styles.controlButtonDark]}
          onPress={handleCenterMap}
        >
          <Text style={[styles.controlButtonText, isDark && styles.controlButtonTextDark]}>
            📍
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom info bar */}
      <View style={[styles.infoBar, isDark && styles.infoBarDark]}>
        <View style={styles.infoLeft}>
          <Text style={[styles.coordinatesText, isDark && styles.coordinatesTextDark]}>
            {formatCoordinates(latitude, longitude)}
          </Text>
        </View>

        {/* Get Directions button */}
        {showDirections && (
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleGetDirections}
          >
            <Text style={styles.directionsButtonText}>🧭 Directions</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  controlsContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 8,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonDark: {
    backgroundColor: '#374151',
  },
  controlButtonText: {
    fontSize: 20,
  },
  controlButtonTextDark: {
    opacity: 0.9,
  },
  infoBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoBarDark: {
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    borderTopColor: '#374151',
  },
  infoLeft: {
    flex: 1,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  coordinatesTextDark: {
    color: '#9CA3AF',
  },
  directionsButton: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
