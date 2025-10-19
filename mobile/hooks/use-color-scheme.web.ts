/**
 * MANTIS Mobile - Light mode only (Web)
 * This hook always returns 'light' to enforce consistent theming
 */
export function useColorScheme() {
  return 'light' as const;
}
