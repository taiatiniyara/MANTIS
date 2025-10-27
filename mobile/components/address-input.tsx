/**
 * Address Input Component with Autocomplete
 * Provides address search and geocoding for mobile forms
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { geocodingService, GeocodedAddress, AddressSuggestion } from '@/lib/geocoding-service';
import { gpsService } from '@/lib/gps-service';

interface AddressInputProps {
  value?: string;
  onAddressSelect: (address: GeocodedAddress) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  showCurrentLocation?: boolean;
}

export function AddressInput({
  value,
  onAddressSelect,
  placeholder = 'Enter address or search...',
  label = 'Location',
  required = false,
  showCurrentLocation = true,
}: AddressInputProps) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<GeocodedAddress | null>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (inputValue.length >= 3) {
      searchAddresses(inputValue);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const searchAddresses = async (query: string) => {
    setLoading(true);
    try {
      const results = await geocodingService.searchAddresses(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error searching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = async (suggestion: AddressSuggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    Keyboard.dismiss();

    // Geocode the selected suggestion to get full details
    const [lat, lon] = suggestion.id.split(',').map(Number);
    const fullAddress = await geocodingService.reverseGeocode(lat, lon);
    
    if (fullAddress) {
      setSelectedAddress(fullAddress);
      onAddressSelect(fullAddress);
    }
  };

  const handleManualInput = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    Keyboard.dismiss();
    
    try {
      const geocoded = await geocodingService.geocodeAddress(inputValue);
      if (geocoded) {
        setSelectedAddress(geocoded);
        setInputValue(geocoded.formattedAddress);
        onAddressSelect(geocoded);
      } else {
        alert('Address not found. Please try a different search or use current location.');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      alert('Error finding address. Please try again.');
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };

  const useCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await gpsService.getCurrentLocation();
      if (location) {
        const address = await geocodingService.reverseGeocode(
          location.latitude,
          location.longitude
        );
        
        if (address) {
          setInputValue(address.formattedAddress);
          setSelectedAddress(address);
          onAddressSelect(address);
        }
      } else {
        alert('Could not get current location. Please check GPS permissions.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Error getting location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearAddress = () => {
    setInputValue('');
    setSelectedAddress(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons name="location" size={20} color="#666" style={styles.icon} />
        
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor="#999"
          onSubmitEditing={handleManualInput}
          returnKeyType="search"
        />

        {loading ? (
          <ActivityIndicator size="small" color="#007AFF" style={styles.actionIcon} />
        ) : inputValue ? (
          <TouchableOpacity onPress={clearAddress} style={styles.actionIcon}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Current Location Button */}
      {showCurrentLocation && !selectedAddress && (
        <TouchableOpacity style={styles.locationButton} onPress={useCurrentLocation}>
          <Ionicons name="navigate" size={16} color="#007AFF" />
          <Text style={styles.locationButtonText}>Use Current Location</Text>
        </TouchableOpacity>
      )}

      {/* Address Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSuggestionSelect(item)}
              >
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Selected Address Display */}
      {selectedAddress && (
        <View style={styles.selectedAddress}>
          <View style={styles.selectedAddressHeader}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.selectedAddressTitle}>Selected Location</Text>
          </View>
          <Text style={styles.selectedAddressText}>
            {selectedAddress.formattedAddress}
          </Text>
          <Text style={styles.coordinates}>
            {selectedAddress.latitude.toFixed(6)}, {selectedAddress.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  actionIcon: {
    marginLeft: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 8,
    gap: 6,
  },
  locationButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    overflow: 'hidden',
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  selectedAddress: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  selectedAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  selectedAddressTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  selectedAddressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});
