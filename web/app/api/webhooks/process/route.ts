import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: Request) {
  try {
    

    // Get pending webhook deliveries
    const { data: deliveries, error } = await supabase
      .from('webhook_deliveries')
      .select(`
        *,
        webhook:webhooks(url, secret, headers, timeout_seconds, retry_count)
      `)
      .in('status', ['pending', 'retrying'])
      .lt('attempt_count', 3)
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) throw error;

    const results = [];

    for (const delivery of deliveries || []) {
      try {
        const webhook = delivery.webhook[0];
        
        // Generate signature for verification
        const signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(delivery.payload))
          .digest('hex');

        // Prepare headers
        const headers = {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': delivery.event_type,
          'X-Webhook-Delivery-Id': delivery.id,
          ...((webhook.headers as Record<string, string>) || {}),
        };

        // Send webhook
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), (webhook.timeout_seconds || 30) * 1000);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers,
          body: JSON.stringify(delivery.payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const responseBody = await response.text();

        // Update delivery status
        if (response.ok) {
          await supabase
            .from('webhook_deliveries')
            .update({
              status: 'success',
              response_code: response.status,
              response_body: responseBody,
              delivered_at: new Date().toISOString(),
              attempt_count: delivery.attempt_count + 1,
            })
            .eq('id', delivery.id);

          results.push({ id: delivery.id, status: 'success' });
        } else {
          throw new Error(`HTTP ${response.status}: ${responseBody}`);
        }
      } catch (error) {
        // Update delivery with error
        const newAttemptCount = delivery.attempt_count + 1;
        const maxRetries = delivery.webhook[0]?.retry_count || 3;

        await supabase
          .from('webhook_deliveries')
          .update({
            status: newAttemptCount >= maxRetries ? 'failed' : 'retrying',
            response_body: error instanceof Error ? error.message : 'Unknown error',
            attempt_count: newAttemptCount,
            next_retry_at: new Date(Date.now() + Math.pow(2, newAttemptCount) * 60000).toISOString(), // Exponential backoff
          })
          .eq('id', delivery.id);

        results.push({ id: delivery.id, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Error processing webhooks:', error);
    return NextResponse.json(
      { error: 'Failed to process webhooks' },
      { status: 500 }
    );
  }
}
