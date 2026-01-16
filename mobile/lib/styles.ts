/**
 * Style utilities
 * Helper functions for consistent styling across the app
 */

import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

/**
 * Combine multiple style objects, filtering out falsy values
 */
export function cn(...styles: any[]) {
  return styles.filter(Boolean);
}

/**
 * Add opacity to a color
 */
export function withOpacity(color: string, opacity: number): string {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  // Handle rgb/rgba colors
  if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g);
    if (match && match.length >= 3) {
      return `rgba(${match[0]}, ${match[1]}, ${match[2]}, ${opacity})`;
    }
  }
  
  return color;
}

/**
 * Create a shadow style based on elevation level
 */
export function createShadow(elevation: number = 1) {
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1 + (elevation * 0.02),
    shadowRadius: elevation * 2,
    elevation: elevation,
  };
}

/**
 * Get themed color based on color scheme
 */
export function getThemedColor(
  colorScheme: 'light' | 'dark',
  colorKey: keyof typeof Colors.light
): string {
  return Colors[colorScheme][colorKey];
}

/**
 * Create a responsive style based on screen size
 */
export function createResponsiveStyle<T extends object>(
  baseStyle: T,
  smStyle?: Partial<T>,
  mdStyle?: Partial<T>,
  lgStyle?: Partial<T>
) {
  // This is a simplified version. In a real app, you might use
  // libraries like react-native-responsive-screen or react-native-size-matters
  return {
    base: baseStyle,
    sm: { ...baseStyle, ...smStyle },
    md: { ...baseStyle, ...mdStyle },
    lg: { ...baseStyle, ...lgStyle },
  };
}

/**
 * Flatten nested style objects
 */
export function flattenStyles(styles: any): any {
  return StyleSheet.flatten(styles);
}
