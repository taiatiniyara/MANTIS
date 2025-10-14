import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { 
  registerPushToken, 
  unregisterPushToken, 
  markNotificationAsOpened,
  getExpoPushToken
} from '@/lib/api/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { session, loading, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  // Handle authentication and navigation
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
  }, [session, segments, loading]);

  // Register push token when user logs in
  useEffect(() => {
    if (session && profile) {
      registerPushToken(profile.id).then((success) => {
        if (success) {
          console.log('Push token registered successfully');
        } else {
          console.log('Failed to register push token');
        }
      });
    }
  }, [session, profile]);

  // Setup notification listeners
  useEffect(() => {
    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received (foreground):', notification);
      
      // You can customize behavior here (e.g., show in-app alert)
      // The notification will still be displayed by the system
    });

    // Listener for when user taps a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      
      const data = response.notification.request.content.data;
      
      // Mark as opened in database
      if (data && typeof data.notificationHistoryId === 'string') {
        markNotificationAsOpened(data.notificationHistoryId);
      }
      
      // Navigate based on notification type
      handleNotificationNavigation(data);
    });

    return () => {
      // Cleanup listeners
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Unregister token on logout
  useEffect(() => {
    if (!session) {
      getExpoPushToken().then((token) => {
        if (token) {
          unregisterPushToken(token);
        }
      });
    }
  }, [session]);

  /**
   * Navigate to appropriate screen based on notification data
   */
  const handleNotificationNavigation = (data: any) => {
    if (!data || !data.type) return;

    try {
      switch (data.type) {
        case 'payment_received':
        case 'payment_reminder':
          // Navigate to infringements tab (payments handled there)
          router.push('/(tabs)/infringements');
          break;

        case 'dispute_submitted':
        case 'dispute_resolved':
          // Navigate to infringements tab (disputes handled there)
          router.push('/(tabs)/infringements');
          break;

        case 'infringement_issued':
        case 'infringement_voided':
          // Navigate to infringements tab or specific infringement
          if (data.infringementId) {
            // TODO: Navigate to specific infringement detail
            router.push('/(tabs)/infringements');
          } else {
            router.push('/(tabs)/infringements');
          }
          break;

        case 'assignment_received':
          // For officers - navigate to create infringement
          router.push('/(tabs)/create-infringement');
          break;

        case 'daily_summary':
          // Navigate to profile or home
          router.push('/(tabs)/profile');
          break;

        case 'system_alerts':
        default:
          // Navigate to home
          router.push('/(tabs)');
          break;
      }
    } catch (error) {
      console.error('Error navigating from notification:', error);
    }
  };

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
