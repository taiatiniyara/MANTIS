// LocationPicker Component
// Interactive map for selecting a location by dragging a marker

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getMapStyle,
  FIJI_DEFAULT_REGION,
  formatCoordinates,
  isValidCoordinate,
  isWithinFiji,
  MAP_CONFIG,
} from './map-styles';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps {
  initialLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  onCancel: () => void;
}

export function LocationPicker({
  initialLocation,
  onLocationSelect,
  onCancel,
}: LocationPickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mapRef = useRef<MapView>(null);

  // State
  const [region, setRegion] = useState<Region>(
    initialLocation
      ? {
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: MAP_CONFIG.SINGLE_LOCATION_DELTA,
          longitudeDelta: MAP_CONFIG.SINGLE_LOCATION_DELTA,
        }
      : FIJI_DEFAULT_REGION
  );
  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLocation?.latitude || FIJI_DEFAULT_REGION.latitude,
    longitude: initialLocation?.longitude || FIJI_DEFAULT_REGION.longitude,
  });
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Request location permissions on mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed to use this feature.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  // Get current location
  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in settings.');
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newPosition = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setMarkerPosition(newPosition);
      
      const newRegion = {
        ...newPosition,
        latitudeDelta: MAP_CONFIG.SINGLE_LOCATION_DELTA,
        longitudeDelta: MAP_CONFIG.SINGLE_LOCATION_DELTA,
      };
      setRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, MAP_CONFIG.ANIMATION_DURATION);
      }

      // Reverse geocode to get address
      await reverseGeocode(newPosition.latitude, newPosition.longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const result = results[0];
        const addressParts = [
          result.street,
          result.city,
          result.region,
          result.country,
        ].filter(Boolean);
        const fullAddress = addressParts.join(', ');
        setAddress(fullAddress);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  // Handle marker drag
  const handleMarkerDragEnd = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    
    // Reverse geocode new position
    await reverseGeocode(latitude, longitude);
  };

  // Handle map press
  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    
    // Reverse geocode new position
    await reverseGeocode(latitude, longitude);
  };

  // Search for address
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const results = await Location.geocodeAsync(searchQuery);
      
      if (results.length > 0) {
        const result = results[0];
        const newPosition = {
          latitude: result.latitude,
          longitude: result.longitude,
        };
        
        setMarkerPosition(newPosition);
        setAddress(searchQuery);
        
        const newRegion = {
          ...newPosition,
          latitudeDelta: MAP_CONFIG.SINGLE_LOCATION_DELTA,
          longitudeDelta: MAP_CONFIG.SINGLE_LOCATION_DELTA,
        };
        setRegion(newRegion);

        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, MAP_CONFIG.ANIMATION_DURATION);
        }
      } else {
        Alert.alert('Not Found', 'Could not find the specified location.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Error', 'Failed to search for location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Confirm location selection
  const handleConfirm = () => {
    if (!isValidCoordinate(markerPosition.latitude, markerPosition.longitude)) {
      Alert.alert('Invalid Location', 'Please select a valid location on the map.');
      return;
    }

    if (!isWithinFiji(markerPosition.latitude, markerPosition.longitude)) {
      Alert.alert(
        'Location Outside Fiji',
        'The selected location appears to be outside Fiji. Are you sure you want to continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              onLocationSelect({
                ...markerPosition,
                address: address || undefined,
              });
            },
          },
        ]
      );
      return;
    }

    onLocationSelect({
      ...markerPosition,
      address: address || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, isDark && styles.headerDark]}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
          Pick Location
        </Text>
        <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={[styles.searchContainer, isDark && styles.searchContainerDark]}>
        <TextInput
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="Search address or place..."
          placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          region={region}
          onRegionChangeComplete={setRegion}
          customMapStyle={getMapStyle(isDark)}
          showsUserLocation={true}
          showsMyLocationButton={false}
          onPress={handleMapPress}
          onMapReady={() => setMapReady(true)}
        >
          <Marker
            coordinate={markerPosition}
            draggable
            onDragEnd={handleMarkerDragEnd}
            pinColor="#F97316"
          />
        </MapView>

        {/* Loading indicator */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0284C7" />
          </View>
        )}

        {/* Current location button */}
        <TouchableOpacity
          style={[styles.currentLocationButton, isDark && styles.currentLocationButtonDark]}
          onPress={handleGetCurrentLocation}
          disabled={loading}
        >
          <Text style={styles.currentLocationButtonText}>📍</Text>
        </TouchableOpacity>
      </View>

      {/* Info panel */}
      <View style={[styles.infoPanel, isDark && styles.infoPanelDark]}>
        <Text style={[styles.infoLabel, isDark && styles.infoLabelDark]}>
          Selected Location:
        </Text>
        <Text style={[styles.coordinatesText, isDark && styles.coordinatesTextDark]}>
          {formatCoordinates(markerPosition.latitude, markerPosition.longitude)}
        </Text>
        {address ? (
          <Text style={[styles.addressText, isDark && styles.addressTextDark]}>
            {address}
          </Text>
        ) : null}
        <Text style={[styles.hintText, isDark && styles.hintTextDark]}>
          💡 Tap or drag the marker to adjust the location
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  cancelButtonTextDark: {
    color: '#9CA3AF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerTitleDark: {
    color: '#F9FAFB',
  },
  confirmButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  searchContainerDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  searchInputDark: {
    backgroundColor: '#374151',
    color: '#F9FAFB',
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationButtonDark: {
    backgroundColor: '#374151',
  },
  currentLocationButtonText: {
    fontSize: 24,
  },
  infoPanel: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  infoPanelDark: {
    backgroundColor: '#1F2937',
    borderTopColor: '#374151',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoLabelDark: {
    color: '#D1D5DB',
  },
  coordinatesText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#111827',
    marginBottom: 4,
  },
  coordinatesTextDark: {
    color: '#F9FAFB',
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 8,
  },
  addressTextDark: {
    color: '#9CA3AF',
  },
  hintText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 8,
  },
  hintTextDark: {
    color: '#6B7280',
  },
});
