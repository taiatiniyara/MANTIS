/**
 * Separator Component
 * Based on shadcn/ui separator with React Native implementation
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export function Separator({ orientation = 'horizontal', style }: SeparatorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const separatorStyles = [
    styles.base,
    {
      backgroundColor: colors.border,
    },
    orientation === 'horizontal' ? styles.horizontal : styles.vertical,
    style,
  ];

  return <View style={separatorStyles} />;
}

const styles = StyleSheet.create({
  base: {
    flexShrink: 0,
  },
  horizontal: {
    height: 1,
    width: '100%',
  },
  vertical: {
    width: 1,
    height: '100%',
  },
});
