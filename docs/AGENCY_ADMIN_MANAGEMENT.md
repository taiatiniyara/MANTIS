# Agency Admin Management Capabilities

## Overview
Agency admins now have full capabilities to create and manage teams, routes, and locations within their agency through the MANTIS web application.

## Access URLs

### Agency Admin Dashboard
- **Base URL**: `/protected`
- **Teams Management**: `/protected/teams`
- **Routes Management**: `/protected/routes`
- **Locations Management**: `/protected/locations`
- **Users Management**: `/protected/users`

## Features Enabled

### 1. Teams Management (`/protected/teams`)

#### Capabilities
- ✅ **View** all teams in their agency
- ✅ **Create** new teams
- ✅ **Edit** existing teams
- ✅ **Delete** teams
- ✅ **Manage team members** (add/remove officers)
- ✅ **Assign routes** to teams

#### Create Team
- Click the "Create Team" button in the top-right corner
- Enter team name (e.g., "Alpha Team", "Night Patrol")
- Team is automatically assigned to the admin's agency
- Successfully created teams appear in the teams table

#### Team Actions
Each team has action buttons:
- 👥 **Manage Members** - Add or remove officers from the team
- 🛣️ **Manage Routes** - Assign patrol routes to the team
- ✏️ **Edit** - Update team name or details
- 🗑️ **Delete** - Remove the team (if empty)

---

### 2. Routes Management (`/protected/routes`)

#### Capabilities
- ✅ **View** all routes in their agency
- ✅ **Create** new patrol routes
- ✅ **Edit** existing routes
- ✅ **Delete** routes
- ✅ **Assign locations** to routes

#### Create Route
- Click the "Create Route" button in the top-right corner
- Enter route details:
  - Route name (e.g., "Downtown Patrol", "Highway A1")
  - Description (optional)
  - Select start location from agency's locations
  - Select end location (optional)
- Route is automatically assigned to the admin's agency

#### Route Fields
- **Name**: Descriptive name for the route
- **Description**: Additional details about the route
- **Location**: Primary location associated with the route
- **Agency**: Automatically set to the admin's agency

---

### 3. Locations Management (`/protected/locations`)

#### Capabilities
- ✅ **View** all locations in their agency
- ✅ **Create** new locations
- ✅ **Edit** existing locations
- ✅ **Delete** locations
- ✅ **Set parent locations** (hierarchical structure)

#### Create Location
- Click the "Create Location" button in the top-right corner
- Enter location details:
  - Name (e.g., "Central Division", "Station A")
  - Type: Select from dropdown
    - Division
    - Station
    - Post
    - Region
    - Office
    - Council
    - Department
    - Zone
  - Parent Location (optional) - for hierarchical organization
  - Address, Latitude, Longitude (optional - for GIS integration)
- Location is automatically assigned to the admin's agency

#### Location Types
Different location types support organizational hierarchy:
- **Division** → Station → Post
- **Region** → Office
- **Council** → Department → Zone

---

## Database Permissions (RLS Policies)

### Teams Policies
```sql
-- Agency admins can view teams in their agency
-- Agency admins can insert teams in their agency
-- Agency admins can update teams in their agency
-- Agency admins can delete teams in their agency
```

### Routes Policies
```sql
-- Agency admins can view routes in their agency
-- Agency admins can insert routes in their agency
-- Agency admins can update routes in their agency
-- Agency admins can delete routes in their agency
```

### Locations Policies
```sql
-- Agency admins can view locations in their agency
-- Agency admins can insert locations in their agency
-- Agency admins can update locations in their agency
```

All policies enforce:
1. Users can only access data from their own agency
2. Only agency_admin role can create/modify data
3. Automatic filtering by `agency_id`

---

## Navigation

Agency admins see a **Management** section in the sidebar with:
- 👥 **Users** - Manage agency users
- 👥 **Teams** - Manage patrol teams
- 🛣️ **Routes** - Manage patrol routes
- 📍 **Locations** - Manage locations/stations

All menu items are color-coded in purple for the Management section.

---

## User Flow Examples

### Creating a New Patrol Team
1. Navigate to `/protected/teams`
2. Click "Create Team" button
3. Enter team name: "Alpha Team"
4. Submit form
5. Team appears in the table
6. Click "Manage Members" icon to add officers
7. Click "Manage Routes" icon to assign patrol routes

### Setting Up a Route
1. Navigate to `/protected/routes`
2. First ensure locations exist (go to `/protected/locations` if needed)
3. Click "Create Route" button
4. Enter:
   - Name: "Downtown Patrol"
   - Description: "Daily patrol of downtown area"
   - Location: Select "Central Division"
5. Submit form
6. Route appears in the table
7. Assign route to teams via `/protected/teams` → Manage Routes

### Organizing Locations Hierarchically
1. Navigate to `/protected/locations`
2. Create parent location:
   - Name: "Central Division"
   - Type: "Division"
3. Create child location:
   - Name: "Station A"
   - Type: "Station"
   - Parent: "Central Division"
4. Create sub-location:
   - Name: "Post 1"
   - Type: "Post"
   - Parent: "Station A"

---

## Technical Implementation

### Files Modified
1. **`web/app/protected/teams/page.tsx`**
   - Added `CreateTeamDialog` component
   - Reorganized layout with action buttons in header

2. **`web/app/protected/routes/page.tsx`**
   - Added `CreateRouteDialog` component
   - Added imports for Button and icons
   - Reorganized layout with action buttons in header

3. **`web/app/protected/locations/page.tsx`**
   - Added `CreateLocationDialog` component
   - Reorganized layout with action buttons in header

### Components Used
All components already existed and are shared with super admin interface:
- `CreateTeamDialog` - Team creation form
- `CreateRouteDialog` - Route creation form
- `CreateLocationDialog` - Location creation form
- `TeamsTable` - Teams list with actions
- `RoutesTable` - Routes list with actions
- `LocationsTable` - Locations list with actions

### Data Scoping
All queries automatically filter by the user's `agency_id`:
```typescript
.eq("agency_id", currentUser.agency_id)
```

This ensures agency admins only see and manage their own agency's data.

---

## Testing

### Test as Agency Admin
1. Login with agency admin credentials:
   - Email: `fpf.admin@mantis.gov.fj`
   - Password: `Password123!`

2. Verify access to:
   - Dashboard: `/protected`
   - Teams: `/protected/teams`
   - Routes: `/protected/routes`
   - Locations: `/protected/locations`

3. Test creating:
   - A new team
   - A new route (requires locations first)
   - A new location

4. Test editing and deleting created items

5. Verify data isolation:
   - Create second agency admin login
   - Verify they cannot see each other's data

---

## Security Notes

✅ **Row Level Security (RLS)** is enabled on all tables
✅ **Agency isolation** enforced at database level
✅ **Role-based access control** prevents unauthorized access
✅ **Super admin oversight** - super admins can see all agencies' data
✅ **No cross-agency data access** - agency admins are restricted to their agency

---

## Future Enhancements

Potential additions:
- [ ] Bulk import teams/routes/locations via CSV
- [ ] Team performance analytics
- [ ] Route optimization suggestions
- [ ] GIS map view for routes and locations
- [ ] Team scheduling and shift management
- [ ] Route assignment conflicts detection
- [ ] Mobile app synchronization for field officers

---

## Support

For issues or questions:
1. Check database RLS policies are enabled
2. Verify user role is `agency_admin`
3. Ensure user has an `agency_id` assigned
4. Check browser console for error messages
5. Review Supabase logs for permission issues

---

*Last Updated: October 22, 2025*
*MANTIS - Multi-Agency Network Traffic Infringement System*
