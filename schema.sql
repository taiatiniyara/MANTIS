-- ============================================================================
-- MANTIS: Multi-Agency Traffic Infringement System
-- Supabase PostgreSQL Schema with PostGIS
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('officer', 'agency_admin', 'central_admin', 'citizen');
CREATE TYPE infringement_status AS ENUM ('issued', 'paid', 'voided', 'disputed');
CREATE TYPE payment_method AS ENUM ('card', 'mpaisa', 'mycash');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE dispute_status AS ENUM ('open', 'resolved', 'escalated');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Agencies table
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT agencies_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT agencies_code_not_empty CHECK (LENGTH(TRIM(code)) > 0)
);

COMMENT ON TABLE agencies IS 'Government agencies that can issue infringements (Police, LTA, Councils)';
COMMENT ON COLUMN agencies.code IS 'Short agency code (e.g., POLICE, LTA, SUVA_CC)';

-- Users table (extends auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    display_name TEXT NOT NULL,
    driver_licence_number TEXT,
    phone TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT users_display_name_not_empty CHECK (LENGTH(TRIM(display_name)) > 0),
    CONSTRAINT users_officer_must_have_agency CHECK (
        role = 'citizen' OR agency_id IS NOT NULL
    ),
    CONSTRAINT users_citizen_no_agency CHECK (
        role != 'citizen' OR agency_id IS NULL
    )
);

COMMENT ON TABLE users IS 'User profiles linked to Supabase Auth';
COMMENT ON COLUMN users.agency_id IS 'NULL for citizens, required for officers/admins';
COMMENT ON COLUMN users.driver_licence_number IS 'Used for citizen lookup of their infringements';

-- Vehicles table
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_number TEXT NOT NULL UNIQUE,
    owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    make TEXT,
    model TEXT,
    year INTEGER,
    color TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT vehicles_reg_number_format CHECK (reg_number ~ '^[A-Z0-9]{2,10}$'),
    CONSTRAINT vehicles_year_valid CHECK (year IS NULL OR (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1))
);

COMMENT ON TABLE vehicles IS 'Vehicle registry for linking infringements';
COMMENT ON COLUMN vehicles.reg_number IS 'Vehicle registration number (uppercase, no spaces)';

-- Offences catalog
CREATE TABLE offences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    base_fine_amount NUMERIC(10, 2) NOT NULL,
    category TEXT, -- e.g., 'speeding', 'parking', 'license', etc.
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT offences_code_not_empty CHECK (LENGTH(TRIM(code)) > 0),
    CONSTRAINT offences_description_not_empty CHECK (LENGTH(TRIM(description)) > 0),
    CONSTRAINT offences_fine_positive CHECK (base_fine_amount > 0)
);

COMMENT ON TABLE offences IS 'Centralized catalog of traffic offences and fines';
COMMENT ON COLUMN offences.code IS 'Unique offence code (e.g., SPD001, PARK002)';

-- Infringements table (main entity)
CREATE TABLE infringements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    infringement_number TEXT NOT NULL UNIQUE,
    issuing_agency_id UUID NOT NULL REFERENCES agencies(id),
    officer_user_id UUID NOT NULL REFERENCES users(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_licence_number TEXT,
    offence_id UUID NOT NULL REFERENCES offences(id),
    fine_amount NUMERIC(10, 2) NOT NULL,
    status infringement_status NOT NULL DEFAULT 'issued',
    location GEOGRAPHY(POINT, 4326),
    location_description TEXT,
    notes TEXT,
    evidence_urls JSONB DEFAULT '[]'::jsonb,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT infringements_fine_positive CHECK (fine_amount > 0),
    CONSTRAINT infringements_evidence_is_array CHECK (jsonb_typeof(evidence_urls) = 'array')
);

COMMENT ON TABLE infringements IS 'Traffic infringement records';
COMMENT ON COLUMN infringements.infringement_number IS 'Human-readable unique identifier (e.g., INF-2024-000001)';
COMMENT ON COLUMN infringements.location IS 'PostGIS geography point (latitude, longitude)';
COMMENT ON COLUMN infringements.evidence_urls IS 'Array of Supabase Storage signed URLs for photos/documents';

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    infringement_id UUID NOT NULL REFERENCES infringements(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    method payment_method NOT NULL,
    provider_ref TEXT, -- External payment provider reference
    status payment_status NOT NULL DEFAULT 'pending',
    receipt_number TEXT UNIQUE,
    paid_by_user_id UUID REFERENCES users(id),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT payments_amount_positive CHECK (amount > 0),
    CONSTRAINT payments_paid_at_when_success CHECK (
        status != 'success' OR paid_at IS NOT NULL
    )
);

