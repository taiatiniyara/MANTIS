/**
 * Style utilities
 * Helper functions for consistent styling across the app
 */

import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

type Style = ViewStyle | TextStyle | ImageStyle;

/**
 * Combine multiple style objects, filtering out falsy values
 * Simplified alternative to clsx for React Native
 */
export function cn(...styles: (Style | false | null | undefined)[]): Style[] {
  return styles.filter(Boolean) as Style[];
}

/**
 * Add opacity to a hex color
 * @param color - Hex color string (e.g., '#6366F1')
 * @param opacity - Opacity value between 0 and 1
 */
export function withOpacity(color: string, opacity: number): string {
  if (!color.startsWith('#')) return color;
  
  const hex = color.slice(1);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Create a shadow style based on elevation level
 * Provides platform-appropriate shadows
 */
export function createShadow(elevation: number = 1): ViewStyle {
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity: 0.1 + (elevation * 0.02),
    shadowRadius: elevation * 2,
    elevation,
  };
}
    lg: { ...baseStyle, ...lgStyle },
  };
}

/**
 * Flatten nested style objects
 */
export function flattenStyles(styles: any): any {
  return StyleSheet.flatten(styles);
}
