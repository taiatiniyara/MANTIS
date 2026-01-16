/**
 * Badge Component
 * Based on shadcn/ui badge with React Native implementation
 */

import React from 'react';
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  variant = 'default',
  children,
  icon,
  style,
  textStyle,
}: BadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const badgeStyles = [
    styles.badge,
    getVariantStyles(variant, colors),
    style,
  ];

  const badgeTextStyles = [
    styles.text,
    getVariantTextStyles(variant, colors),
    textStyle,
  ];

  return (
    <View style={badgeStyles}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={badgeTextStyles}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: Spacing.xs,
  },
  text: {
    fontSize: Typography.xs.fontSize,
    fontWeight: '500',
  },
  icon: {
    width: 12,
    height: 12,
  },
});

function getVariantStyles(variant: BadgeVariant, colors: typeof Colors.light): ViewStyle {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: colors.primary,
      };
    case 'secondary':
      return {
        backgroundColor: colors.secondary,
      };
    case 'destructive':
      return {
        backgroundColor: `${colors.destructive}1A`, // 10% opacity
      };
    case 'outline':
      return {
        backgroundColor: 'transparent',
        borderColor: colors.border,
      };
  }
}

function getVariantTextStyles(variant: BadgeVariant, colors: typeof Colors.light): TextStyle {
  switch (variant) {
    case 'default':
      return {
        color: colors.primaryForeground,
      };
    case 'secondary':
      return {
        color: colors.secondaryForeground,
      };
    case 'destructive':
      return {
        color: colors.destructive,
      };
    case 'outline':
      return {
        color: colors.foreground,
      };
  }
}
