// Supabase Edge Function: send-push-notification
// Sends push notifications to users via Expo Push Notification service
// Triggered by database events or manual API calls

// @ts-ignore - Deno runtime module
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore - Deno runtime module
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

// Declare Deno namespace for environment variables
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: any;
  sound?: 'default' | null;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

interface NotificationRequest {
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  data?: any;
}

interface PushToken {
  token: string;
}

serve(async (req: Request) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { user_id, notification_type, title, body, data }: NotificationRequest = await req.json();

    if (!user_id || !notification_type || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, notification_type, title, body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Check user's notification preferences
    const { data: preferences, error: prefsError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (prefsError) {
      console.error('Error fetching preferences:', prefsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user preferences' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user wants this notification type
    const preferenceKey = notification_type as keyof typeof preferences;
    if (preferences && preferences[preferenceKey] === false) {
      console.log(`User ${user_id} has disabled ${notification_type} notifications`);
      return new Response(
        JSON.stringify({ message: 'Notification disabled by user preferences', sent: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Get user's active push tokens
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', user_id)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Error fetching push tokens:', tokensError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch push tokens' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!tokens || tokens.length === 0) {
      console.log(`No active push tokens found for user ${user_id}`);
      return new Response(
        JSON.stringify({ message: 'No active push tokens', sent: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Prepare push messages
    const messages: PushMessage[] = tokens.map(({ token }: PushToken) => ({
      to: token,
      title,
      body,
      data: {
        ...data,
        type: notification_type,
      },
      sound: 'default',
      priority: 'high',
      channelId: 'default',
    }));

    // 4. Send to Expo Push Notification service
    const pushResponse = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const pushResult = await pushResponse.json();
    console.log('Expo push result:', pushResult);

    // 5. Log each notification to history
    const historyRecords = tokens.map(({ token }: PushToken) => ({
      user_id,
      notification_type,
      title,
      body,
      data: data || {},
      push_token: token,
      status: 'sent',
      sent_at: new Date().toISOString(),
    }));

    const { error: historyError } = await supabase
      .from('notification_history')
      .insert(historyRecords);

    if (historyError) {
      console.error('Error logging notification history:', historyError);
    }

    // 6. Check for failed sends and mark tokens as inactive if needed
    if (pushResult.data) {
      for (let i = 0; i < pushResult.data.length; i++) {
        const result = pushResult.data[i];
        const token = tokens[i].token;

        if (result.status === 'error') {
          console.error(`Failed to send to token ${token}:`, result.message);

          // If token is invalid, mark as inactive
          if (result.details?.error === 'DeviceNotRegistered') {
            await supabase
              .from('push_tokens')
              .update({ is_active: false })
              .eq('token', token);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications sent successfully',
        sent: true,
        count: tokens.length,
        results: pushResult.data,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-push-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
})
