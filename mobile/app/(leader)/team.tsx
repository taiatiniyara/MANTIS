/**
 * MANTIS Mobile - Team Management Screen
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function TeamScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Team Management
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Manage your team members and monitor their activity
        </ThemedText>

        <View style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>
            👥 This screen will include:
          </ThemedText>
          <View style={styles.featureList}>
            <ThemedText style={styles.feature}>
              • List of team members with photos
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Individual performance metrics
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Cases issued by each officer
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Activity timeline
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Assign cases to team members
            </ThemedText>
            <ThemedText style={styles.feature}>
              • Send notifications/messages
            </ThemedText>
          </View>
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
});
