/**
 * MANTIS Mobile App Theme - Slate & Orange
 * 
 * Primary Color: Orange (#F97316) - Action buttons, highlights, active states
 * Background: Slate tones - Professional, modern look
 * 
 * Light mode: White backgrounds with slate text and orange accents
 * Dark mode: Slate backgrounds with light text and orange accents
 */

import { Platform } from 'react-native';

// Primary brand colors
const orangePrimary = '#F97316'; // Orange 500 - Primary action color
const orangeLight = '#FB923C';   // Orange 400 - Hover/light variant
const orangeDark = '#EA580C';    // Orange 600 - Pressed/dark variant

// Slate color palette
const slate50 = '#F8FAFC';
const slate100 = '#F1F5F9';
const slate200 = '#E2E8F0';
const slate300 = '#CBD5E1';
const slate400 = '#94A3B8';
const slate500 = '#64748B';
const slate600 = '#475569';
const slate700 = '#334155';
const slate800 = '#1E293B';
const slate900 = '#0F172A';

export const Colors = {
  light: {
    text: slate900,              // Dark slate for main text
    background: '#FFFFFF',        // Pure white background
    tint: orangePrimary,         // Orange for primary actions
    icon: slate500,              // Medium slate for icons
    tabIconDefault: slate400,    // Lighter slate for inactive tabs
    tabIconSelected: orangePrimary, // Orange for active tabs
    
    // Additional colors for comprehensive theming
    primary: orangePrimary,
    primaryLight: orangeLight,
    primaryDark: orangeDark,
    
    textSecondary: slate600,
    textMuted: slate500,
    
    border: slate200,
    borderLight: slate100,
    
    card: '#FFFFFF',
    cardElevated: slate50,
    
    surface: slate50,
    surfaceHover: slate100,
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  dark: {
    text: slate50,               // Very light slate for main text
    background: slate900,        // Deep slate background
    tint: orangePrimary,        // Orange for primary actions
    icon: slate400,             // Medium-light slate for icons
    tabIconDefault: slate500,   // Medium slate for inactive tabs
    tabIconSelected: orangePrimary, // Orange for active tabs
    
    // Additional colors for comprehensive theming
    primary: orangePrimary,
    primaryLight: orangeLight,
    primaryDark: orangeDark,
    
    textSecondary: slate300,
    textMuted: slate400,
    
    border: slate700,
    borderLight: slate800,
    
    card: slate800,
    cardElevated: slate700,
    
    surface: slate800,
    surfaceHover: slate700,
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
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
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
