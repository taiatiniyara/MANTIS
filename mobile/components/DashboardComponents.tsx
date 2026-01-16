/**
 * Reusable Dashboard Components
 * Reduces duplication across officer and leader dashboards
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Welcome Section Component
interface WelcomeSectionProps {
  title: string;
  userName?: string;
  subtitle?: string;
  style?: ViewStyle;
}

export function WelcomeSection({ title, userName, subtitle, style }: WelcomeSectionProps) {
  return (
    <View style={[styles.welcomeSection, style]}>
      <ThemedText type="title">{title}</ThemedText>
      {userName && (
        <ThemedText type="subtitle" style={styles.userName}>
          {userName}
        </ThemedText>
      )}
      {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
    </View>
  );
}

// Stat Card Component
interface StatCardProps {
  value: string | number;
  label: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export function StatCard({ value, label, backgroundColor, style }: StatCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: backgroundColor || colors.tint + '20' },
        style,
      ]}
    >
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

// Stats Grid Component
interface StatsGridProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function StatsGrid({ children, style }: StatsGridProps) {
  return <View style={[styles.statsGrid, style]}>{children}</View>;
}

// Section Header Component
interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  style?: ViewStyle;
}

export function SectionHeader({ title, action, style }: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {action}
    </View>
  );
}

// Dashboard Container Component
interface DashboardContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function DashboardContainer({ children, style }: DashboardContainerProps) {
  return (
    <ThemedView style={[styles.container, style]}>
      <View style={styles.content}>{children}</View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  welcomeSection: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  userName: {
    marginTop: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    padding: Spacing.md,
    borderRadius: 12,
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
  },
});
