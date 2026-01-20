/**
 * Reusable Safe Area Layout Component
 * Provides consistent safe area handling across all screens
 */

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface SafeAreaLayoutProps {
  children: React.ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  style?: ViewStyle;
}

/**
 * SafeAreaLayout component that wraps content with safe area insets
 * @param children - Content to render inside safe area
 * @param edges - Which edges to apply safe area insets to. Defaults to ['top', 'bottom']
 * @param style - Additional styles to apply
 */
export function SafeAreaLayout({ 
  children, 
  edges = ['top', 'bottom'],
  style 
}: SafeAreaLayoutProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView 
      edges={edges}
      style={[
        styles.container, 
        { backgroundColor: colors.background },
        style
      ]}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
