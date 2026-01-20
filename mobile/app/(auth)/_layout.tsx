/**
 * MANTIS Mobile - Auth Layout
 * Wraps all auth screens with SafeAreaLayout
 */

import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function AuthLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { 
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }
      }}
    >
      <Stack.Screen name="login" />
    </Stack>
  );
}
