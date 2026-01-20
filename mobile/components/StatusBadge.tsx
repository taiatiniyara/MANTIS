/**
 * Status badge for infringement lifecycle
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatInfringementStatus } from '@/lib/formatting';
import { InfringementStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: InfringementStatus;
}

const STATUS_COLORS: Record<InfringementStatus, { bg: string; text: string }> = {
  approved: { bg: '#4CAF50', text: '#fff' },
  pending: { bg: '#FF9800', text: '#fff' },
  draft: { bg: '#9E9E9E', text: '#fff' },
  paid: { bg: '#2E7D32', text: '#fff' },
  appealed: { bg: '#2980B9', text: '#fff' },
  appeal_approved: { bg: '#16A085', text: '#fff' },
  appeal_rejected: { bg: '#C0392B', text: '#fff' },
  cancelled: { bg: '#616161', text: '#fff' },
  overdue: { bg: '#D35400', text: '#fff' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const palette = STATUS_COLORS[status] ?? { bg: colors.border, text: colors.primaryForeground };

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}> 
      <ThemedText style={[styles.text, { color: palette.text }]}>
        {formatInfringementStatus(status)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
