/**
 * MANTIS Mobile Theme Configuration
 * Light mode only with blue/zinc palette for consistency with web dashboard
 */

import { Platform } from 'react-native';

/**
 * Primary blue palette - matches web dashboard
 */
const blue = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

/**
 * Zinc palette for neutral colors
 */
const zinc = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
};

/**
 * Light mode only color scheme
 */
export const Colors = {
  // Primary colors
  primary: blue[600],
  primaryLight: blue[500],
  primaryDark: blue[700],
  
  // Background colors
  background: '#ffffff',
  backgroundSecondary: zinc[50],
  backgroundTertiary: zinc[100],
  
  // Text colors
  text: zinc[900],
  textSecondary: zinc[600],
  textMuted: zinc[500],
  
  // Border colors
  border: zinc[200],
  borderLight: zinc[100],
  
  // UI element colors
  tint: blue[600],
  icon: zinc[600],
  iconMuted: zinc[400],
  
  // Tab navigation
  tabIconDefault: zinc[400],
  tabIconSelected: blue[600],
  tabBackground: '#ffffff',
  tabBorder: zinc[200],
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: blue[500],
  
  // Interactive states
  hover: zinc[100],
  pressed: zinc[200],
  disabled: zinc[300],
  
  // Card and surface
  card: '#ffffff',
  cardBorder: zinc[200],
  
  // Input fields
  input: '#ffffff',
  inputBorder: zinc[300],
  inputFocus: blue[500],
  inputPlaceholder: zinc[400],
};

/**
 * Typography configuration
 */
export const Fonts = Platform.select({
  ios: {
    /** iOS System Font */
    sans: 'System',
    /** iOS Monospace */
    mono: 'Menlo',
  },
  android: {
    /** Android Roboto */
    sans: 'Roboto',
    /** Android Monospace */
    mono: 'monospace',
  },
  default: {
    sans: 'system-ui',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/**
 * Typography scale
 */
export const Typography = {
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: -0.1,
  },
  
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodySemibold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  // Small text
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  smallMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  smallSemibold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  
  // Extra small text
  xs: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  xsMedium: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0,
  },
  
  // Caption
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
};

/**
 * Spacing scale (in pixels)
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

/**
 * Border radius scale
 */
export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

/**
 * Shadow configurations
 */
export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }),
};
