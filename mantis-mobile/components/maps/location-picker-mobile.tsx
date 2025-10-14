import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface LocationPickerMobileProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
  };
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  height?: number;
}

export default function LocationPickerMobile({
  initialLocation,
  onLocationSelect,
  height = 400,
}: LocationPickerMobileProps) {
  const mapRef = useRef<MapView>(null);
  
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || -18.1416, // Suva, Fiji default
    longitude: initialLocation?.longitude || 178.4419,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  
  const [markerLocation, setMarkerLocation] = useState(
    initialLocation || {
      latitude: -18.1416,
      longitude: 178.4419,
    }
  );
  
  const [address, setAddress] = useState('Loading address...');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result && result.length > 0) {
        const location = result[0];
        const addressParts = [
          location.street,
          location.city || location.district,
          location.region,
          location.country,
        ].filter(Boolean);
        
        const formattedAddress = addressParts.join(', ') || 'Address not available';
        setAddress(formattedAddress);
        
        // Notify parent component
        onLocationSelect({
          latitude,
          longitude,
          address: formattedAddress,
        });
      } else {
        setAddress('Address not available');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } finally {
      setLoading(false);
    }
  };

  // Initialize with current location or initial location
  useEffect(() => {
    if (initialLocation) {
      reverseGeocode(initialLocation.latitude, initialLocation.longitude);
    } else {
      getCurrentLocation();
    }
  }, []);

  // Get user's current location
  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this feature.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setMarkerLocation(newLocation);
      setRegion({
        ...newLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Animate to new location
      mapRef.current?.animateToRegion(
        {
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );

      await reverseGeocode(newLocation.latitude, newLocation.longitude);
    } catch (error: any) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setGettingLocation(false);
    }
  };

  // Handle map press to place marker
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setMarkerLocation(coordinate);
    reverseGeocode(coordinate.latitude, coordinate.longitude);
  };

  // Handle marker drag
  const handleMarkerDragEnd = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setMarkerLocation(coordinate);
    reverseGeocode(coordinate.latitude, coordinate.longitude);
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        toolbarEnabled={false}>
        <Marker
          coordinate={markerLocation}
          draggable
          onDragEnd={handleMarkerDragEnd}
          title="Infringement Location"
          description={address}>
          <View style={styles.customMarker}>
            <IconSymbol name="mappin.circle.fill" size={40} color="#ef4444" />
          </View>
        </Marker>
      </MapView>

      {/* Location Info Overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <IconSymbol name="location.fill" size={20} color="#3b82f6" />
            <Text style={styles.infoTitle}>Selected Location</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Getting address...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.addressText} numberOfLines={2}>
                {address}
              </Text>
              <Text style={styles.coordinatesText}>
                {markerLocation.latitude.toFixed(6)}, {markerLocation.longitude.toFixed(6)}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
          disabled={gettingLocation}>
          {gettingLocation ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <IconSymbol name="location.fill" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          📍 Tap or drag the pin to select location
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
  infoOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  addressText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  controls: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    gap: 12,
  },
  locationButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  instructions: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 8,
    padding: 12,
  },
  instructionsText: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
  },
});
