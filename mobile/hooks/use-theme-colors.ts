/**
 * Custom Hook for Theme Colors
 * Simplifies accessing theme colors throughout the app
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from './use-color-scheme';

export function useThemeColors() {
  const colorScheme = useColorScheme();
  return Colors[colorScheme ?? 'light'];
}
