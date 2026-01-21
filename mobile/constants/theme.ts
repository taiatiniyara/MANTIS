/**
 * MANTIS Theme System
 * Based on the website's design system with shadcn/ui color palette
 * Colors are defined using hex values converted from oklch color space
 */

import { Platform } from 'react-native';

// Primary color palette based on website theme
export const Colors = {
  light: {
    // Base colors
    background: '#FFFFFF',              // oklch(1 0 0)
    foreground: '#25211F',              // oklch(0.147 0.004 49.25)
    
    // Card colors
    card: '#FFFFFF',                    // oklch(1 0 0)
    cardForeground: '#25211F',          // oklch(0.147 0.004 49.25)
    
    // Popover colors
    popover: '#FFFFFF',                 // oklch(1 0 0)
    popoverForeground: '#25211F',       // oklch(0.147 0.004 49.25)
    
    // Primary brand color (purple/blue)
    primary: '#6366F1',                 // oklch(0.488 0.243 264.376)
    primaryForeground: '#F8F7FF',       // oklch(0.97 0.014 254.604)
    
    // Secondary colors
    secondary: '#F7F6F5',               // oklch(0.967 0.001 286.375)
    secondaryForeground: '#352F2D',     // oklch(0.21 0.006 285.885)
    
    // Muted colors
    muted: '#F7F7F6',                   // oklch(0.97 0.001 106.424)
    mutedForeground: '#898582',         // oklch(0.553 0.013 58.071)
    
    // Accent colors
    accent: '#F7F7F6',                  // oklch(0.97 0.001 106.424)
    accentForeground: '#37312F',        // oklch(0.216 0.006 56.043)
    
    // Destructive/Error colors
    destructive: '#DC2626',             // oklch(0.577 0.245 27.325)
    destructiveForeground: '#FFFFFF',
    
    // Border and input
    border: '#EBEBEA',                  // oklch(0.923 0.003 48.717)
    input: '#EBEBEA',                   // oklch(0.923 0.003 48.717)
    ring: '#B5B3AF',                    // oklch(0.709 0.01 56.259)
    
    // Chart colors
    chart1: '#A5B4FC',                  // oklch(0.809 0.105 251.813)
    chart2: '#818CF8',                  // oklch(0.623 0.214 259.815)
    chart3: '#6366F1',                  // oklch(0.546 0.245 262.881)
    chart4: '#4F46E5',                  // oklch(0.488 0.243 264.376)
    chart5: '#4338CA',                  // oklch(0.424 0.199 265.638)
    
    // Tab/Navigation
    tint: '#6366F1',
    icon: '#898582',
    tabIconDefault: '#898582',
    tabIconSelected: '#6366F1',
  },
  dark: {
    // Base colors
    background: '#25211F',              // oklch(0.147 0.004 49.25)
    foreground: '#FAFAF9',              // oklch(0.985 0.001 106.423)
    
    // Card colors
    card: '#37312F',                    // oklch(0.216 0.006 56.043)
    cardForeground: '#FAFAF9',          // oklch(0.985 0.001 106.423)
    
    // Popover colors
    popover: '#37312F',                 // oklch(0.216 0.006 56.043)
    popoverForeground: '#FAFAF9',       // oklch(0.985 0.001 106.423)
    
    // Primary brand color (adjusted for dark mode)
    primary: '#5B5FC7',                 // oklch(0.42 0.18 266)
    primaryForeground: '#F8F7FF',       // oklch(0.97 0.014 254.604)
    
    // Secondary colors
    secondary: '#423B38',               // oklch(0.274 0.006 286.033)
    secondaryForeground: '#FAFAF9',     // oklch(0.985 0 0)
    
    // Muted colors
    muted: '#413A37',                   // oklch(0.268 0.007 34.298)
    mutedForeground: '#B5B3AF',         // oklch(0.709 0.01 56.259)
    
    // Accent colors
    accent: '#413A37',                  // oklch(0.268 0.007 34.298)
    accentForeground: '#FAFAF9',        // oklch(0.985 0.001 106.423)
    
    // Destructive/Error colors
    destructive: '#EF4444',             // oklch(0.704 0.191 22.216)
    destructiveForeground: '#FFFFFF',
    
    // Border and input (with transparency)
    border: 'rgba(255, 255, 255, 0.1)',
    input: 'rgba(255, 255, 255, 0.15)',
    ring: '#898582',                    // oklch(0.553 0.013 58.071)
    
    // Chart colors
    chart1: '#A5B4FC',                  // oklch(0.809 0.105 251.813)
    chart2: '#818CF8',                  // oklch(0.623 0.214 259.815)
    chart3: '#6366F1',                  // oklch(0.546 0.245 262.881)
    chart4: '#4F46E5',                  // oklch(0.488 0.243 264.376)
    chart5: '#4338CA',                  // oklch(0.424 0.199 265.638)
    
    // Tab/Navigation
    tint: '#818CF8',
    icon: '#B5B3AF',
    tabIconDefault: '#B5B3AF',
    tabIconSelected: '#818CF8',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'Menlo', 'Monaco', 'Courier New', monospace",
  },
});

// Spacing scale matching website
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// Border radius matching website (--radius: 0.45rem = ~7.2px)
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 7.2,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// Typography scale
export const Typography = {
  xs: {
    fontSize: 14,
    lineHeight: 20,
  },
  sm: {
    fontSize: 16,
    lineHeight: 22,
  },
  base: {
    fontSize: 18,
    lineHeight: 26,
  },
  lg: {
    fontSize: 20,
    lineHeight: 28,
  },
  xl: {
    fontSize: 24,
    lineHeight: 32,
  },
  '2xl': {
    fontSize: 28,
    lineHeight: 36,
  },
  '3xl': {
    fontSize: 34,
    lineHeight: 40,
  },
  '4xl': {
    fontSize: 40,
    lineHeight: 44,
  },
} as const;

// Shadow styles matching website
export const Shadows = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
} as const;
