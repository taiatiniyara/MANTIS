import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { InfringementMapView } from '@/components/maps/infringement-map-view';
import { LocationPicker } from '@/components/maps/location-picker';
import { Colors } from '@/constants/theme';

/**
 * Map Demo Screen
 * 
 * This screen demonstrates the new enhanced map components:
 * - InfringementMapView: Display component with theme support
 * - LocationPicker: Interactive location selection modal
 * 
 * Compare these with existing:
 * - InfringementMapMobile (in infringement-detail-modal.tsx)
 * - LocationPickerMobile (in create-infringement.tsx)
 */

export default function MapDemoScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  
  // State for InfringementMapView demo
  const [showMapView, setShowMapView] = useState(true);
  const [showDirections, setShowDirections] = useState(true);
  
  // State for LocationPicker demo
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: -18.1416, // Suva, Fiji
    longitude: 178.4419,
    address: 'Suva, Fiji',
  });
  
  // Sample infringement location
  const sampleLocation = {
    latitude: -18.1416,
    longitude: 178.4419,
  };
  
  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    setSelectedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || 'Unknown location',
    });
    setShowLocationPicker(false);
  };
  
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const backgroundColor = theme.background;
  const cardBackground = theme.card;
  const textColor = theme.text;
  const mutedColor = theme.textMuted || theme.icon;
  const borderColor = theme.border;
  const primaryColor = theme.primary || theme.tint;
  
  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <Text style={[styles.title, { color: textColor }]}>
          🗺️ Map Components Demo
        </Text>
        <Text style={[styles.subtitle, { color: mutedColor }]}>
          Test new enhanced map components
        </Text>
      </View>
      
      {/* Component 1: InfringementMapView */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          📍 InfringementMapView
        </Text>
        <Text style={[styles.sectionDescription, { color: mutedColor }]}>
          Enhanced display component with theme support and controls
        </Text>
        
        {/* Options */}
        <View style={styles.options}>
          <View style={styles.option}>
            <Text style={[styles.optionLabel, { color: textColor }]}>
              Show Map
            </Text>
            <Switch
              value={showMapView}
              onValueChange={setShowMapView}
              trackColor={{ false: '#767577', true: primaryColor }}
              thumbColor={showMapView ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.option}>
            <Text style={[styles.optionLabel, { color: textColor }]}>
              Show Directions
            </Text>
            <Switch
              value={showDirections}
              onValueChange={setShowDirections}
              trackColor={{ false: '#767577', true: primaryColor }}
              thumbColor={showDirections ? '#fff' : '#f4f3f4'}
            />
          </View>
          
        </View>
        
        {/* Map Display */}
        {showMapView && (
          <View style={styles.mapWrapper}>
            <InfringementMapView
              latitude={sampleLocation.latitude}
              longitude={sampleLocation.longitude}
              title="Sample Infringement"
              description="Victoria Parade, Suva"
              height={300}
              showDirections={showDirections}
              markerColor="#F97316"
            />
          </View>
        )}
        
        {/* Features */}
        <View style={styles.features}>
          <Text style={[styles.featuresTitle, { color: textColor }]}>
            ✨ Features:
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Interactive Google Maps display
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Custom marker with color support
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Get Directions button
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Theme-aware styling
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Loading & error states
          </Text>
        </View>
      </View>
      
      {/* Component 2: LocationPicker */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          📍 LocationPicker
        </Text>
        <Text style={[styles.sectionDescription, { color: mutedColor }]}>
          Interactive location selection with search and validation
        </Text>
        
        {/* Selected Location Display */}
        <View style={[styles.selectedLocation, { borderColor }]}>
          <Text style={[styles.selectedLabel, { color: mutedColor }]}>
            Selected Location:
          </Text>
          <Text style={[styles.selectedAddress, { color: textColor }]}>
            {selectedLocation.address}
          </Text>
          <Text style={[styles.selectedCoords, { color: mutedColor }]}>
            {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>
        
        {/* Open Picker Button */}
        <TouchableOpacity
          style={styles.openPickerButton}
          onPress={() => setShowLocationPicker(true)}
        >
          <Text style={styles.openPickerButtonText}>
            📍 Open Location Picker
          </Text>
        </TouchableOpacity>
        
        {/* Features */}
        <View style={styles.features}>
          <Text style={[styles.featuresTitle, { color: textColor }]}>
            ✨ Features:
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Interactive location selection
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Draggable marker
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Current location button (GPS)
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Reverse geocoding (coordinates → address)
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Fiji boundary validation
          </Text>
          <Text style={[styles.feature, { color: mutedColor }]}>
            • Theme-aware styling
          </Text>
        </View>
      </View>
      
      {/* Comparison Info */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          📊 Comparison
        </Text>
        <Text style={[styles.sectionDescription, { color: mutedColor }]}>
          New vs Existing Components
        </Text>
        
        <View style={styles.comparison}>
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonLabel, { color: textColor }]}>
              Existing (Mobile):
            </Text>
            <Text style={[styles.comparisonValue, { color: mutedColor }]}>
              Basic features, production-tested
            </Text>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonLabel, { color: textColor }]}>
              New (Enhanced):
            </Text>
            <Text style={[styles.comparisonValue, { color: mutedColor }]}>
              +8 features, needs testing
            </Text>
          </View>
          
          <View style={styles.comparisonRow}>
            <Text style={[styles.comparisonLabel, { color: textColor }]}>
              Status:
            </Text>
            <Text style={[styles.comparisonValue, { color: '#10B981' }]}>
              Both working, choose best fit
            </Text>
          </View>
        </View>
      </View>
      
      {/* Testing Instructions */}
      <View style={[styles.section, { backgroundColor: cardBackground }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>
          🧪 Testing Instructions
        </Text>
        
        <View style={styles.testingSteps}>
          <Text style={[styles.testingStep, { color: mutedColor }]}>
            1. Test InfringementMapView controls above
          </Text>
          <Text style={[styles.testingStep, { color: mutedColor }]}>
            2. Open LocationPicker and select location
          </Text>
          <Text style={[styles.testingStep, { color: mutedColor }]}>
            3. Try map type toggle (standard/satellite)
          </Text>
          <Text style={[styles.testingStep, { color: mutedColor }]}>
            4. Test "Get Directions" button
          </Text>
          <Text style={[styles.testingStep, { color: mutedColor }]}>
            5. Drag marker in LocationPicker
          </Text>
          <Text style={[styles.testingStep, { color: mutedColor }]}>
            6. Test current location button
          </Text>
          <Text style={[styles.testingStep, { color: mutedColor }]}>
            7. Toggle theme and retest
          </Text>
          <Text style={[styles.testingStep, { color: mutedColor }]}>
            8. Compare with existing components
          </Text>
        </View>
      </View>
      
      {/* LocationPicker Component */}
      {showLocationPicker && (
        <LocationPicker
          initialLocation={selectedLocation}
          onLocationSelect={handleLocationSelect}
          onCancel={() => setShowLocationPicker(false)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  options: {
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 16,
  },
  mapWrapper: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  features: {
    marginTop: 12,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  feature: {
    fontSize: 14,
    marginBottom: 4,
  },
  selectedLocation: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedAddress: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedCoords: {
    fontSize: 12,
  },
  openPickerButton: {
    backgroundColor: '#F97316', // Orange primary
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  openPickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  comparison: {
    marginTop: 12,
  },
  comparisonRow: {
    marginBottom: 12,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 14,
  },
  testingSteps: {
    marginTop: 12,
  },
  testingStep: {
    fontSize: 14,
    marginBottom: 8,
  },
});
