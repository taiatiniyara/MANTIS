-- ============================
-- Audit Logging System
-- ============================

-- Create audit_logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  user_id uuid REFERENCES auth.users(id),
  user_role text,
  user_email text,
  timestamp timestamptz DEFAULT now(),
  
  -- Indexes for performance
  CONSTRAINT audit_logs_action_check CHECK (action IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Create indexes for common queries
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================
-- Generic Audit Trigger Function
-- ============================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id uuid;
  current_user_role text;
  current_user_email text;
BEGIN
  -- Get current user info from auth.users
  SELECT 
    auth.uid(),
    (SELECT role FROM users WHERE id = auth.uid()),
    (SELECT email FROM auth.users WHERE id = auth.uid())
  INTO current_user_id, current_user_role, current_user_email;

  -- Handle INSERT
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id,
      user_role,
      user_email
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'INSERT',
      NULL,
      to_jsonb(NEW),
      current_user_id,
      current_user_role,
      current_user_email
    );
    RETURN NEW;
  
  -- Handle UPDATE
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id,
      user_role,
      user_email
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      current_user_id,
      current_user_role,
      current_user_email
    );
    RETURN NEW;
  
  -- Handle DELETE
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      user_id,
      user_role,
      user_email
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      NULL,
      current_user_id,
      current_user_role,
      current_user_email
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================
-- Create Triggers for Critical Tables
-- ============================

-- Agencies
CREATE TRIGGER audit_agencies_trigger
  AFTER INSERT OR UPDATE OR DELETE ON agencies
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Users
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Locations
CREATE TRIGGER audit_locations_trigger
  AFTER INSERT OR UPDATE OR DELETE ON locations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Teams
CREATE TRIGGER audit_teams_trigger
  AFTER INSERT OR UPDATE OR DELETE ON teams
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Routes
CREATE TRIGGER audit_routes_trigger
  AFTER INSERT OR UPDATE OR DELETE ON routes
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Categories
CREATE TRIGGER audit_categories_trigger
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Types
CREATE TRIGGER audit_types_trigger
  AFTER INSERT OR UPDATE OR DELETE ON types
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Infringements
CREATE TRIGGER audit_infringements_trigger
  AFTER INSERT OR UPDATE OR DELETE ON infringements
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================
-- RLS Policies for audit_logs
-- ============================

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Super Admin can see all audit logs
CREATE POLICY "Super admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- Agency Admins can see logs for their agency's records
CREATE POLICY "Agency admins can view their agency audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'agency_admin'
      AND (
        -- Check if the audited record belongs to their agency
        (table_name = 'agencies' AND record_id = users.agency_id)
        OR (table_name = 'users' AND (old_data->>'agency_id')::uuid = users.agency_id)
        OR (table_name = 'teams' AND (old_data->>'agency_id')::uuid = users.agency_id)
        OR (table_name = 'routes' AND (old_data->>'agency_id')::uuid = users.agency_id)
        OR (table_name = 'locations' AND (old_data->>'agency_id')::uuid = users.agency_id)
        OR (table_name = 'infringements' AND (old_data->>'agency_id')::uuid = users.agency_id)
      )
    )
  );

-- No insert/update/delete for regular users (system only)
CREATE POLICY "Only system can write audit logs"
  ON audit_logs FOR ALL
  USING (false);

-- ============================
-- Helper View for Audit Logs with User Info
-- ============================

CREATE OR REPLACE VIEW audit_logs_with_details AS
SELECT 
  al.*,
  u.position as user_position,
  a.name as agency_name,
  CASE 
    WHEN al.table_name = 'agencies' THEN (al.new_data->>'name')
    WHEN al.table_name = 'users' THEN (al.new_data->>'position')
    WHEN al.table_name = 'teams' THEN (al.new_data->>'name')
    WHEN al.table_name = 'routes' THEN (al.new_data->>'name')
    WHEN al.table_name = 'locations' THEN (al.new_data->>'name')
    WHEN al.table_name = 'categories' THEN (al.new_data->>'name')
    WHEN al.table_name = 'types' THEN (al.new_data->>'name')
    WHEN al.table_name = 'infringements' THEN (al.new_data->>'vehicle_id')
    ELSE NULL
  END as record_description
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
LEFT JOIN agencies a ON u.agency_id = a.id
ORDER BY al.timestamp DESC;

-- Grant access to the view
GRANT SELECT ON audit_logs_with_details TO authenticated;
