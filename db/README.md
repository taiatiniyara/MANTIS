# Database Setup Guide

## 📁 Directory Structure

```
db/
├── complete-database-setup.sql    # Initial setup: agencies, locations, users
├── migrations/                     # Schema migrations (run in order)
└── seeds/
    └── dummy_data.sql             # Test data for all tables
```

## 🚀 Setup Instructions

### 1. Run Migrations (In Order)

Run all migrations in the `migrations/` folder in numerical order:

```
001_init.sql                    # Core tables (agencies, users, teams, routes, infringements)
002_finance_reports.sql         # Finance reporting views
003_rls_policies.sql           # Row Level Security policies
004_audit_logging.sql          # Audit log system
004_data_archiving.sql         # Data archiving system
004_sync_auth_users.sql        # Auth user sync triggers
005_admin_sync_function.sql    # Admin sync functions
005_notifications.sql          # Notifications system
006_payments.sql               # Payment processing
007_documents.sql              # Document management
008_integrations.sql           # API & webhook integrations
009_auto_create_users.sql      # Auto-create user profiles
010_sync_existing_users.sql    # Sync existing auth users
013_add_team_leader.sql        # Team leader support
014_gis_integration.sql        # GIS & GPS tracking
015_storage_buckets.sql        # File storage buckets
016_route_waypoints.sql        # Route waypoints table
017_route_polygon_areas.sql    # Polygon coverage areas
```

### 2. Initial Setup

After migrations, run:

```sql
-- Creates agencies, locations, and syncs auth.users to public.users
\i db/complete-database-setup.sql
```

### 3. Load Dummy Data (Optional)

For testing/development:

```sql
-- Creates teams, routes, infringements, payments, notifications, etc.
\i db/seeds/dummy_data.sql
```

## 📊 What Gets Created

### Initial Setup
- **6 Agencies**: FPF, LTA, Suva Council, Lautoka Council, Nadi Council, Labasa Council
- **7 Locations**: Police divisions and LTA regions
- **Users**: Syncs all auth.users to public.users with roles

### Dummy Data
- **10 Teams** across agencies
- **9 Routes** with GPS coordinates
- **6 Infringement Categories**
- **35+ Infringement Types** (traffic, parking, safety, etc.)
- **~48 Infringements** with realistic data
- **Payments** (60% completed, 30% pending)
- **Payment Reminders** for unpaid fines
- **Notifications** for users

## 🔒 Row Level Security (RLS)

Both setup scripts automatically:
1. **Disable RLS** on all tables before inserting data
2. **Re-enable RLS** after data insertion

This ensures data can be seeded without permission errors.

## ⚠️ Important Notes

1. **Run migrations first** - The setup and seed scripts depend on tables existing
2. **Auth users must exist** - Create users in Supabase Auth before running complete-database-setup.sql
3. **RLS is automatic** - Scripts handle RLS enable/disable automatically
4. **Idempotent** - Safe to run multiple times (uses ON CONFLICT DO NOTHING/UPDATE)

## 🧪 Testing

After setup, verify data:

```sql
-- Check record counts
SELECT 'Agencies' as table, COUNT(*) FROM agencies
UNION ALL SELECT 'Users', COUNT(*) FROM users
UNION ALL SELECT 'Teams', COUNT(*) FROM teams
UNION ALL SELECT 'Routes', COUNT(*) FROM routes
UNION ALL SELECT 'Infringements', COUNT(*) FROM infringements;
```

## 🗑️ Removed Files

The following files have been removed as they were temporary fixes:
- All emergency/diagnostic scripts
- Old seed files (001_seed.sql, 002_users_seed.sql)
- Fix migrations (011_fix_rls_profiles.sql, 012_disable_rls.sql, 016_route_waypoints_fix.sql)
