import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { infringements, infringementTypes } from '@/lib/supabase';
import { gpsService, LocationData } from '@/lib/gps-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface InfringementType {
  id: string;
  code: string;
  description: string;
  fine_amount: number;
}

type VehicleType = 'car' | 'motorcycle' | 'truck' | 'bus' | 'other';

export default function RecordScreen() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [types, setTypes] = useState<InfringementType[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Form fields
  const [vehicleId, setVehicleId] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Check connectivity
      const netInfo = await NetInfo.fetch();
      setIsOnline(netInfo.isConnected ?? false);

      // Get current location
      const hasPermission = await gpsService.hasPermissions();
      if (hasPermission) {
        const loc = await gpsService.getCurrentLocation();
        setLocation(loc);
      } else {
        Alert.alert(
          'GPS Required',
          'Location permission is needed to record infringements',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable GPS',
              onPress: async () => {
                const result = await gpsService.requestPermissions();
                if (result.granted) {
                  const loc = await gpsService.getCurrentLocation();
                  setLocation(loc);
                }
              },
            },
          ]
        );
      }

      // Load infringement types
      if (netInfo.isConnected) {
        const { data, error } = await infringementTypes.list();
        if (error) {
          console.error('Error loading types:', error);
          Alert.alert('Error', 'Failed to load infringement types');
        } else if (data) {
          setTypes(data);
        }
      } else {
        // Load cached types
        const cached = await AsyncStorage.getItem('infringement_types');
        if (cached) {
          setTypes(JSON.parse(cached));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load required data');
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    try {
      const loc = await gpsService.getCurrentLocation();
      setLocation(loc);
      Alert.alert('Success', 'Location updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const validateForm = (): boolean => {
    if (!vehicleId.trim()) {
      Alert.alert('Validation Error', 'Vehicle ID is required');
      return false;
    }

    if (!selectedType) {
      Alert.alert('Validation Error', 'Please select an infringement type');
      return false;
    }

    if (!location) {
      Alert.alert('Validation Error', 'Location is required. Please enable GPS and retry.');
      return false;
    }

    return true;
  };

  const saveOffline = async (data: any) => {
    try {
      const queue = await AsyncStorage.getItem('offline_infringements');
      const queueData = queue ? JSON.parse(queue) : [];
      queueData.push({
        ...data,
        offline: true,
        created_at: new Date().toISOString(),
      });
      await AsyncStorage.setItem('offline_infringements', JSON.stringify(queueData));
      
      Alert.alert(
        'Saved Offline',
        'Infringement saved locally. It will sync when you are online.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving offline:', error);
      Alert.alert('Error', 'Failed to save infringement offline');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const selectedTypeData = types.find(t => t.id === selectedType);
      if (!selectedTypeData) {
        throw new Error('Invalid infringement type');
      }

      const infringementData = {
        vehicle_id: vehicleId.trim().toUpperCase(),
        vehicle_type: vehicleType,
        infringement_type_id: selectedType,
        officer_id: profile?.id,
        latitude: location!.latitude,
        longitude: location!.longitude,
        location_accuracy: location!.accuracy,
        notes: notes.trim() || null,
        status: 'pending',
        fine_amount: selectedTypeData.fine_amount,
        issued_at: new Date().toISOString(),
      };

      // Check if online
      const netInfo = await NetInfo.fetch();
      
      if (!netInfo.isConnected) {
        // Save offline
        await saveOffline(infringementData);
        return;
      }

      // Submit online
      const { data, error } = await infringements.create(infringementData);

      if (error) {
        throw error;
      }

      Alert.alert(
        'Success',
        'Infringement recorded successfully',
        [
          {
            text: 'Record Another',
            onPress: () => {
              setVehicleId('');
              setVehicleType('car');
              setSelectedType(null);
              setNotes('');
              refreshLocation();
            },
          },
          {
            text: 'Done',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error submitting infringement:', error);
      
      // If network error, offer to save offline
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        Alert.alert(
          'Network Error',
          'Unable to submit online. Save offline?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save Offline',
              onPress: async () => {
                const selectedTypeData = types.find(t => t.id === selectedType);
                await saveOffline({
                  vehicle_id: vehicleId.trim().toUpperCase(),
                  infringement_type_id: selectedType,
                  officer_id: profile?.id,
                  latitude: location!.latitude,
                  longitude: location!.longitude,
                  location_accuracy: location!.accuracy,
                  notes: notes.trim() || null,
                  status: 'pending',
                  fine_amount: selectedTypeData?.fine_amount,
                  issued_at: new Date().toISOString(),
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to record infringement. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Record Infringement</Text>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={[styles.statusBadge, isOnline ? styles.online : styles.offline]}>
            <Text style={styles.statusText}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>
          {location && (
            <TouchableOpacity style={styles.refreshButton} onPress={refreshLocation}>
              <Text style={styles.refreshText}>🔄 Refresh GPS</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Location Card */}
        {location ? (
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>📍 Current Location</Text>
            <Text style={styles.locationCoords}>
              {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationAccuracy}>
              Accuracy: ±{Math.round(location.accuracy || 0)}m
            </Text>
          </View>
        ) : (
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>⚠️ No GPS Location</Text>
            <Text style={styles.alertText}>
              Location is required to record infringements
            </Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={async () => {
                const result = await gpsService.requestPermissions();
                if (result.granted) {
                  const loc = await gpsService.getCurrentLocation();
                  setLocation(loc);
                }
              }}
            >
              <Text style={styles.alertButtonText}>Enable GPS</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Vehicle ID */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>🚗 Vehicle Registration *</Text>
            <TextInput
              style={styles.input}
              value={vehicleId}
              onChangeText={setVehicleId}
              placeholder="e.g., ABC123GP"
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          {/* Vehicle Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>🚙 Vehicle Type *</Text>
            <View style={styles.vehicleTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.vehicleTypeChip,
                  vehicleType === 'car' && styles.vehicleTypeChipSelected,
                ]}
                onPress={() => setVehicleType('car')}
              >
                <Text style={styles.vehicleTypeIcon}>🚗</Text>
                <Text
                  style={[
                    styles.vehicleTypeText,
                    vehicleType === 'car' && styles.vehicleTypeTextSelected,
                  ]}
                >
                  Car
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.vehicleTypeChip,
                  vehicleType === 'motorcycle' && styles.vehicleTypeChipSelected,
                ]}
                onPress={() => setVehicleType('motorcycle')}
              >
                <Text style={styles.vehicleTypeIcon}>🏍️</Text>
                <Text
                  style={[
                    styles.vehicleTypeText,
                    vehicleType === 'motorcycle' && styles.vehicleTypeTextSelected,
                  ]}
                >
                  Motorcycle
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.vehicleTypeChip,
                  vehicleType === 'truck' && styles.vehicleTypeChipSelected,
                ]}
                onPress={() => setVehicleType('truck')}
              >
                <Text style={styles.vehicleTypeIcon}>🚛</Text>
                <Text
                  style={[
                    styles.vehicleTypeText,
                    vehicleType === 'truck' && styles.vehicleTypeTextSelected,
                  ]}
                >
                  Truck
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.vehicleTypeChip,
                  vehicleType === 'bus' && styles.vehicleTypeChipSelected,
                ]}
                onPress={() => setVehicleType('bus')}
              >
                <Text style={styles.vehicleTypeIcon}>🚌</Text>
                <Text
                  style={[
                    styles.vehicleTypeText,
                    vehicleType === 'bus' && styles.vehicleTypeTextSelected,
                  ]}
                >
                  Bus
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Infringement Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>⚠️ Infringement Type *</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.typeScroll}
            >
              {types.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeChip,
                    selectedType === type.id && styles.typeChipSelected,
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      selectedType === type.id && styles.typeChipTextSelected,
                    ]}
                  >
                    {type.code}
                  </Text>
                  <Text
                    style={[
                      styles.typeChipAmount,
                      selectedType === type.id && styles.typeChipAmountSelected,
                    ]}
                  >
                    R{type.fine_amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Selected Type Details */}
          {selectedType && (
            <View style={styles.typeDetailsCard}>
              <Text style={styles.typeDetailsTitle}>
                {types.find(t => t.id === selectedType)?.description}
              </Text>
              <Text style={styles.typeDetailsFine}>
                Fine: R{types.find(t => t.id === selectedType)?.fine_amount}
              </Text>
            </View>
          )}

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>📝 Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Enter any additional details..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Photo Evidence Button */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>📸 Photo Evidence</Text>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => {
                if (!location) {
                  Alert.alert('GPS Required', 'Please enable GPS before capturing evidence photos');
                  return;
                }
                router.push({
                  pathname: '/camera',
                  params: {
                    officerName: profile?.full_name || profile?.email || 'Officer',
                    latitude: location.latitude,
                    longitude: location.longitude,
                  },
                });
              }}
            >
              <Text style={styles.cameraButtonIcon}>📷</Text>
              <Text style={styles.cameraButtonText}>Capture Evidence Photos</Text>
            </TouchableOpacity>
            <Text style={styles.cameraHint}>
              Photos will be watermarked with location, time, and officer details
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Record Infringement</Text>
          )}
        </TouchableOpacity>

        {!isOnline && (
          <Text style={styles.offlineNote}>
            ℹ️ You are offline. Infringement will be saved locally and synced when online.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  online: {
    backgroundColor: '#E8F5E9',
  },
  offline: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  locationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  locationCoords: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  locationAccuracy: {
    fontSize: 12,
    color: '#999',
  },
  alertBox: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  alertText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  alertButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  alertButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  form: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  vehicleTypeChip: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleTypeChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  vehicleTypeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  vehicleTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  vehicleTypeTextSelected: {
    color: '#fff',
  },
  typeScroll: {
    marginTop: 8,
  },
  typeChip: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    minWidth: 120,
  },
  typeChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  typeChipTextSelected: {
    color: '#fff',
  },
  typeChipAmount: {
    fontSize: 12,
    color: '#666',
  },
  typeChipAmountSelected: {
    color: '#fff',
  },
  typeDetailsCard: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  typeDetailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  typeDetailsFine: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  cameraButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  cameraButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  cameraHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  offlineNote: {
    marginTop: 12,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
