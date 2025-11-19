# 📊 Database Migrations Reference

**Version**: 1.0.0 | **Last Updated**: November 20, 2025

This document provides a complete reference of all database migrations in MANTIS.

---

## Migration Overview

MANTIS uses **6 sequential migrations** that create **17 core tables** with full Row-Level Security (RLS) policies.

| Migration | File | Tables Created | Purpose |
|-----------|------|----------------|---------|
| 001 | `20241119000001_init_core_tables.sql` | 8 tables | Core system tables |
| 002 | `20241119000002_infringements.sql` | 4 tables | Infringement system |
| 003 | `20241119000003_payments_finance.sql` | 2 tables | Payment processing |
| 004 | `20241119000004_gps_tracking.sql` | 1 table | GPS tracking with PostGIS |
| 005 | `20241119000005_notifications_storage.sql` | 2 tables | Notifications & audit logs |
| 006 | `20241119000006_auth_sync_triggers.sql` | 0 tables | Functions & triggers |

**Total**: 17 tables, 30+ indexes, 50+ RLS policies

---

## Migration 001: Core Tables

**File**: `20241119000001_init_core_tables.sql`  
**Purpose**: Foundation tables for multi-agency management

### Tables Created

#### 1. `agencies`
Top-level agency entities (Police, LTA, Councils)
```sql
- id (uuid, pk)
- name (text, unique)
- created_at (timestamptz)
```

#### 2. `locations`
Hierarchical location model with agency support
```sql
- id (uuid, pk)
- agency_id (uuid, fk → agencies)
- type (enum: division, station, post, region, office, council, department, zone)
- name (text)
- parent_id (uuid, fk → locations, self-reference)
- created_at (timestamptz)
```

#### 3. `users`
User profiles linked to auth.users
```sql
- id (uuid, pk, fk → auth.users)
- agency_id (uuid, fk → agencies)
- role (enum: super_admin, agency_admin, officer)
- position (text)
- location_id (uuid, fk → locations)
- created_at (timestamptz)
```

#### 4. `teams`
Enforcement teams within agencies
```sql
- id (uuid, pk)
- agency_id (uuid, fk → agencies)
- name (text)
- leader_id (uuid, fk → users)
- created_at (timestamptz)
```

#### 5. `routes`
Patrol routes with start/end locations
```sql
- id (uuid, pk)
- agency_id (uuid, fk → agencies)
- name (text)
- description (text)
- start_location_id (uuid, fk → locations)
- end_location_id (uuid, fk → locations)
- created_at (timestamptz)
```

#### 6. `route_waypoints`
GPS waypoints for route planning
```sql
- id (uuid, pk)
- route_id (uuid, fk → routes)
- sequence (int)
- name (text)
- latitude (numeric(10,8))
- longitude (numeric(11,8))
- notes (text)
- created_at (timestamptz)
```

#### 7. `team_members` (Junction)
Many-to-many: teams ↔ users
```sql
- team_id (uuid, pk, fk → teams)
- user_id (uuid, pk, fk → users)
- joined_at (timestamptz)
```

#### 8. `team_routes` (Junction)
Many-to-many: teams ↔ routes
```sql
- team_id (uuid, pk, fk → teams)
- route_id (uuid, pk, fk → routes)
- assigned_at (timestamptz)
```

---

## Migration 002: Infringements

**File**: `20241119000002_infringements.sql`  
**Purpose**: Traffic infringement recording and management

### Tables Created

#### 1. `infringement_categories`
Broad violation categories (Speeding, Parking, etc.)
```sql
- id (uuid, pk)
- name (text, unique)
- description (text)
- created_at (timestamptz)
```

#### 2. `infringement_types`
Specific violation types with fines
```sql
- id (uuid, pk)
- category_id (uuid, fk → infringement_categories)
- code (text, unique)
- name (text)
- description (text)
- fine_amount (numeric(10,2))
- demerit_points (int)
- gl_code (text, not null)
- created_at (timestamptz)
```

#### 3. `infringements`
Individual infringement records
```sql
- id (uuid, pk)
- officer_id (uuid, fk → users)
- agency_id (uuid, fk → agencies)
- team_id (uuid, fk → teams)
- route_id (uuid, fk → routes)
- type_id (uuid, fk → infringement_types)
- vehicle_id (text)
- latitude (numeric(10,8))
- longitude (numeric(11,8))
- notes (text)
- issued_at (timestamptz)
- created_at (timestamptz)
```

#### 4. `evidence_photos`
Photo evidence linked to infringements
```sql
- id (uuid, pk)
- infringement_id (uuid, fk → infringements)
- storage_path (text)
- uploaded_by (uuid, fk → users)
- uploaded_at (timestamptz)
- created_at (timestamptz)
```

---

## Migration 003: Payments & Finance

**File**: `20241119000003_payments_finance.sql`  
**Purpose**: Payment processing and financial tracking

### Tables Created

