import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * MANTIS Light Theme for React Navigation
 */
const MANTISTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.primary,
  },
};

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!session && inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (session && !inAuthGroup) {
      // Redirect to tabs if authenticated
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={MANTISTheme}>
        <RootLayoutNav />
        <StatusBar style="light" backgroundColor="#007AFF" />
      </ThemeProvider>
    </AuthProvider>
  );
}
