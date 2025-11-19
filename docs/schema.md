# 📊 Database Schema — MANTIS

Complete database schema across 6 migrations with 17 core tables.

---

## Migration 001: Core Tables

### Agencies
- `id` (uuid, pk)
- `name` (text, unique)
- `created_at` (timestamptz)

### Locations
- `id` (uuid, pk)
- `agency_id` (uuid, fk → agencies)
- `type` (enum: division, station, post, region, office, council, department, zone)
- `name` (text)
- `parent_id` (uuid, fk → locations)
- `created_at` (timestamptz)

### Users
- `id` (uuid, pk, references auth.users)
- `agency_id` (uuid, fk → agencies)
- `role` (enum: super_admin, agency_admin, officer)
- `position` (text)
- `location_id` (uuid, fk → locations)
- `created_at` (timestamptz)

### Teams
- `id` (uuid, pk)
- `agency_id` (uuid, fk → agencies)
- `name` (text)
- `leader_id` (uuid, fk → users)
- `created_at` (timestamptz)

### Routes
- `id` (uuid, pk)
- `agency_id` (uuid, fk → agencies)
- `name` (text)
- `description` (text)
- `start_location_id` (uuid, fk → locations)
- `end_location_id` (uuid, fk → locations)
- `created_at` (timestamptz)

### Route Waypoints
- `id` (uuid, pk)
- `route_id` (uuid, fk → routes)
- `sequence` (int)
- `name` (text)
- `latitude` (numeric)
- `longitude` (numeric)
- `notes` (text)
- `created_at` (timestamptz)

### Team Members (Junction)
- `team_id` (uuid, fk → teams, pk)
- `user_id` (uuid, fk → users, pk)
- `joined_at` (timestamptz)

### Team Routes (Junction)
- `team_id` (uuid, fk → teams, pk)
- `route_id` (uuid, fk → routes, pk)
- `assigned_at` (timestamptz)

---

## Migration 002: Infringements

### Infringement Categories
- `id` (uuid, pk)
- `name` (text, unique)
- `description` (text)
- `created_at` (timestamptz)

### Infringement Types
- `id` (uuid, pk)
- `category_id` (uuid, fk → infringement_categories)
- `code` (text, unique)
- `name` (text)
- `description` (text)
- `fine_amount` (numeric)
- `demerit_points` (int)
- `gl_code` (text, not null)
- `created_at` (timestamptz)

### Infringements
- `id` (uuid, pk)
- `officer_id` (uuid, fk → users)
- `agency_id` (uuid, fk → agencies)
- `team_id` (uuid, fk → teams)
- `route_id` (uuid, fk → routes)
- `type_id` (uuid, fk → infringement_types)
- `vehicle_id` (text)
- `latitude` (numeric)
- `longitude` (numeric)
- `notes` (text)
- `issued_at` (timestamptz)
- `created_at` (timestamptz)

### Evidence Photos
- `id` (uuid, pk)
- `infringement_id` (uuid, fk → infringements)
- `storage_path` (text)
- `uploaded_by` (uuid, fk → users)
- `uploaded_at` (timestamptz)
- `created_at` (timestamptz)

---

## Migration 003: Payments & Finance

### Payments
- `id` (uuid, pk)
- `infringement_id` (uuid, fk → infringements)
- `amount` (numeric)
- `payment_method` (enum: cash, card, bank_transfer, mobile_money, stripe, paypal)
- `payment_status` (enum: pending, completed, failed, refunded)
- `transaction_id` (text, unique)
- `receipt_number` (text, unique)
- `paid_at` (timestamptz)
- `processed_by` (uuid, fk → users)
- `notes` (text)
- `created_at` (timestamptz)

### Payment Reminders
- `id` (uuid, pk)
- `infringement_id` (uuid, fk → infringements)
- `reminder_type` (enum: sms, email, letter)
- `sent_at` (timestamptz)
- `status` (enum: sent, failed, bounced)
- `created_at` (timestamptz)

---

## Migration 004: GPS Tracking

### GPS Tracking
- `id` (uuid, pk)
- `user_id` (uuid, fk → users)
- `latitude` (numeric)
- `longitude` (numeric)
- `accuracy` (numeric)
- `altitude` (numeric)
- `speed` (numeric)
- `heading` (numeric)
- `location` (geography, point) - PostGIS geometry
- `tracked_at` (timestamptz)
- `created_at` (timestamptz)

**Indexes:**
- Spatial index on `location` (GIST)
- Index on `user_id, tracked_at`

---

## Migration 005: Notifications & Audit

### Notifications
- `id` (uuid, pk)
- `user_id` (uuid, fk → users)
- `title` (text)
- `message` (text)
- `type` (enum: info, warning, error, success)
- `category` (enum: infringement, payment, system, team, route)
- `related_id` (uuid)
- `is_read` (boolean)
- `read_at` (timestamptz)
- `created_at` (timestamptz)

### Audit Logs
- `id` (uuid, pk)
- `user_id` (uuid, fk → users)
- `action` (text)
- `table_name` (text)
- `record_id` (uuid)
- `old_data` (jsonb)
- `new_data` (jsonb)
- `created_at` (timestamptz)

---

## Migration 006: Auth & Triggers

### Functions & Triggers
- `handle_new_user()` - Auto-creates user profile on auth signup
- `update_updated_at_column()` - Auto-updates timestamps
- `update_gps_location()` - Auto-populates PostGIS geometry from lat/lng

### Auth Sync
- Trigger on `auth.users` INSERT → creates `public.users` profile
- Default role: 'officer'

---

## Summary Statistics

- **Total Tables**: 17
- **Core Tables**: 8 (agencies, users, locations, teams, routes, etc.)
- **Junction Tables**: 2 (team_members, team_routes)
- **Feature Tables**: 7 (infringements, payments, gps_tracking, etc.)
- **Row-Level Security**: Enabled on all tables
- **PostGIS**: Enabled for spatial queries
- **Indexes**: 30+ for optimized queries

---

## Notes

- Web UI uses **Leaflet.js** for mapping (web portal)
- Mobile UI uses **React Native Maps** with Google Maps provider
- All tables have RLS policies for multi-tenant security
- PostGIS handles spatial queries for GPS tracking
- Automatic user profile creation on signup
- Comprehensive audit logging for compliance