# 📊 Database Schema — MANTIS

## Agencies
- `id` (uuid, pk)
- `name` (text, unique)
- `created_at` (timestamptz)

## Users
- `id` (uuid, pk, references auth.users)
- `agency_id` (uuid, fk → agencies)
- `role` (enum: super_admin, agency_admin, officer)
- `position` (text)
- `location_id` (uuid, fk → locations)
- `created_at` (timestamptz)

## Locations
- `id` (uuid, pk)
- `agency_id` (uuid, fk → agencies)
- `type` (enum: division, station, post, region, office, council, department, zone)
- `name` (text)
- `parent_id` (uuid, fk → locations)
- `created_at` (timestamptz)

## Teams
- `id` (uuid, pk)
- `agency_id` (uuid, fk → agencies)
- `name` (text)
- `created_at` (timestamptz)

## Routes
- `id` (uuid, pk)
- `agency_id` (uuid, fk → agencies)
- `name` (text)
- `description` (text)
- `location_id` (uuid, fk → locations)
- `created_at` (timestamptz)

## Team Assignments
- `team_routes(team_id, route_id)`
- `team_members(team_id, user_id)`

## Infringement Categories
- `id` (uuid, pk)
- `name` (text, unique)
- `description` (text)
- `created_at` (timestamptz)

## Infringement Types
- `id` (uuid, pk)
- `category_id` (uuid, fk → infringement_categories)
- `code` (text, unique)
- `name` (text)
- `description` (text)
- `fine_amount` (numeric)
- `demerit_points` (int)
- `gl_code` (text, not null)
- `created_at` (timestamptz)

## Infringements
- `id` (uuid, pk)
- `officer_id` (uuid, fk → users)
- `agency_id` (uuid, fk → agencies)
- `team_id` (uuid, fk → teams)
- `route_id` (uuid, fk → routes)
- `type_id` (uuid, fk → infringement_types)
- `vehicle_id` (text)
- `location_id` (uuid, fk → locations)
- `notes` (text)
- `issued_at` (timestamptz)
- `created_at` (timestamptz)

## Notes
- All web UI components should follow the **shadcn/ui** design system with the blue + zinc palette.
- Mobile UI should mirror the same palette and typography system for consistency.