/**
 * Map Component for MANTIS Mobile
 * Displays infringements on Google Maps with clustering and filtering
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { gpsService, LocationData } from '@/lib/gps-service';

interface InfringementMarker {
  id: string;
  latitude: number;
  longitude: number;
  vehicleId: string;
  status: 'pending' | 'paid' | 'disputed' | 'cancelled';
  fineAmount: number;
  createdAt: string;
}

interface RoutePolygon {
  id: string;
  name: string;
  coordinates: Array<{ latitude: number; longitude: number }>;
  strokeColor?: string;
  fillColor?: string;
}

interface MapComponentProps {
  infringements?: InfringementMarker[];
  routes?: RoutePolygon[];
  onMarkerPress?: (infringement: InfringementMarker) => void;
  showUserLocation?: boolean;
  initialRegion?: Region;
}

export function MapComponent({
  infringements = [],
  routes = [],
  onMarkerPress,
  showUserLocation = true,
  initialRegion,
}: MapComponentProps) {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region | undefined>(initialRegion);

  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      const hasPermission = await gpsService.hasPermissions();
      if (hasPermission) {
        const loc = await gpsService.getCurrentLocation();
        if (loc) {
          setLocation(loc);

          // Set initial region to user location if not provided
          if (!initialRegion) {
            setRegion({
              latitude: loc.latitude,
              longitude: loc.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
          }
        } else {
          // Default to Fiji if no user location
          if (!initialRegion) {
            setRegion({
              latitude: -18.1416,
              longitude: 178.4419,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            });
          }
        }
      } else {
        // Default to Fiji if no permission
        if (!initialRegion) {
          setRegion({
            latitude: -18.1416,
            longitude: 178.4419,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
        }
      }
    } catch (error) {
      console.error('Error loading location:', error);
    } finally {
      setLoading(false);
    }
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const fitToMarkers = () => {
    if (infringements.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(
        infringements.map(i => ({
          latitude: i.latitude,
          longitude: i.longitude,
        })),
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  };

  const getMarkerColor = (status: string): string => {
    switch (status) {
      case 'pending':
        return '#f59e0b'; // Orange
      case 'paid':
        return '#10b981'; // Green
      case 'disputed':
        return '#ef4444'; // Red
      case 'cancelled':
        return '#6b7280'; // Gray
      default:
        return '#007AFF'; // Blue
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
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        toolbarEnabled={false}
      >
        {/* Route Polygons */}
        {routes.map((route) => (
          <Polygon
            key={route.id}
            coordinates={route.coordinates}
            strokeColor={route.strokeColor || '#2563eb'}
            fillColor={route.fillColor || '#3b82f680'}
            strokeWidth={2}
          />
        ))}

        {/* Infringement Markers */}
        {infringements.map((infringement) => (
          <Marker
            key={infringement.id}
            coordinate={{
              latitude: infringement.latitude,
              longitude: infringement.longitude,
            }}
            pinColor={getMarkerColor(infringement.status)}
            onPress={() => onMarkerPress?.(infringement)}
          >
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.marker,
                  { backgroundColor: getMarkerColor(infringement.status) },
                ]}
              >
                <Text style={styles.markerText}>🚗</Text>
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        {/* Center on User Button */}
        {location && (
          <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
            <Ionicons name="navigate" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}

        {/* Fit to Markers Button */}
        {infringements.length > 0 && (
          <TouchableOpacity style={styles.controlButton} onPress={fitToMarkers}>
            <Ionicons name="map" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Status</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Pending</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Paid</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Disputed</Text>
          </View>
        </View>
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
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 16,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -2,
  },
  controls: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    gap: 12,
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
  controlButtonText: {
    fontSize: 24,
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fff',
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
});
