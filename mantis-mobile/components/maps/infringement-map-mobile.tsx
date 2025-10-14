import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface InfringementMapMobileProps {
  latitude: number;
  longitude: number;
  address?: string;
  height?: number;
  showDirections?: boolean;
}

export default function InfringementMapMobile({
  latitude,
  longitude,
  address,
  height = 300,
  showDirections = true,
}: InfringementMapMobileProps) {
  const mapRef = useRef<MapView>(null);

  const region = {
    latitude,
    longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  // Open directions in native maps app
  const handleGetDirections = () => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    
    const latLng = `${latitude},${longitude}`;
    const label = 'Infringement Location';
    
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Alert.alert('Error', 'Unable to open maps application');
          }
        })
        .catch((err) => {
          console.error('Error opening maps:', err);
          Alert.alert('Error', 'Failed to open directions');
        });
    }
  };

  // Zoom to marker
  const handleZoomToMarker = () => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      },
      500
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}>
        <Marker
          coordinate={{ latitude, longitude }}
          title="Infringement Location"
          description={address}>
          <View style={styles.customMarker}>
            <IconSymbol name="mappin.circle.fill" size={40} color="#ef4444" />
          </View>
        </Marker>
      </MapView>

      {/* Address Overlay */}
      {address && (
        <View style={styles.addressOverlay}>
          <View style={styles.addressCard}>
            <IconSymbol name="location.fill" size={16} color="#64748b" />
            <Text style={styles.addressText} numberOfLines={2}>
              {address}
            </Text>
          </View>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {showDirections && (
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleGetDirections}>
            <IconSymbol name="arrow.triangle.turn.up.right.circle.fill" size={24} color="#fff" />
            <Text style={styles.directionsText}>Directions</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={handleZoomToMarker}>
          <IconSymbol name="location.circle.fill" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Coordinates */}
      <View style={styles.coordinatesOverlay}>
        <Text style={styles.coordinatesText}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '500',
  },
  controls: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    gap: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  directionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  zoomButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  coordinatesOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  coordinatesText: {
    fontSize: 11,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
