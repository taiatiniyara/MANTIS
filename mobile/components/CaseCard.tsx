/**
 * Reusable infringement/case card used in dashboards and lists
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { InfringementStatus } from '@/lib/types';
import { StatusBadge } from './StatusBadge';

interface CaseCardProps {
  code: string;
  amount: number;
  status: InfringementStatus;
  issuedAt: string | Date;
  description?: string | null;
  onPress?: () => void;
  style?: ViewStyle;
}

export function CaseCard({
  code,
  amount,
  status,
  issuedAt,
  description,
  onPress,
  style,
}: CaseCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={!onPress}>
      <ThemedView style={[styles.card, { borderColor: colors.icon }, style]}>
        <View style={styles.header}>
          <ThemedText style={styles.code}>{code}</ThemedText>
          <StatusBadge status={status} />
        </View>
        <ThemedText style={styles.amount}>{formatCurrency(amount)}</ThemedText>
        {description ? (
          <ThemedText style={styles.description} numberOfLines={2}>
            {description}
          </ThemedText>
        ) : null}
        <ThemedText style={styles.date}>
          {formatDate(issuedAt, 'long')}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
  },
  date: {
    fontSize: 12,
    opacity: 0.7,
  },
});
