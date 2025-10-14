-- Push Notification Tokens Table
-- Stores device tokens for Expo Push Notifications
-- Each user can have multiple devices (phone, tablet, etc.)

CREATE TABLE IF NOT EXISTS push_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  device_name text,
  device_type text, -- 'ios', 'android'
  app_version text,
  is_active boolean DEFAULT true,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);

-- Index for active tokens
CREATE INDEX IF NOT EXISTS idx_push_tokens_active ON push_tokens(is_active) WHERE is_active = true;

-- Notification Preferences Table
-- User preferences for which notifications they want to receive
CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Payment notifications
  payment_received boolean DEFAULT true,
  payment_reminder boolean DEFAULT true,
  
  -- Dispute notifications
  dispute_submitted boolean DEFAULT true,
  dispute_resolved boolean DEFAULT true,
  
  -- Infringement notifications
  infringement_issued boolean DEFAULT true,
  infringement_voided boolean DEFAULT true,
  
  -- Officer notifications
  assignment_received boolean DEFAULT true,
  daily_summary boolean DEFAULT true,
  
  -- System notifications
  system_alerts boolean DEFAULT true,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Notification History Table
-- Track all notifications sent for audit and debugging
CREATE TABLE IF NOT EXISTS notification_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  data jsonb,
  push_token text,
  status text NOT NULL, -- 'sent', 'failed', 'delivered', 'opened'
  error_message text,
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  opened_at timestamptz
);

-- Index for user history
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);

-- Index for notification type analytics
CREATE INDEX IF NOT EXISTS idx_notification_history_type ON notification_history(notification_type);

-- Index for sent date (for cleanup/analytics)
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON push_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- push_tokens policies
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own tokens
CREATE POLICY "Users can view own push tokens"
  ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can insert own push tokens"
  ON push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update own push tokens"
  ON push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete own push tokens"
  ON push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can view all tokens
CREATE POLICY "Admins can view all push tokens"
  ON push_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('system_admin', 'agency_admin')
    )
  );

-- notification_preferences policies
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view their own preferences
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- notification_history policies
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own notification history
CREATE POLICY "Users can view own notification history"
  ON notification_history FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert notifications (service role)
CREATE POLICY "Service role can insert notifications"
  ON notification_history FOR INSERT
  WITH CHECK (true);

-- Admins can view all notification history
CREATE POLICY "Admins can view all notification history"
  ON notification_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role IN ('system_admin', 'agency_admin')
    )
  );

-- Insert default preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM user_profiles
ON CONFLICT (user_id) DO NOTHING;

-- Grant permissions
GRANT ALL ON push_tokens TO authenticated;
GRANT ALL ON notification_preferences TO authenticated;
GRANT ALL ON notification_history TO authenticated;
GRANT ALL ON notification_history TO service_role;

-- Comments for documentation
COMMENT ON TABLE push_tokens IS 'Stores Expo push notification tokens for user devices';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification types';
COMMENT ON TABLE notification_history IS 'Audit log of all notifications sent to users';

COMMENT ON COLUMN push_tokens.token IS 'Expo Push Token (ExponentPushToken[...])';
COMMENT ON COLUMN push_tokens.device_type IS 'Device platform: ios or android';
COMMENT ON COLUMN push_tokens.is_active IS 'False if user logged out or uninstalled app';
COMMENT ON COLUMN push_tokens.last_used_at IS 'Last time this token was successfully used';

COMMENT ON COLUMN notification_history.status IS 'sent: Queued to Expo | failed: Error sending | delivered: Received by device | opened: User tapped notification';