#### 1. `payments`
Payment records for infringements
```sql
- id (uuid, pk)
- infringement_id (uuid, fk → infringements)
- amount (numeric(10,2))
- payment_method (enum: cash, card, bank_transfer, mobile_money, stripe, paypal)
- payment_status (enum: pending, completed, failed, refunded)
- transaction_id (text, unique)
- receipt_number (text, unique)
- paid_at (timestamptz)
- processed_by (uuid, fk → users)
- notes (text)
- created_at (timestamptz)
```

#### 2. `payment_reminders`
Payment reminder history
```sql
- id (uuid, pk)
- infringement_id (uuid, fk → infringements)
- reminder_type (enum: sms, email, letter)
- sent_at (timestamptz)
- status (enum: sent, failed, bounced)
- created_at (timestamptz)
```

---

## Migration 004: GPS Tracking

**File**: `20241119000004_gps_tracking.sql`  
**Purpose**: Real-time GPS tracking with PostGIS spatial queries

### Extensions Enabled
- `postgis` - Spatial database extension

### Tables Created

#### 1. `gps_tracking`
Officer location tracking with PostGIS geometry
```sql
- id (uuid, pk)
- user_id (uuid, fk → users)
- latitude (numeric(10,8))
- longitude (numeric(11,8))
- accuracy (numeric(10,2))
- altitude (numeric(10,2))
- speed (numeric(10,2))
- heading (numeric(5,2))
- location (geography(point, 4326)) -- PostGIS geometry column
- tracked_at (timestamptz)
- created_at (timestamptz)
```

### Functions & Triggers
- `update_gps_location()` - Auto-populates PostGIS geometry from lat/lng
- Trigger on INSERT/UPDATE to maintain geometry column

### Spatial Indexes
- GIST index on `location` column for fast spatial queries
- Composite index on `user_id, tracked_at DESC`

---

## Migration 005: Notifications & Storage

**File**: `20241119000005_notifications_storage.sql`  
**Purpose**: User notifications and audit logging

### Tables Created

#### 1. `notifications`
User notification system
```sql
- id (uuid, pk)
- user_id (uuid, fk → users)
- title (text)
- message (text)
- type (enum: info, warning, error, success)
- category (enum: infringement, payment, system, team, route)
- related_id (uuid)
- is_read (boolean)
- read_at (timestamptz)
- created_at (timestamptz)
```

#### 2. `audit_logs`
System audit trail
```sql
- id (uuid, pk)
- user_id (uuid, fk → users)
- action (text)
- table_name (text)
- record_id (uuid)
- old_data (jsonb)
- new_data (jsonb)
- created_at (timestamptz)
```

### Storage Buckets
Migration includes SQL to configure Supabase storage buckets:
- `evidence-photos` (public)
- `documents` (private)
- `profile-photos` (public)

---

## Migration 006: Auth Sync & Triggers

**File**: `20241119000006_auth_sync_triggers.sql`  
**Purpose**: Automatic user profile creation and maintenance

### Functions Created

#### 1. `handle_new_user()`
Auto-creates user profile when auth user signs up
- Trigger: `on_auth_user_created` on `auth.users` INSERT
- Default role: `officer`
- Creates entry in `public.users` table

#### 2. `update_updated_at_column()`
Generic function for timestamp updates
- Can be used for any table with `updated_at` column

### Initial Data Sync
- Syncs any existing `auth.users` to `public.users`
- Prevents duplicate entries with conflict resolution

---

## Applying Migrations

### All at Once
```bash
supabase db push
```

### Individually (in order)
```bash
supabase migration up 20241119000001_init_core_tables.sql
supabase migration up 20241119000002_infringements.sql
supabase migration up 20241119000003_payments_finance.sql
supabase migration up 20241119000004_gps_tracking.sql
supabase migration up 20241119000005_notifications_storage.sql
supabase migration up 20241119000006_auth_sync_triggers.sql
```

---

## Row-Level Security (RLS)

All tables have RLS enabled with policies for:

### Super Admin
- Full access to all tables and agencies

### Agency Admin
- CRUD within their agency only
- Cannot access other agencies' data

### Officer
- Can create infringements
- Can view own records
- Limited update capabilities

### Policy Examples
```sql
-- Super admins can do everything
create policy "Super admins have full access"
  on public.infringements for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

-- Officers can view their own infringements
create policy "Officers can view own infringements"
  on public.infringements for select
  using (auth.uid() = officer_id);
```

---

## Database Statistics

| Metric | Count |
|--------|-------|
| **Total Migrations** | 6 |
| **Total Tables** | 17 |
| **Junction Tables** | 2 |
| **Indexes** | 30+ |
| **RLS Policies** | 50+ |
| **Functions** | 3 |
| **Triggers** | 2 |
| **Extensions** | 3 (uuid-ossp, pgcrypto, postgis) |

---

## See Also

- [schema.md](./schema.md) - Detailed schema documentation
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Setup instructions
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment

---

**Last Updated**: November 20, 2025
