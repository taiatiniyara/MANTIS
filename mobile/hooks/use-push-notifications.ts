import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PUSH_TOKEN_KEY = '@mantis_push_token';

// Configure how notifications are displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface PushNotification {
  title: string;
  body: string;
  data?: any;
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    registerForPushNotifications();

    // Listen for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push notification permissions');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with your Expo project ID
      });

      const token = tokenData.data;
      setExpoPushToken(token);

      // Store token locally
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

      // Send token to your backend
      await registerPushToken(token);

      // Configure Android channel
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
    }
  };

  const registerPushToken = async (token: string) => {
    try {
      // Send token to your backend API
      await fetch('/api/push-notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS,
        }),
      });
    } catch (error) {
      console.error('Error registering push token with backend:', error);
    }
  };

  const schedulePushNotification = async (notification: PushNotification, seconds: number = 0) => {
    try {
      const trigger: Notifications.NotificationTriggerInput = seconds === 0 
        ? null 
        : {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds,
            repeats: false,
          } as Notifications.TimeIntervalTriggerInput;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          sound: true,
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const sendImmediateNotification = async (notification: PushNotification) => {
    await schedulePushNotification(notification, 0);
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  };

  const getBadgeCount = async (): Promise<number> => {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  };

  const clearBadge = async () => {
    await setBadgeCount(0);
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    // Handle navigation based on notification data
    if (data?.screen) {
      // Navigate to specific screen
      console.log('Navigate to:', data.screen);
    }

    if (data?.infringementId) {
      // Navigate to infringement details
      console.log('Open infringement:', data.infringementId);
    }
  };

  return {
    expoPushToken,
    notification,
    registerForPushNotifications,
    schedulePushNotification,
    sendImmediateNotification,
    cancelAllNotifications,
    getBadgeCount,
    setBadgeCount,
    clearBadge,
  };
}