COMMENT ON TABLE payments IS 'Payment transactions for infringements';
COMMENT ON COLUMN payments.provider_ref IS 'Reference from payment gateway (Stripe, M-Paisa, etc.)';
COMMENT ON COLUMN payments.receipt_number IS 'Generated receipt number for citizen records';

-- Disputes table
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    infringement_id UUID NOT NULL REFERENCES infringements(id) ON DELETE CASCADE,
    citizen_user_id UUID NOT NULL REFERENCES users(id),
    reason TEXT NOT NULL,
    status dispute_status NOT NULL DEFAULT 'open',
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by_user_id UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT disputes_reason_not_empty CHECK (LENGTH(TRIM(reason)) > 0),
    CONSTRAINT disputes_resolved_at_when_closed CHECK (
        status = 'open' OR resolved_at IS NOT NULL
    )
);

COMMENT ON TABLE disputes IS 'Citizen disputes for infringements';

-- Audit logs table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    diff JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT audit_logs_action_not_empty CHECK (LENGTH(TRIM(action)) > 0)
);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all system actions';
COMMENT ON COLUMN audit_logs.action IS 'Action type (e.g., INSERT, UPDATE, DELETE, LOGIN)';
COMMENT ON COLUMN audit_logs.diff IS 'JSON diff showing what changed';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_agency_id ON users(agency_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_driver_licence ON users(driver_licence_number) WHERE driver_licence_number IS NOT NULL;

-- Vehicles indexes
CREATE INDEX idx_vehicles_owner ON vehicles(owner_user_id);
CREATE INDEX idx_vehicles_reg_number_trgm ON vehicles USING gin(reg_number gin_trgm_ops);

-- Offences indexes
CREATE INDEX idx_offences_code ON offences(code);
CREATE INDEX idx_offences_category ON offences(category);
CREATE INDEX idx_offences_active ON offences(active) WHERE active = true;

-- Infringements indexes (critical for performance)
CREATE INDEX idx_infringements_vehicle_id ON infringements(vehicle_id);
CREATE INDEX idx_infringements_agency_status ON infringements(issuing_agency_id, status);
CREATE INDEX idx_infringements_officer ON infringements(officer_user_id);
CREATE INDEX idx_infringements_issued_at ON infringements(issued_at DESC);
CREATE INDEX idx_infringements_status ON infringements(status);
CREATE INDEX idx_infringements_driver_licence ON infringements(driver_licence_number) WHERE driver_licence_number IS NOT NULL;
CREATE INDEX idx_infringements_number ON infringements(infringement_number);
-- PostGIS spatial index
CREATE INDEX gist_infringements_location ON infringements USING GIST(location);

-- Payments indexes
CREATE INDEX idx_payments_infringement_id ON payments(infringement_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_ref ON payments(provider_ref) WHERE provider_ref IS NOT NULL;
CREATE INDEX idx_payments_receipt_number ON payments(receipt_number) WHERE receipt_number IS NOT NULL;
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC) WHERE paid_at IS NOT NULL;

-- Disputes indexes
CREATE INDEX idx_disputes_infringement_id ON disputes(infringement_id);
CREATE INDEX idx_disputes_citizen_user_id ON disputes(citizen_user_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER agencies_updated_at BEFORE UPDATE ON agencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER offences_updated_at BEFORE UPDATE ON offences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER infringements_updated_at BEFORE UPDATE ON infringements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER disputes_updated_at BEFORE UPDATE ON disputes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate infringement numbers
CREATE OR REPLACE FUNCTION generate_infringement_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    -- Get current year
    year_part := TO_CHAR(NEW.issued_at, 'YYYY');
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(infringement_number FROM 'INF-' || year_part || '-([0-9]+)') AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM infringements
    WHERE infringement_number LIKE 'INF-' || year_part || '-%';
    
    -- Generate new number
    new_number := 'INF-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
    
    NEW.infringement_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER infringements_generate_number BEFORE INSERT ON infringements
    FOR EACH ROW 
    WHEN (NEW.infringement_number IS NULL)
    EXECUTE FUNCTION generate_infringement_number();

-- Function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    new_number TEXT;
BEGIN
    IF NEW.status = 'success' AND NEW.receipt_number IS NULL THEN
        year_part := TO_CHAR(NOW(), 'YYYY');
        
        SELECT COALESCE(MAX(
            CAST(SUBSTRING(receipt_number FROM 'RCP-' || year_part || '-([0-9]+)') AS INTEGER)
        ), 0) + 1
        INTO sequence_num
        FROM payments
        WHERE receipt_number LIKE 'RCP-' || year_part || '-%';
        
        new_number := 'RCP-' || year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
        NEW.receipt_number := new_number;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payments_generate_receipt BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION generate_receipt_number();

-- Function to log audit trail
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    actor_id UUID;
    action_type TEXT;
BEGIN
    -- Get current user ID from session
    actor_id := auth.uid();
    
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'INSERT';
        INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, new_data)
        VALUES (actor_id, action_type, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'UPDATE';
        INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, old_data, new_data)
        VALUES (actor_id, action_type, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'DELETE';
        INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, old_data)
        VALUES (actor_id, action_type, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit logging to critical tables
CREATE TRIGGER infringements_audit AFTER INSERT OR UPDATE OR DELETE ON infringements
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER payments_audit AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER disputes_audit AFTER INSERT OR UPDATE OR DELETE ON disputes
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

CREATE TRIGGER users_audit AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offences ENABLE ROW LEVEL SECURITY;
ALTER TABLE infringements ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get current user's agency
CREATE OR REPLACE FUNCTION get_user_agency()
RETURNS UUID AS $$
    SELECT agency_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- AGENCIES POLICIES
-- ============================================================================

-- All authenticated users can view agencies
CREATE POLICY agencies_select_all ON agencies
    FOR SELECT
    TO authenticated
    USING (true);

-- Only central admins can modify agencies
CREATE POLICY agencies_insert_central_admin ON agencies
    FOR INSERT
    TO authenticated
    WITH CHECK (get_user_role() = 'central_admin');

CREATE POLICY agencies_update_central_admin ON agencies
    FOR UPDATE
    TO authenticated
    USING (get_user_role() = 'central_admin');

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY users_select_own ON users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Agency admins can view users in their agency
CREATE POLICY users_select_agency ON users
    FOR SELECT
    TO authenticated
    USING (
        get_user_role() IN ('agency_admin', 'central_admin') 
        AND (agency_id = get_user_agency() OR get_user_role() = 'central_admin')
    );

-- Users can update their own profile (limited fields)
CREATE POLICY users_update_own ON users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Agency admins can manage users in their agency
CREATE POLICY users_insert_agency_admin ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        get_user_role() IN ('agency_admin', 'central_admin')
        AND (agency_id = get_user_agency() OR get_user_role() = 'central_admin')
    );

-- ============================================================================
-- VEHICLES POLICIES
-- ============================================================================

-- Citizens can view their own vehicles
CREATE POLICY vehicles_select_own ON vehicles
    FOR SELECT
    TO authenticated
    USING (owner_user_id = auth.uid() OR get_user_role() != 'citizen');

-- Officers can view any vehicle (for infringement creation)
CREATE POLICY vehicles_select_officers ON vehicles
    FOR SELECT
    TO authenticated
    USING (get_user_role() IN ('officer', 'agency_admin', 'central_admin'));

-- Officers can create vehicle records
CREATE POLICY vehicles_insert_officers ON vehicles
    FOR INSERT
    TO authenticated
    WITH CHECK (get_user_role() IN ('officer', 'agency_admin', 'central_admin'));

-- ============================================================================
-- OFFENCES POLICIES
-- ============================================================================

-- All authenticated users can view active offences
CREATE POLICY offences_select_all ON offences
    FOR SELECT
    TO authenticated
    USING (active = true OR get_user_role() = 'central_admin');

-- Only central admins can manage offences catalog
CREATE POLICY offences_insert_central_admin ON offences
    FOR INSERT
    TO authenticated
    WITH CHECK (get_user_role() = 'central_admin');

CREATE POLICY offences_update_central_admin ON offences
    FOR UPDATE
    TO authenticated
    USING (get_user_role() = 'central_admin');

-- ============================================================================
-- INFRINGEMENTS POLICIES
-- ============================================================================

-- Citizens can view infringements linked to their vehicles or licence
CREATE POLICY infringements_select_citizen ON infringements
    FOR SELECT
    TO authenticated
    USING (
        get_user_role() = 'citizen' AND (
            vehicle_id IN (SELECT id FROM vehicles WHERE owner_user_id = auth.uid())
            OR driver_licence_number = (SELECT driver_licence_number FROM users WHERE id = auth.uid())
        )
    );

-- Officers can view infringements from their agency
CREATE POLICY infringements_select_officer ON infringements
    FOR SELECT
    TO authenticated
    USING (
        get_user_role() IN ('officer', 'agency_admin') 
        AND issuing_agency_id = get_user_agency()
    );

-- Central admins can view all infringements
CREATE POLICY infringements_select_central_admin ON infringements
    FOR SELECT
    TO authenticated
    USING (get_user_role() = 'central_admin');

-- Officers can create infringements for their agency
CREATE POLICY infringements_insert_officer ON infringements
    FOR INSERT
    TO authenticated
    WITH CHECK (
        get_user_role() IN ('officer', 'agency_admin')
        AND issuing_agency_id = get_user_agency()
        AND officer_user_id = auth.uid()
    );

-- Officers can void their agency's infringements (not paid ones)
CREATE POLICY infringements_update_officer ON infringements
    FOR UPDATE
    TO authenticated
    USING (
        get_user_role() IN ('officer', 'agency_admin')
        AND issuing_agency_id = get_user_agency()
        AND status != 'paid'
    )
    WITH CHECK (
        status IN ('issued', 'voided', 'disputed')
        AND issuing_agency_id = get_user_agency()
    );

-- ============================================================================
-- PAYMENTS POLICIES
-- ============================================================================

-- Citizens can view payments for their infringements
CREATE POLICY payments_select_citizen ON payments
    FOR SELECT
    TO authenticated
    USING (
        get_user_role() = 'citizen' AND (
            infringement_id IN (
                SELECT i.id FROM infringements i
                JOIN vehicles v ON i.vehicle_id = v.id
                WHERE v.owner_user_id = auth.uid()
            )
            OR paid_by_user_id = auth.uid()
        )
    );

-- Agency users can view payments for their agency's infringements
CREATE POLICY payments_select_agency ON payments
    FOR SELECT
    TO authenticated
    USING (
        get_user_role() IN ('officer', 'agency_admin') AND
        infringement_id IN (
            SELECT id FROM infringements WHERE issuing_agency_id = get_user_agency()
        )
    );

-- Central admins can view all payments
CREATE POLICY payments_select_central_admin ON payments
    FOR SELECT
    TO authenticated
    USING (get_user_role() = 'central_admin');

-- Citizens can create payments for their infringements
CREATE POLICY payments_insert_citizen ON payments
    FOR INSERT
    TO authenticated
    WITH CHECK (
        infringement_id IN (
            SELECT i.id FROM infringements i
            JOIN vehicles v ON i.vehicle_id = v.id
            WHERE v.owner_user_id = auth.uid() OR i.driver_licence_number = (
                SELECT driver_licence_number FROM users WHERE id = auth.uid()
            )
        )
    );

-- ============================================================================
-- DISPUTES POLICIES
-- ============================================================================

-- Citizens can view their own disputes
CREATE POLICY disputes_select_citizen ON disputes
    FOR SELECT
    TO authenticated
    USING (citizen_user_id = auth.uid() OR get_user_role() != 'citizen');

-- Agency users can view disputes for their agency's infringements
CREATE POLICY disputes_select_agency ON disputes
    FOR SELECT
    TO authenticated
    USING (
        get_user_role() IN ('agency_admin', 'central_admin') AND (
            infringement_id IN (
                SELECT id FROM infringements WHERE issuing_agency_id = get_user_agency()
            )
            OR get_user_role() = 'central_admin'
        )
    );

-- Citizens can create disputes for their infringements
CREATE POLICY disputes_insert_citizen ON disputes
    FOR INSERT
    TO authenticated
    WITH CHECK (
        get_user_role() = 'citizen' AND
        citizen_user_id = auth.uid() AND
        infringement_id IN (
            SELECT i.id FROM infringements i
            JOIN vehicles v ON i.vehicle_id = v.id
            WHERE v.owner_user_id = auth.uid() OR i.driver_licence_number = (
                SELECT driver_licence_number FROM users WHERE id = auth.uid()
            )
        )
    );

-- Agency admins can update disputes for their agency's infringements
CREATE POLICY disputes_update_agency ON disputes
    FOR UPDATE
    TO authenticated
    USING (
        get_user_role() IN ('agency_admin', 'central_admin') AND (
            infringement_id IN (
                SELECT id FROM infringements WHERE issuing_agency_id = get_user_agency()
            )
            OR get_user_role() = 'central_admin'
        )
    );

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Central admins can view all audit logs
CREATE POLICY audit_logs_select_central_admin ON audit_logs
    FOR SELECT
    TO authenticated
    USING (get_user_role() = 'central_admin');

-- Agency admins can view audit logs for their agency's entities
CREATE POLICY audit_logs_select_agency ON audit_logs
    FOR SELECT
    TO authenticated
    USING (
        get_user_role() = 'agency_admin' AND
        entity_id IN (
            SELECT id FROM infringements WHERE issuing_agency_id = get_user_agency()
        )
    );

-- Users can view their own actions in audit log
CREATE POLICY audit_logs_select_own ON audit_logs
    FOR SELECT
    TO authenticated
    USING (actor_user_id = auth.uid());

-- No one can modify audit logs (immutable)
-- INSERT is handled by trigger only

-- ============================================================================
-- SEED DATA (for development/testing)
-- ============================================================================

-- Insert sample agencies
INSERT INTO agencies (name, code) VALUES
    ('Fiji Police Force', 'POLICE'),
    ('Land Transport Authority', 'LTA'),
    ('Suva City Council', 'SUVA_CC'),
    ('Lautoka City Council', 'LAUTOKA_CC'),
    ('Nadi Town Council', 'NADI_TC')
ON CONFLICT (code) DO NOTHING;

-- Insert sample offences
INSERT INTO offences (code, description, base_fine_amount, category) VALUES
    ('SPD001', 'Speeding 1-20km/h over limit', 150.00, 'speeding'),
    ('SPD002', 'Speeding 21-40km/h over limit', 300.00, 'speeding'),
    ('SPD003', 'Speeding over 40km/h over limit', 500.00, 'speeding'),
    ('PARK001', 'Parking in no-parking zone', 50.00, 'parking'),
    ('PARK002', 'Parking in disabled zone without permit', 200.00, 'parking'),
    ('LIC001', 'Driving without valid license', 500.00, 'license'),
    ('LIC002', 'Expired vehicle registration', 150.00, 'license'),
    ('SAFE001', 'Not wearing seatbelt', 100.00, 'safety'),
    ('SAFE002', 'Using mobile phone while driving', 200.00, 'safety'),
    ('DUI001', 'Driving under influence', 1000.00, 'serious')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- VIEWS (for reporting and convenience)
-- ============================================================================

-- View: Active infringements with full details
CREATE OR REPLACE VIEW v_active_infringements AS
SELECT 
    i.id,
    i.infringement_number,
    i.status,
    i.issued_at,
    i.fine_amount,
    a.name AS agency_name,
    a.code AS agency_code,
    u.display_name AS officer_name,
    v.reg_number AS vehicle_reg,
    o.code AS offence_code,
    o.description AS offence_description,
    i.location_description,
    ST_X(i.location::geometry) AS longitude,
    ST_Y(i.location::geometry) AS latitude,
    CASE 
        WHEN EXISTS (SELECT 1 FROM payments p WHERE p.infringement_id = i.id AND p.status = 'success')
        THEN true ELSE false
    END AS is_paid
FROM infringements i
JOIN agencies a ON i.issuing_agency_id = a.id
JOIN users u ON i.officer_user_id = u.id
JOIN vehicles v ON i.vehicle_id = v.id
JOIN offences o ON i.offence_id = o.id
WHERE i.status IN ('issued', 'disputed');

COMMENT ON VIEW v_active_infringements IS 'Active infringements with denormalized details for reporting';

-- View: Payment summary by agency
CREATE OR REPLACE VIEW v_payment_summary_by_agency AS
SELECT 
    a.name AS agency_name,
    a.code AS agency_code,
    COUNT(DISTINCT i.id) AS total_infringements,
    COUNT(DISTINCT CASE WHEN p.status = 'success' THEN p.id END) AS paid_count,
    SUM(CASE WHEN p.status = 'success' THEN p.amount ELSE 0 END) AS total_collected,
    SUM(CASE WHEN i.status = 'issued' THEN i.fine_amount ELSE 0 END) AS outstanding_amount
FROM agencies a
LEFT JOIN infringements i ON a.id = i.issuing_agency_id
LEFT JOIN payments p ON i.id = p.infringement_id
GROUP BY a.id, a.name, a.code;

COMMENT ON VIEW v_payment_summary_by_agency IS 'Payment collection summary per agency';

-- ============================================================================
-- FUNCTIONS (for API convenience)
-- ============================================================================

-- Function: Search infringements by vehicle or licence
CREATE OR REPLACE FUNCTION search_infringements(
    p_vehicle_reg TEXT DEFAULT NULL,
    p_licence_number TEXT DEFAULT NULL,
    p_status infringement_status DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    infringement_number TEXT,
    status infringement_status,
    issued_at TIMESTAMPTZ,
    fine_amount NUMERIC,
    agency_name TEXT,
    vehicle_reg TEXT,
    offence_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.infringement_number,
        i.status,
        i.issued_at,
        i.fine_amount,
        a.name AS agency_name,
        v.reg_number AS vehicle_reg,
        o.description AS offence_description
    FROM infringements i
    JOIN agencies a ON i.issuing_agency_id = a.id
    JOIN vehicles v ON i.vehicle_id = v.id
    JOIN offences o ON i.offence_id = o.id
    WHERE 
        (p_vehicle_reg IS NULL OR v.reg_number = UPPER(p_vehicle_reg))
        AND (p_licence_number IS NULL OR i.driver_licence_number = p_licence_number)
        AND (p_status IS NULL OR i.status = p_status)
    ORDER BY i.issued_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_infringements TO authenticated;

-- ============================================================================
-- STORAGE BUCKETS (to be created in Supabase dashboard or via API)
-- ============================================================================

-- Create storage buckets for evidence and reports
-- These are created via Supabase Storage API or dashboard:
--
-- 1. Bucket: evidence (private)
--    - Officers can upload evidence for their agency's infringements
--    - RLS: Only officers from issuing_agency can upload
--    - Citizens cannot view evidence by default
--
-- 2. Bucket: reports (private)
--    - Agency admins and central admins can upload/download reports
--    - Time-limited signed URLs for downloads
--
-- Storage policies need to be configured in Supabase dashboard

-- ============================================================================
-- HELPFUL QUERIES FOR TESTING
-- ============================================================================

/*
-- Check schema version and extensions
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'postgis', 'pg_trgm');

-- Count records by table
SELECT 'agencies' AS table_name, COUNT(*) FROM agencies
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL SELECT 'offences', COUNT(*) FROM offences
UNION ALL SELECT 'infringements', COUNT(*) FROM infringements
UNION ALL SELECT 'payments', COUNT(*) FROM payments
UNION ALL SELECT 'disputes', COUNT(*) FROM disputes
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- Test PostGIS: create a sample location
SELECT ST_AsText(ST_GeographyFromText('POINT(-177.4415 -18.1416)')); -- Suva, Fiji

-- Test infringement search function
SELECT * FROM search_infringements(p_vehicle_reg => 'ABC123', p_limit => 10);

-- View payment summary
SELECT * FROM v_payment_summary_by_agency;
*/

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

/*
To apply this schema:

1. Create a new Supabase project
2. Enable PostGIS extension in SQL editor
3. Run this entire script in Supabase SQL editor
4. Configure Storage buckets (evidence, reports) in dashboard
5. Set up storage policies for officer/admin access
6. Configure Edge Functions for payments and sync
7. Test RLS policies with different user roles

For local development:
- Use Supabase CLI: supabase db reset
- Migrations: supabase/migrations/00001_initial_schema.sql

For production:
- Run migrations via Supabase CLI or dashboard
- Backup before applying schema changes
- Monitor performance and add indexes as needed
*/
