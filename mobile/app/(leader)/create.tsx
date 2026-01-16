/**
 * MANTIS Mobile - Create Infringement Screen
 */

import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CreateInfringementScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Create Infringement
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Issue a new traffic infringement notice
        </ThemedText>

        <View style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            📝 Infringement form will include:
          </ThemedText>
          <View style={styles.featureList}>
            <ThemedText style={styles.feature}>
              • Offence selection (searchable dropdown)
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Driver information (license lookup)
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Vehicle details (plate lookup)
            </ThemedText>
            <ThemedText style={styles.feature}>
              • GPS location capture
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Photo evidence (camera integration)
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Fine amount (auto-filled from offence)
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Additional notes/description
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Save as draft or submit
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={() => {
            // Open form
          }}
        >
          <ThemedText style={styles.buttonText}>
            Start Creating Infringement
          </ThemedText>
        </TouchableOpacity>

        <View style={styles.helpBox}>
          <ThemedText style={styles.helpText}>
            💡 Tip: You can save drafts if you're offline or need to gather more information
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 24,
  },
  placeholder: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  featureList: {
    gap: 8,
  },
  feature: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpBox: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
});
