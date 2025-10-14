import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/supabase/config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPreferences {
  payment_received: boolean;
  payment_reminder: boolean;
  dispute_submitted: boolean;
  dispute_resolved: boolean;
  infringement_issued: boolean;
  infringement_voided: boolean;
  assignment_received: boolean;
  daily_summary: boolean;
  system_alerts: boolean;
}

export interface PushToken {
  id: string;
  user_id: string;
  token: string;
  device_name: string | null;
  device_type: 'ios' | 'android' | null;
  app_version: string | null;
  is_active: boolean;
  last_used_at: string;
  created_at: string;
}

export interface NotificationData {
  type: string;
  id?: string;
  [key: string]: any;
}

/**
 * Request notification permissions from the user
 * @returns Permission status
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission to receive push notifications was denied');
    return false;
  }

  return true;
}

/**
 * Get the Expo Push Token for this device
 * @returns Expo push token string
 */
export async function getExpoPushToken(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // TODO: Replace with actual project ID from app.json
    });

    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Register the device's push token with the backend
 * @param userId User ID from authentication
 * @returns Success status
 */
export async function registerPushToken(userId: string): Promise<boolean> {
  try {
    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return false;
    }

    // Get the push token
    const token = await getExpoPushToken();
    if (!token) {
      return false;
    }

    // Get device info
    const deviceName = Device.deviceName || null;
    const deviceType = Platform.OS as 'ios' | 'android';
    const appVersion = '1.0.0'; // TODO: Get from app.json or Constants.expoConfig.version

    // Check if token already exists
    const { data: existingToken } = await supabase
      .from('push_tokens')
      .select('id, is_active')
      .eq('token', token)
      .single();

    if (existingToken) {
      // Update existing token
      const { error } = await supabase
        .from('push_tokens')
        .update({
          user_id: userId,
          device_name: deviceName,
          device_type: deviceType,
          app_version: appVersion,
          is_active: true,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', existingToken.id);

      if (error) {
        console.error('Error updating push token:', error);
        return false;
      }
    } else {
      // Insert new token
      const { error } = await supabase
        .from('push_tokens')
        .insert({
          user_id: userId,
          token,
          device_name: deviceName,
          device_type: deviceType,
          app_version: appVersion,
          is_active: true,
        });

      if (error) {
        console.error('Error inserting push token:', error);
        return false;
      }
    }

    // Create default notification preferences if they don't exist
    const { error: prefsError } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: true,
      });

    if (prefsError) {
      console.error('Error creating notification preferences:', prefsError);
    }

    console.log('Push token registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering push token:', error);
    return false;
  }
}

/**
 * Unregister the device's push token (on logout)
 * @param token Push token to unregister
 * @returns Success status
 */
export async function unregisterPushToken(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .update({ is_active: false })
      .eq('token', token);

    if (error) {
      console.error('Error unregistering push token:', error);
      return false;
    }

    console.log('Push token unregistered successfully');
    return true;
  } catch (error) {
    console.error('Error unregistering push token:', error);
    return false;
  }
}

/**
 * Get user's notification preferences
 * @param userId User ID
 * @returns Notification preferences
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }

    return {
      payment_received: data.payment_received,
      payment_reminder: data.payment_reminder,
      dispute_submitted: data.dispute_submitted,
      dispute_resolved: data.dispute_resolved,
      infringement_issued: data.infringement_issued,
      infringement_voided: data.infringement_voided,
      assignment_received: data.assignment_received,
      daily_summary: data.daily_summary,
      system_alerts: data.system_alerts,
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    return null;
  }
}

/**
 * Update user's notification preferences
 * @param userId User ID
 * @param preferences Partial preferences to update
 * @returns Success status
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }

    console.log('Notification preferences updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}

/**
 * Get user's push tokens
 * @param userId User ID
 * @returns Array of push tokens
 */
export async function getUserPushTokens(userId: string): Promise<PushToken[]> {
  try {
    const { data, error } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_used_at', { ascending: false });

    if (error) {
      console.error('Error fetching push tokens:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting push tokens:', error);
    return [];
  }
}

/**
 * Schedule a local notification (for testing or reminders)
 * @param title Notification title
 * @param body Notification body
 * @param data Optional data payload
 * @param trigger When to show the notification
 * @returns Notification ID
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data?: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: trigger || null, // null = show immediately
    });

    console.log('Local notification scheduled:', id);
    return id;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 * @param notificationId Notification ID from scheduleLocalNotification
 */
export async function cancelLocalNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllLocalNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
  }
}

/**
 * Get notification history for the user
 * @param userId User ID
 * @param limit Number of records to fetch
 * @returns Array of notification history
 */
export async function getNotificationHistory(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('notification_history')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notification history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error getting notification history:', error);
    return [];
  }
}

/**
 * Mark notification as opened (for analytics)
 * @param notificationId Notification history ID
 */
export async function markNotificationAsOpened(notificationId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notification_history')
      .update({
        status: 'opened',
        opened_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as opened:', error);
    }
  } catch (error) {
    console.error('Error marking notification as opened:', error);
  }
}

/**
 * Get unread notification count
 * @param userId User ID
 * @returns Count of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('notification_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'delivered')
      .is('opened_at', null);

    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}
