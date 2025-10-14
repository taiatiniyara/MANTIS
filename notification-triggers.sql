-- Notification Triggers SQL
-- Automatically sends push notifications when specific events occur

-- Helper function to call the Edge Function
CREATE OR REPLACE FUNCTION notify_user(
  p_user_id uuid,
  p_notification_type text,
  p_title text,
  p_body text,
  p_data jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id bigint;
BEGIN
  -- Call Supabase Edge Function via pg_net
  -- Note: This requires pg_net extension to be enabled
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-push-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
    ),
    body := jsonb_build_object(
      'user_id', p_user_id,
      'notification_type', p_notification_type,
      'title', p_title,
      'body', p_body,
      'data', p_data
    )
  ) INTO v_request_id;
  
  -- Log the request
  RAISE NOTICE 'Notification request % sent for user %', v_request_id, p_user_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the transaction if notification fails
    RAISE WARNING 'Failed to send notification: %', SQLERRM;
END;
$$;

-- =============================================================================
-- PAYMENT NOTIFICATIONS
-- =============================================================================

-- Trigger: Payment Received
-- Fires when a payment is successfully processed
CREATE OR REPLACE FUNCTION trigger_payment_received_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_infringement_number text;
  v_amount numeric;
  v_citizen_id uuid;
BEGIN
  -- Get infringement details
  SELECT 
    i.infringement_number,
    i.fine_amount,
    i.citizen_user_id
  INTO v_infringement_number, v_amount, v_citizen_id
  FROM infringements i
  WHERE i.id = NEW.infringement_id;

  -- Send notification to citizen
  IF v_citizen_id IS NOT NULL THEN
    PERFORM notify_user(
      v_citizen_id,
      'payment_received',
      'Payment Received',
      'Your payment of $' || v_amount::text || ' for infringement ' || v_infringement_number || ' has been processed.',
      jsonb_build_object(
        'infringementId', NEW.infringement_id,
        'paymentId', NEW.id,
        'amount', v_amount
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_payment_received ON payments;

-- Create trigger on payments table
CREATE TRIGGER on_payment_received
  AFTER INSERT ON payments
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION trigger_payment_received_notification();

-- =============================================================================
-- DISPUTE NOTIFICATIONS
-- =============================================================================

-- Trigger: Dispute Submitted
-- Fires when a new dispute is created
CREATE OR REPLACE FUNCTION trigger_dispute_submitted_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_infringement_number text;
  v_citizen_id uuid;
BEGIN
  -- Get infringement details
  SELECT 
    i.infringement_number,
    i.citizen_user_id
  INTO v_infringement_number, v_citizen_id
  FROM infringements i
  WHERE i.id = NEW.infringement_id;

  -- Send notification to citizen
  IF v_citizen_id IS NOT NULL THEN
    PERFORM notify_user(
      v_citizen_id,
      'dispute_submitted',
      'Dispute Submitted',
      'Your dispute for infringement ' || v_infringement_number || ' has been submitted and is under review.',
      jsonb_build_object(
        'infringementId', NEW.infringement_id,
        'disputeId', NEW.id
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_dispute_submitted ON disputes;

-- Create trigger on disputes table
CREATE TRIGGER on_dispute_submitted
  AFTER INSERT ON disputes
  FOR EACH ROW
  EXECUTE FUNCTION trigger_dispute_submitted_notification();

-- Trigger: Dispute Resolved
-- Fires when a dispute status changes to approved or rejected
CREATE OR REPLACE FUNCTION trigger_dispute_resolved_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_infringement_number text;
  v_citizen_id uuid;
  v_title text;
  v_body text;
BEGIN
  -- Only trigger if status changed to approved or rejected
  IF NEW.status NOT IN ('approved', 'rejected') THEN
    RETURN NEW;
  END IF;

  -- Get infringement details
  SELECT 
    i.infringement_number,
    i.citizen_user_id
  INTO v_infringement_number, v_citizen_id
  FROM infringements i
  WHERE i.id = NEW.infringement_id;

  -- Customize message based on outcome
  IF NEW.status = 'approved' THEN
    v_title := 'Dispute Approved';
    v_body := 'Great news! Your dispute for infringement ' || v_infringement_number || ' has been approved.';
  ELSE
    v_title := 'Dispute Decision';
    v_body := 'Your dispute for infringement ' || v_infringement_number || ' has been reviewed and rejected.';
  END IF;

  -- Send notification to citizen
  IF v_citizen_id IS NOT NULL THEN
    PERFORM notify_user(
      v_citizen_id,
      'dispute_resolved',
      v_title,
      v_body,
      jsonb_build_object(
        'infringementId', NEW.infringement_id,
        'disputeId', NEW.id,
        'status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_dispute_resolved ON disputes;

-- Create trigger on disputes table
CREATE TRIGGER on_dispute_resolved
  AFTER UPDATE ON disputes
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected'))
  EXECUTE FUNCTION trigger_dispute_resolved_notification();

-- =============================================================================
-- INFRINGEMENT NOTIFICATIONS
-- =============================================================================

-- Trigger: Infringement Issued
-- Fires when a new infringement is created
CREATE OR REPLACE FUNCTION trigger_infringement_issued_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_citizen_id uuid;
  v_offence_name text;
BEGIN
  -- Get citizen ID and offence name
  SELECT 
    v.owner_user_id,
    o.name
  INTO v_citizen_id, v_offence_name
  FROM vehicles v
  JOIN offences o ON o.id = NEW.offence_id
  WHERE v.id = NEW.vehicle_id;

  -- Send notification to citizen
  IF v_citizen_id IS NOT NULL THEN
    PERFORM notify_user(
      v_citizen_id,
      'infringement_issued',
      'New Infringement Issued',
      'You have received a new infringement: ' || v_offence_name || '. Fine amount: $' || NEW.fine_amount::text,
      jsonb_build_object(
        'infringementId', NEW.id,
        'infringementNumber', NEW.infringement_number,
        'amount', NEW.fine_amount
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_infringement_issued ON infringements;

-- Create trigger on infringements table
CREATE TRIGGER on_infringement_issued
  AFTER INSERT ON infringements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_infringement_issued_notification();

-- Trigger: Infringement Voided
-- Fires when an infringement status changes to voided
CREATE OR REPLACE FUNCTION trigger_infringement_voided_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_citizen_id uuid;
BEGIN
  -- Get citizen ID
  SELECT owner_user_id
  INTO v_citizen_id
  FROM vehicles
  WHERE id = NEW.vehicle_id;

  -- Send notification to citizen
  IF v_citizen_id IS NOT NULL THEN
    PERFORM notify_user(
      v_citizen_id,
      'infringement_voided',
      'Infringement Voided',
      'Infringement ' || NEW.infringement_number || ' has been voided. No payment is required.',
      jsonb_build_object(
        'infringementId', NEW.id,
        'infringementNumber', NEW.infringement_number
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_infringement_voided ON infringements;

-- Create trigger on infringements table
CREATE TRIGGER on_infringement_voided
  AFTER UPDATE ON infringements
  FOR EACH ROW
  WHEN (OLD.status != 'voided' AND NEW.status = 'voided')
  EXECUTE FUNCTION trigger_infringement_voided_notification();

-- =============================================================================
-- PAYMENT REMINDER SCHEDULED FUNCTION
-- =============================================================================

-- Function to send payment reminders
-- Should be called daily via Supabase cron job or external scheduler
CREATE OR REPLACE FUNCTION send_payment_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- Find infringements with payment due in 3 days
  FOR v_record IN
    SELECT 
      i.id as infringement_id,
      i.infringement_number,
      i.fine_amount,
      i.due_date,
      v.owner_user_id as citizen_id
    FROM infringements i
    JOIN vehicles v ON v.id = i.vehicle_id
    WHERE i.status = 'issued'
      AND i.due_date = CURRENT_DATE + INTERVAL '3 days'
      AND NOT EXISTS (
        SELECT 1 FROM payments p 
        WHERE p.infringement_id = i.id 
        AND p.status = 'completed'
      )
  LOOP
    -- Send reminder notification
    PERFORM notify_user(
      v_record.citizen_id,
      'payment_reminder',
      'Payment Reminder',
      'Your payment of $' || v_record.fine_amount::text || ' for infringement ' || 
      v_record.infringement_number || ' is due in 3 days (' || v_record.due_date::text || ').',
      jsonb_build_object(
        'infringementId', v_record.infringement_id,
        'infringementNumber', v_record.infringement_number,
        'amount', v_record.fine_amount,
        'dueDate', v_record.due_date
      )
    );
  END LOOP;
  
  RAISE NOTICE 'Payment reminders sent';
END;
$$;

-- =============================================================================
-- CONFIGURATION
-- =============================================================================

-- Set Supabase URL and anon key (replace with your actual values)
-- These should be set via environment variables or ALTER DATABASE
-- Example: ALTER DATABASE postgres SET app.settings.supabase_url = 'https://your-project.supabase.co';

-- To manually trigger a notification (for testing):
-- SELECT notify_user(
--   'user-uuid-here',
--   'system_alerts',
--   'Test Notification',
--   'This is a test notification from the MANTIS system.',
--   '{"test": true}'::jsonb
-- );

-- To manually send payment reminders:
-- SELECT send_payment_reminders();

-- Comments for documentation
COMMENT ON FUNCTION notify_user IS 'Sends push notification to user via Edge Function';
COMMENT ON FUNCTION send_payment_reminders IS 'Sends payment reminders for infringements due in 3 days (run daily)';
