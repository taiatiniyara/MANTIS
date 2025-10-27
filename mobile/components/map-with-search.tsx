/**
 * Interactive Map with Address Search for MANTIS Mobile
 * Enhanced map view with geocoding and address input
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Keyboard,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { gpsService, LocationData } from '@/lib/gps-service';
import { geocodingService, GeocodedAddress } from '@/lib/geocoding-service';
import { customMapStyle } from '@/constants/mapStyle';

interface MapWithSearchProps {
  onLocationSelect?: (address: GeocodedAddress) => void;
  initialAddress?: GeocodedAddress;
  showSearchBar?: boolean;
  allowMarkerDrag?: boolean; // Deprecated - now uses stationary marker by default
}

export function MapWithSearch({
  onLocationSelect,
  initialAddress,
  showSearchBar = true,
  allowMarkerDrag = true,
}: MapWithSearchProps) {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [centerPosition, setCenterPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(initialAddress ? {
    latitude: initialAddress.latitude,
    longitude: initialAddress.longitude,
  } : null);
  const [markerAddress, setMarkerAddress] = useState<string>(
    initialAddress?.formattedAddress || ''
  );
  const [region, setRegion] = useState<Region | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    loadInitialLocation();
  }, []);

  const loadInitialLocation = async () => {
    try {
      if (initialAddress) {
        const newRegion = {
          latitude: initialAddress.latitude,
          longitude: initialAddress.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        setCenterPosition({
          latitude: initialAddress.latitude,
          longitude: initialAddress.longitude,
        });
        setMarkerAddress(initialAddress.formattedAddress);
      } else {
        const hasPermission = await gpsService.hasPermissions();
        if (hasPermission) {
          const loc = await gpsService.getCurrentLocation();
          if (loc) {
            setLocation(loc);
            const newRegion = {
              latitude: loc.latitude,
              longitude: loc.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            setRegion(newRegion);
            setCenterPosition({
              latitude: loc.latitude,
              longitude: loc.longitude,
            });
            
            // Get address for current location
            const address = await geocodingService.reverseGeocode(
              loc.latitude,
              loc.longitude
            );
            if (address) {
              setMarkerAddress(address.formattedAddress);
            }
          } else {
            // Default to Fiji
            setDefaultFijiLocation();
          }
        } else {
          setDefaultFijiLocation();
        }
      }
    } catch (error) {
      console.error('Error loading location:', error);
      setDefaultFijiLocation();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultFijiLocation = () => {
    const fijiRegion = {
      latitude: -18.1416,
      longitude: 178.4419,
      latitudeDelta: 0.5,
      longitudeDelta: 0.5,
    };
    setRegion(fijiRegion);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    Keyboard.dismiss();

    try {
      const result = await geocodingService.geocodeAddress(searchQuery);
      
      if (result) {
        const newRegion = {
          latitude: result.latitude,
          longitude: result.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setCenterPosition({
          latitude: result.latitude,
          longitude: result.longitude,
        });
        setMarkerAddress(result.formattedAddress);

        // Animate to the location
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      } else {
        alert('Address not found. Please try a different search.');
      }
    } catch (error) {
      console.error('Error searching address:', error);
      alert('Error searching for address. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleRegionChangeStart = () => {
    setIsDragging(true);
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    setIsDragging(false);
    setRegion(newRegion);
    setCenterPosition({
      latitude: newRegion.latitude,
      longitude: newRegion.longitude,
    });

    // Get address for the center position
    try {
      const address = await geocodingService.reverseGeocode(
        newRegion.latitude,
        newRegion.longitude
      );
      if (address) {
        setMarkerAddress(address.formattedAddress);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const centerOnUser = async () => {
    const loc = await gpsService.getCurrentLocation();
    if (loc && mapRef.current) {
      const newRegion = {
        latitude: loc.latitude,
        longitude: loc.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      mapRef.current.animateToRegion(newRegion, 1000);
      setCenterPosition({
        latitude: loc.latitude,
        longitude: loc.longitude,
      });

      // Get address
      const address = await geocodingService.reverseGeocode(
        loc.latitude,
        loc.longitude
      );
      if (address) {
        setMarkerAddress(address.formattedAddress);
        if (onLocationSelect) {
          onLocationSelect(address);
        }
      }
    }
  };

  const confirmLocation = () => {
    if (centerPosition) {
      const address: GeocodedAddress = {
        formattedAddress: markerAddress,
        latitude: centerPosition.latitude,
        longitude: centerPosition.longitude,
      };
      if (onLocationSelect) {
        onLocationSelect(address);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      {showSearchBar && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for an address..."
              placeholderTextColor="#999"
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searching ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeStart={handleRegionChangeStart}
        onRegionChangeComplete={handleRegionChangeComplete}
        customMapStyle={customMapStyle}
      />

      {/* Stationary Center Marker */}
      <View style={styles.centerMarkerContainer} pointerEvents="none">
        <View style={[styles.centerMarker, isDragging && styles.centerMarkerDragging]}>
          <Ionicons name="location" size={48} color="#007AFF" />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
          <Ionicons name="navigate" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Address Display */}
      {markerAddress && (
        <View style={styles.addressDisplay}>
          <View style={styles.addressHeader}>
            <Ionicons name="location" size={18} color="#007AFF" />
            <Text style={styles.addressTitle}>Selected Location</Text>
          </View>
          <Text style={styles.addressText} numberOfLines={2}>
            {markerAddress}
          </Text>
          {centerPosition && (
            <Text style={styles.coordinates}>
              {centerPosition.latitude.toFixed(6)}, {centerPosition.longitude.toFixed(6)}
            </Text>
          )}
          <TouchableOpacity style={styles.confirmButton} onPress={confirmLocation}>
            <Text style={styles.confirmButtonText}>Confirm Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Help Text */}
      <View style={styles.helpText}>
        <Text style={styles.helpTextContent}>
          Drag map to select location
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  map: {
    flex: 1,
  },
  centerMarkerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48, // Offset to make pin point at center
  },
  centerMarkerDragging: {
    transform: [{ translateY: -10 }], // Lift marker when dragging
  },
  controls: {
    position: 'absolute',
    right: 16,
    bottom: 200,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addressDisplay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  addressText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 6,
  },
  coordinates: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    padding: 8,
  },
  helpTextContent: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});
