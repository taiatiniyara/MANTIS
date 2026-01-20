/**
 * Reusable empty state block for list and dashboard placeholders
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {message ? <ThemedText style={styles.subtitle}>{message}</ThemedText> : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
