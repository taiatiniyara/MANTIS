/**
 * Map View Screen
 * Shows all infringements on a map with filtering
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { MapComponent } from '@/components/map-view';
import { infringements } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Infringement {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'paid' | 'disputed' | 'cancelled';
  fine_amount: number;
  created_at: string;
}

export default function MapViewScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Infringement[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadInfringements();
  }, []);

  const loadInfringements = async () => {
    try {
      const { data: infringementData, error } = await infringements.list(
        profile?.id || '',
        100
      );
      
      if (error) {
        console.error('Error loading infringements:', error);
        Alert.alert('Error', 'Failed to load infringements');
        return;
      }

      if (infringementData) {
        setData(infringementData);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (infringement: any) => {
    Alert.alert(
      `Vehicle: ${infringement.vehicleId}`,
      `Status: ${infringement.status}\nFine: R${infringement.fineAmount}`,
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'View Details',
          onPress: () => {
            // TODO: Navigate to infringement details
            console.log('View details:', infringement.id);
          },
        },
      ]
    );
  };

  const filteredData = data.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const mapMarkers = filteredData.map((item) => ({
    id: item.id,
    latitude: item.latitude,
    longitude: item.longitude,
    vehicleId: item.vehicle_id,
    status: item.status,
    fineAmount: item.fine_amount,
    createdAt: item.created_at,
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="light" backgroundColor="#007AFF" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" backgroundColor="#007AFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Map View</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All ({data.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'pending' && styles.filterChipActive]}
          onPress={() => setFilter('pending')}
        >
          <Text style={[styles.filterText, filter === 'pending' && styles.filterTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'paid' && styles.filterChipActive]}
          onPress={() => setFilter('paid')}
        >
          <Text style={[styles.filterText, filter === 'paid' && styles.filterTextActive]}>
            Paid
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'disputed' && styles.filterChipActive]}
          onPress={() => setFilter('disputed')}
        >
          <Text style={[styles.filterText, filter === 'disputed' && styles.filterTextActive]}>
            Disputed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      <MapComponent
        infringements={mapMarkers}
        onMarkerPress={handleMarkerPress}
        showUserLocation={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
});
