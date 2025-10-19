import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useOfflineSync } from '../hooks/use-offline-sync';
import { useLocationTracking } from '../hooks/use-location-tracking';
import { EvidenceCamera } from './evidence-camera';

interface InfringementFormData {
  type_id: string;
  offender_name: string;
  offender_license: string;
  offender_email?: string;
  offender_phone?: string;
  vehicle_registration: string;
  vehicle_make?: string;
  vehicle_model?: string;
  location_id: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  evidence_photos: string[];
}

export function InfringementFormMobile() {
  const [formData, setFormData] = useState<InfringementFormData>({
    type_id: '',
    offender_name: '',
    offender_license: '',
    vehicle_registration: '',
    location_id: '',
    evidence_photos: [],
  });

  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isOnline, addToSyncQueue, saveOfflineData } = useOfflineSync();
  const { location, getCurrentLocation } = useLocationTracking();

  const handlePhotoCapture = (photo: { uri: string; base64?: string }) => {
    setFormData(prev => ({
      ...prev,
      evidence_photos: [...prev.evidence_photos, photo.uri],
    }));
    setShowCamera(false);
  };

  const captureCurrentLocation = async () => {
    const currentLocation = await getCurrentLocation();
    if (currentLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      }));
      Alert.alert('Success', 'Location captured successfully');
    } else {
      Alert.alert('Error', 'Failed to capture location');
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.type_id || !formData.offender_name || !formData.offender_license || !formData.vehicle_registration) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const infringementData = {
        ...formData,
        latitude: formData.latitude || location?.latitude,
        longitude: formData.longitude || location?.longitude,
        created_at: new Date().toISOString(),
        status: 'draft',
      };

      if (isOnline) {
        // Submit directly to API
        const response = await fetch('/api/infringements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(infringementData),
        });

        if (!response.ok) {
          throw new Error('Failed to submit infringement');
        }

        Alert.alert('Success', 'Infringement submitted successfully');
      } else {
        // Save for offline sync
        await addToSyncQueue('create', 'infringements', infringementData);
        await saveOfflineData(`infringement_${Date.now()}`, infringementData);
        
        Alert.alert(
          'Saved Offline',
          'Infringement will be submitted when you are back online'
        );
      }

      // Reset form
      setFormData({
        type_id: '',
        offender_name: '',
        offender_license: '',
        vehicle_registration: '',
        location_id: '',
        evidence_photos: [],
      });
    } catch (error) {
      console.error('Error submitting infringement:', error);
      Alert.alert('Error', 'Failed to submit infringement');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCamera) {
    return (
      <EvidenceCamera
        onPhotoCapture={handlePhotoCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>New Infringement</Text>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, isOnline ? styles.onlineDot : styles.offlineDot]} />
          <Text style={styles.statusText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      <View style={styles.form}>
        {/* Offender Information */}
        <Text style={styles.sectionTitle}>Offender Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.offender_name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, offender_name: text }))}
            placeholder="Enter full name"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>License Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.offender_license}
            onChangeText={(text) => setFormData(prev => ({ ...prev, offender_license: text }))}
            placeholder="Enter license number"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.offender_email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, offender_email: text }))}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.offender_phone}
            onChangeText={(text) => setFormData(prev => ({ ...prev, offender_phone: text }))}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        {/* Vehicle Information */}
        <Text style={styles.sectionTitle}>Vehicle Information</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Registration Number *</Text>
          <TextInput
            style={styles.input}
            value={formData.vehicle_registration}
            onChangeText={(text) => setFormData(prev => ({ ...prev, vehicle_registration: text }))}
            placeholder="Enter registration number"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Make</Text>
          <TextInput
            style={styles.input}
            value={formData.vehicle_make}
            onChangeText={(text) => setFormData(prev => ({ ...prev, vehicle_make: text }))}
            placeholder="e.g., Toyota"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            value={formData.vehicle_model}
            onChangeText={(text) => setFormData(prev => ({ ...prev, vehicle_model: text }))}
            placeholder="e.g., Corolla"
            autoCapitalize="words"
          />
        </View>

        {/* Location & Evidence */}
        <Text style={styles.sectionTitle}>Location & Evidence</Text>

        <TouchableOpacity style={styles.actionButton} onPress={captureCurrentLocation}>
          <Text style={styles.actionButtonText}>📍 Capture Current Location</Text>
        </TouchableOpacity>

        {(formData.latitude && formData.longitude) && (
          <Text style={styles.locationText}>
            Location: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
          </Text>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={() => setShowCamera(true)}>
          <Text style={styles.actionButtonText}>📷 Take Photo</Text>
        </TouchableOpacity>

        {formData.evidence_photos.length > 0 && (
          <Text style={styles.photoCount}>
            {formData.evidence_photos.length} photo(s) attached
          </Text>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Additional notes..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isOnline ? 'Submit Infringement' : 'Save Offline'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineDot: {
    backgroundColor: '#4CAF50',
  },
  offlineDot: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  photoCount: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 15,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
