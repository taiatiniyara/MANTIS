/**
 * Alert Component
 * Based on shadcn/ui alert with React Native implementation
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AlertVariant = 'default' | 'destructive';

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

interface AlertTitleProps {
  children: React.ReactNode;
  style?: TextStyle;
}

interface AlertDescriptionProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export function Alert({ variant = 'default', children, icon, style }: AlertProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const alertStyles: ViewStyle[] = [
    styles.alert,
    {
      backgroundColor: colors.background,
      borderColor: colors.border,
    },
    ...(variant === 'destructive' ? [{
      borderColor: colors.destructive,
      backgroundColor: `${colors.destructive}0D`, // 5% opacity
    }] : []),
    ...(style ? [style] : []),
  ];

  return (
    <View style={alertStyles}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

export function AlertTitle({ children, style }: AlertTitleProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Text style={[styles.title, { color: colors.foreground }, style]}>
      {children}
    </Text>
  );
}

export function AlertDescription({ children, style }: AlertDescriptionProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Text style={[styles.description, { color: colors.mutedForeground }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  alert: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  icon: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.base.fontSize,
    fontWeight: '500',
    lineHeight: Typography.base.lineHeight,
  },
  description: {
    fontSize: Typography.sm.fontSize,
    lineHeight: Typography.sm.lineHeight,
  },
});
