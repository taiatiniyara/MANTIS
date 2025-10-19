# 🗺️ MANTIS Web App - User Journeys

**Last Updated**: October 19, 2025  
**Version**: 1.0.0

This document outlines the complete user journeys for all roles in the MANTIS web application, from first visit to advanced operations.

---

## 📋 Table of Contents

1. [Public User Journey](#1-public-user-journey)
2. [Super Admin Journey](#2-super-admin-journey)
3. [Agency Admin Journey](#3-agency-admin-journey)
4. [Officer Journey](#4-officer-journey)
5. [Navigation Structure](#5-navigation-structure)
6. [Page Inventory](#6-page-inventory)

---

## 1. Public User Journey

### 1.1 Home Page (`/`)

**First Visit - Unauthenticated User**

#### Visual Elements
- **Navigation Bar**:
  - Logo: "MANTIS" or agency logo
  - Right side: "Sign In" button
- **Hero Section**:
  - Large heading: "Municipal & Traffic Infringement System"
  - Subheading: "Unified traffic enforcement across Fiji"
  - Call-to-action: "Get Started" → redirects to `/auth/login`
- **Feature Highlights**:
  - Multi-agency support (Police, LTA, Councils)
  - Real-time tracking and analytics
  - Mobile officer app
  - Payment integration
- **Footer**:
  - Powered by Supabase
  - Links to documentation
  - Contact information

#### User Actions
1. **Click "Sign In"** → Navigate to `/auth/login`
2. **Click "Get Started"** → Navigate to `/auth/login`
3. **Browse features** → Scroll through marketing content
4. **View documentation** → Navigate to public docs (if available)

---

### 1.2 Authentication Flow

#### Login Page (`/auth/login`)

**Visual Elements**:
- Clean form with MANTIS branding
- Email and password fields
- "Remember me" checkbox
- "Sign In" button (blue, prominent)
- "Forgot password?" link
- "Don't have an account? Sign up" link

**User Actions**:
1. **Enter credentials** → Input email and password
2. **Click "Sign In"**:
   - ✅ **Success**: Redirect based on role
     - Super Admin → `/admin`
     - Agency Admin → `/protected`
     - Officer → `/protected`
   - ❌ **Error**: Show error message, remain on page
3. **Click "Forgot password?"** → Navigate to `/auth/forgot-password`
4. **Click "Sign up"** → Navigate to `/auth/sign-up`

#### Sign Up Page (`/auth/sign-up`)

**Visual Elements**:
- Registration form with fields:
  - Full name
  - Email address
  - Password (with strength indicator)
  - Confirm password
  - Agency selection dropdown
  - Position/Role
- Terms and conditions checkbox
- "Create Account" button

**User Actions**:
1. **Fill out form** → Enter all required information
2. **Select agency** → Choose from dropdown
3. **Click "Create Account"**:
   - ✅ **Success**: Redirect to `/auth/sign-up-success`
   - ❌ **Error**: Show validation errors
4. **Verify email** → Check inbox for confirmation link
5. **Click confirmation link** → Navigate to `/auth/confirm`

#### Forgot Password (`/auth/forgot-password`)

**Visual Elements**:
- Simple form with email field
- "Send Reset Link" button
- Back to login link

**User Actions**:
1. **Enter email** → Input registered email
2. **Click "Send Reset Link"**:
   - ✅ **Success**: Show confirmation message
   - Check email for reset link
3. **Click reset link** → Navigate to `/auth/update-password`
4. **Enter new password** → Set new password
5. **Submit** → Redirect to `/auth/login`

---

## 2. Super Admin Journey

### 2.1 Admin Dashboard (`/admin`)

**Landing Page After Login**

#### Visual Layout
- **Top Navigation**:
  - MANTIS logo (clickable → home)
  - Search bar (global search)
  - Notifications bell icon (with badge)
  - User profile dropdown (settings, logout)
  
- **Sidebar** (persistent across all admin pages):
  - 📊 Dashboard
  - 🏢 Agencies
  - 👥 Users
  - 👨‍👩‍👧‍👦 Teams
  - 🚗 Routes
  - 📍 Locations
  - 🚨 Infringements
  - 📋 Categories
  - 🏷️ Types
  - 💰 Payments
  - 📊 Analytics
  - 📊 Advanced Analytics
  - 📄 Reports
  - 🔗 Integrations
  - 📄 Documents
  - 🔔 Notifications
  - 📝 Audit Logs
  - 🗄️ Data Management

#### Dashboard Overview
1. **Summary Statistics** (4 cards):
   - Total Infringements (with today's count)
   - Active Agencies
   - System Users (with officer count)
   - This Month's Infringements

2. **Additional Stats** (4 smaller cards):
   - Teams count
   - Routes count
   - Locations count
   - Categories count

3. **Recent Activity Card**:
   - Latest system events (create, update, delete)
   - User actions with timestamps
   - Limited to 15 most recent events

4. **Quick Actions Card**:
   - Manage Agencies
   - Manage Users
   - View Infringements
   - Analytics Dashboard

5. **Recent Infringements Card**:
   - Last 5 infringements
   - Type, officer, agency, date
   - "View all" link → `/admin/infringements`

6. **System Health Card**:
   - Database status
   - API services status
   - Background jobs status
   - Uptime percentage
   - Average response time

#### User Actions from Dashboard
1. **Click any stat card** → Navigate to relevant page
2. **Click quick action** → Navigate to management page
3. **View recent activity** → See audit log details
4. **Check system health** → Monitor system status
5. **Search globally** → Find infringements, users, agencies

---

### 2.2 Agency Management (`/admin/agencies`)

#### Journey: Create New Agency

**Step 1: View Agencies List**
- Table showing all agencies:
  - Agency name
  - Type (Police, LTA, Council)
  - Number of users
  - Status (active/inactive)
  - Actions (view, edit, delete)
- "Create Agency" button (top right)

**Step 2: Click "Create Agency"**
- Modal/dialog opens with form:
  - Agency name (required)
  - Agency type dropdown (Police/LTA/Council)
  - Description (optional)
  - Status toggle (active/inactive)
  - GL code (for finance)
  - Contact information
  - Address details

**Step 3: Fill Out Form**
- Enter all required information
- Select agency type (changes available fields)
- Add contact details

**Step 4: Submit**
- Click "Create Agency" button
- ✅ **Success**:
  - Show success notification
  - Close modal
  - Refresh agencies list
  - New agency appears in table
- ❌ **Error**:
  - Show validation errors
  - Keep modal open
  - Highlight error fields

**Step 5: Configure Agency**
- Click on newly created agency
- Navigate to agency details page
- Add locations, teams, users

---

### 2.3 User Management (`/admin/users`)

#### Journey: Create Officer Account

**Step 1: Navigate to Users**
- Click "Users" in sidebar
- View users table:
  - Name
  - Email
  - Role
  - Agency
  - Status
  - Last login
  - Actions

**Step 2: Click "Add User"**
- Form appears with fields:
  - Full name
  - Email
  - Role dropdown (Super Admin, Agency Admin, Officer)
  - Agency selection (if not Super Admin)
  - Position/Title
  - Badge number (for officers)
  - Phone number
  - Status toggle

**Step 3: Fill Out Form**
- Enter officer details
- Select agency from dropdown
- Choose role (Officer)
- Add badge number

**Step 4: Submit**
- Click "Create User"
- System sends invitation email
- User appears in table with "Pending" status
- ✅ Officer receives email with setup link

**Step 5: Officer Activation**
- Officer clicks email link
- Lands on password setup page
- Sets password
- Account status changes to "Active"

---

### 2.4 Infringement Type Management (`/admin/types`)

#### Journey: Create Infringement Type

**Step 1: Navigate to Types**
- Click "Types" in sidebar
- View types table grouped by category:
  - Type code
  - Type name
  - Category
  - Fine amount
  - Demerit points
  - GL code
  - Status

**Step 2: Click "Add Type"**
- Form modal opens:
  - Type code (e.g., SPD001)
  - Type name (e.g., "Speeding 10-20 km/h over")
  - Category selection (from existing categories)
  - Description
  - Fine amount (FJD)
  - Demerit points
  - GL code (for finance integration)
  - Severity (Low, Medium, High, Critical)
  - Statute reference
  - Status (active/inactive)

**Step 3: Configure Type**
- Enter type code (must be unique)
- Write descriptive name
- Select parent category
- Set fine amount
- Assign demerit points
- Link GL code for accounting

**Step 4: Submit**
- Click "Create Type"
- Validation checks:
  - Code uniqueness
  - Required fields
  - Valid fine amount
- ✅ **Success**:
  - Type created
  - Available for infringement recording
  - Appears in category group

---

### 2.5 Analytics Dashboard (`/admin/analytics`)

#### Journey: Generate Monthly Report

**Step 1: Access Analytics**
- Click "Analytics" in sidebar
- Dashboard loads with default date range (current month)

**Visual Elements**:
1. **Date Range Selector**:
   - Preset options (Today, This Week, This Month, This Year)
   - Custom date range picker

2. **Key Metrics** (top row):
   - Total infringements
   - Total fines collected
   - Average processing time
   - Collection rate percentage

3. **Charts Section**:
   - Line chart: Infringements over time
   - Bar chart: Infringements by agency
   - Pie chart: Infringements by category
   - Bar chart: Top violation types

4. **Tables Section**:
   - Top performing officers
   - Agency performance comparison
   - Location hotspots
   - Time-based patterns

**Step 2: Filter Data**
- Select date range (e.g., last month)
- Filter by agency (optional)
- Filter by category (optional)
- Filter by location (optional)

**Step 3: Analyze Trends**
- View infringement trends over time
- Compare agency performance
- Identify hotspot locations
- Review officer productivity

**Step 4: Export Report**
- Click "Export" button
- Select format (PDF, Excel, CSV)
- Choose sections to include
- Download generated report

---

### 2.6 Integration Management (`/admin/integrations`)

#### Journey: Configure Payment Gateway

**Step 1: Navigate to Integrations**
- Click "Integrations" in sidebar
- View integration categories:
  - Payment Gateways
  - Messaging Services
  - Storage Services
  - Analytics Services

**Step 2: Select Payment Gateway**
- Click "Payment Gateways" section
- See available integrations:
  - Stripe (status, configuration)
  - PayPal (status, configuration)
  - M-Pesa (status, configuration)

**Step 3: Configure Stripe**
- Click "Configure" on Stripe card
- Configuration form:
  - API Key (secret)
  - Publishable Key
  - Webhook Secret
  - Currency (FJD)
  - Test Mode toggle
  - Enabled toggle

**Step 4: Test Connection**
- Enter API credentials
- Click "Test Connection"
- System verifies credentials
- ✅ Success: Shows green checkmark
- ❌ Error: Shows error message

**Step 5: Enable Integration**
- Toggle "Enabled" switch
- Save configuration
- Stripe now available for payments
- Officers can process payments via Stripe

---

## 3. Agency Admin Journey

### 3.1 Agency Dashboard (`/protected`)

**Landing Page After Login**

#### Visual Layout
- **Top Navigation**:
  - Agency logo/name
  - Global search
  - Notifications
  - User profile

- **Sidebar** (limited compared to Super Admin):
  - 📊 Dashboard
  - 🚨 Infringements
  - 👥 Users (agency users only)
  - 👨‍👩‍👧‍👦 Teams (agency teams only)
  - 🚗 Routes (agency routes only)
  - 📍 Locations (agency locations only)
  - 💰 Payments
  - 📊 Reports
  - ⚙️ Settings

#### Dashboard Overview
- **Welcome Message**: "Welcome back, [Position]"
- **Agency Name**: Displayed prominently

1. **Agency Statistics** (4 cards):
   - Total Infringements (agency only)
   - Active Teams
   - Active Routes
   - Managed Locations

2. **Recent Infringements Card**:
   - Last 5 infringements by agency
   - Type, vehicle, officer, date
   - "View All" button

3. **Quick Actions Card** (Agency Admin only):
   - Manage Users
   - Manage Teams
   - Manage Routes
   - Manage Locations

#### User Actions
1. **View agency statistics** → Monitor performance
2. **Access quick actions** → Manage resources
3. **Review recent infringements** → Track activity
4. **Navigate to management pages** → Admin tasks

---

### 3.2 Team Management (`/protected/teams`)

#### Journey: Create Patrol Team

**Step 1: View Teams List**
- Table of agency teams:
  - Team name
  - Leader
  - Member count
  - Assigned route
  - Status
  - Actions

**Step 2: Click "Create Team"**
- Form modal:
  - Team name
  - Team leader (dropdown of officers)
  - Team members (multi-select officers)
  - Assigned route (optional)
  - Shift schedule
  - Status toggle

**Step 3: Configure Team**
- Enter team name (e.g., "Eastern Division Patrol A")
- Select team leader from officers
- Add team members (2-6 officers)
- Assign patrol route
- Set shift times

**Step 4: Submit**
- Click "Create Team"
- ✅ Success: Team created, members notified
- Team appears in list
- Leader receives notification

**Step 5: Manage Team**
- Click on team name
- View team details page:
  - Member roster
  - Assigned routes
  - Performance metrics
  - Recent infringements
- Edit team as needed

---

### 3.3 Route Management (`/protected/routes`)

#### Journey: Define Patrol Route

**Step 1: Access Routes**
- Click "Routes" in sidebar
- View routes table:
  - Route name
  - Start location
  - End location
  - Distance
  - Assigned team
  - Status

**Step 2: Click "Create Route"**
- Form appears:
  - Route name
  - Description
  - Start location (dropdown)
  - End location (dropdown)
  - Waypoints (multiple locations)
  - Estimated duration
  - Assigned team (optional)
  - Active days (checkboxes)
  - Priority level

**Step 3: Define Route**
- Name route (e.g., "Kings Road - Suva to Nausori")
- Add description
- Select start point (e.g., Suva Police Station)
- Select end point (e.g., Nausori Police Station)
- Add waypoints (intermediate checkpoints)
- Set duration (e.g., 2 hours)

**Step 4: Assign Team**
- Select team from dropdown
- Set active days (Mon-Fri)
- Set priority (High for main highways)

**Step 5: Submit**
- Click "Create Route"
- Route saved to database
- Assigned team receives notification
- Route available for mobile app

---

### 3.4 Infringement Review (`/protected/infringements`)

#### Journey: Review and Approve Infringement

**Step 1: Access Infringements**
- Click "Infringements" in sidebar
- View infringements table (agency only):
  - Infringement ID
  - Vehicle
  - Type
  - Officer
  - Location
  - Date/Time
  - Status
  - Actions

**Step 2: Filter Infringements**
- Use filters:
  - Status (Pending, Approved, Rejected)
  - Date range
  - Officer
  - Location
  - Type
- Click "Apply Filters"

**Step 3: Select Pending Infringement**
- Click on infringement row
- Details page opens showing:
  - Vehicle information
  - Violation details
  - Location (map view)
  - Evidence photos
  - Officer notes
  - Status history

**Step 4: Review Details**
- Verify vehicle plate
- Check violation type
- Review evidence photos
- Read officer notes
- Verify location on map
- Check timestamp

**Step 5: Take Action**
Options:
1. **Approve**:
   - Click "Approve" button
   - Add review notes (optional)
   - Confirm approval
   - Status changes to "Approved"
   - Notice sent to vehicle owner

2. **Reject**:
   - Click "Reject" button
   - Enter rejection reason (required)
   - Confirm rejection
   - Status changes to "Rejected"
   - Officer notified

3. **Request More Info**:
   - Click "Request Info" button
   - Enter questions/requirements
   - Status changes to "Info Requested"
   - Officer receives notification

---

## 4. Officer Journey

### 4.1 Officer Dashboard (`/protected`)

**Landing Page After Login**

#### Visual Layout
Similar to Agency Admin but with limited permissions:

- **Sidebar**:
  - 📊 Dashboard
  - 🚨 My Infringements
  - 📝 Record Infringement (if mobile not used)
  - 👨‍👩‍👧‍👦 My Team
  - 🚗 My Routes
  - 📊 My Performance
  - ⚙️ Settings

#### Dashboard Overview
- **Welcome Message**: "Welcome back, Officer [Name]"
- **Badge Number**: Displayed

1. **Officer Statistics** (4 cards):
   - My Infringements (total)
   - This Week's Count
   - Pending Reviews
   - Approval Rate

2. **Recent Infringements Card**:
   - Last 10 infringements by officer
   - Quick status view
   - Click to view details

3. **Today's Assignment Card**:
   - Assigned team
   - Assigned route
   - Shift time
   - Team members

---

### 4.2 Record Infringement (`/protected/infringements/new`)

#### Journey: Record Traffic Violation (Web)

**Note**: Officers primarily use mobile app, but web interface available

**Step 1: Access Form**
- Click "Record Infringement" in sidebar
- Form page loads

**Step 2: Vehicle Information**
- Enter vehicle plate number
- Select vehicle type (Car, Truck, Motorcycle, etc.)
- Enter vehicle make/model (optional)
- Enter vehicle color

**Step 3: Violation Details**
- Select category (e.g., "Speeding")
- Select specific type (e.g., "Speeding 20-30 km/h over limit")
- Fine amount auto-fills
- Demerit points auto-fill

**Step 4: Location & Time**
- Location auto-detected (if GPS available)
- Or select from dropdown
- Date/time auto-filled (current)
- Can manually adjust if needed

**Step 5: Evidence & Notes**
- Upload photos (if available)
- Enter detailed notes
- Add witness information (optional)

**Step 6: Driver Information** (optional)
- Driver name
- License number
- Address
- Phone number

**Step 7: Submit**
- Review all information
- Click "Submit Infringement"
- ✅ Success:
  - Confirmation message
  - Infringement ID displayed
  - Status: "Pending Review"
  - Supervisor notified

---

### 4.3 View My Performance (`/protected/performance`)

#### Journey: Review Monthly Performance

**Step 1: Access Performance**
- Click "My Performance" in sidebar
- Performance dashboard loads

**Visual Elements**:
1. **Period Selector**:
   - This Week
   - This Month
   - This Quarter
   - Custom Range

2. **Performance Metrics**:
   - Total infringements recorded
   - Approval rate
   - Average processing time
   - Categories breakdown

3. **Charts**:
   - Infringements over time (line chart)
   - Category distribution (pie chart)
   - Approval vs. rejection (bar chart)

4. **Comparison**:
   - My performance vs. team average
   - My performance vs. agency average
   - Ranking within team

**Step 2: Select Period**
- Choose "This Month"
- Dashboard updates with month's data

**Step 3: Review Metrics**
- View total infringements: 45
- Approval rate: 92%
- Average processing: 15 minutes
- Top category: Speeding (60%)

**Step 4: Compare**
- Team average: 38 infringements
- Above team average: +18%
- Agency rank: #5 out of 40 officers

---

## 5. Navigation Structure

### 5.1 Main Navigation Hierarchy

```
/ (Home - Public)
├── /auth
│   ├── /login
│   ├── /sign-up
│   ├── /sign-up-success
│   ├── /confirm
│   ├── /forgot-password
│   ├── /update-password
│   └── /error
│
├── /admin (Super Admin Only)
│   ├── / (Dashboard)
│   ├── /agencies
│   │   ├── / (List)
│   │   ├── /new (Create)
│   │   └── /[id] (Details/Edit)
│   ├── /users
│   │   ├── / (List)
│   │   ├── /new (Create)
│   │   └── /[id] (Details/Edit)
│   ├── /teams
│   ├── /routes
│   ├── /locations
│   ├── /infringements
│   │   ├── / (List)
│   │   └── /[id] (Details)
│   ├── /categories
│   ├── /types
│   ├── /payments
│   │   ├── / (List)
│   │   └── /[id] (Details)
│   ├── /analytics
│   ├── /advanced-analytics
│   ├── /reports
│   ├── /reconciliation
│   ├── /integrations
│   ├── /documents
│   ├── /notifications
│   ├── /notifications-center
│   ├── /audit-logs
│   ├── /data-management
│   └── /payment-reminders
│
└── /protected (Agency Admin & Officer)
    ├── / (Dashboard)
    ├── /infringements
    │   ├── / (List - filtered by agency)
    │   ├── /new (Create)
    │   └── /[id] (Details)
    ├── /users (Agency Admin only)
    ├── /teams (Agency Admin only)
    ├── /routes (Agency Admin only)
    ├── /locations (Agency Admin only)
    ├── /payments
    ├── /reports
    ├── /my-performance (Officer only)
    └── /settings
```

---

## 6. Page Inventory

### 6.1 Public Pages (No Auth Required)

| Route | Page Title | Purpose | Key Elements |
|-------|------------|---------|--------------|
| `/` | Home | Landing page | Hero, features, CTA |
| `/auth/login` | Sign In | User authentication | Email, password, forgot link |
| `/auth/sign-up` | Sign Up | User registration | Registration form |
| `/auth/forgot-password` | Reset Password | Password recovery | Email input |

---

### 6.2 Super Admin Pages (Role: super_admin)

| Route | Page Title | Purpose | Key Features |
|-------|------------|---------|--------------|
| `/admin` | Admin Dashboard | System overview | Stats, activity, health |
| `/admin/agencies` | Agencies | Manage agencies | CRUD, type filter |
| `/admin/users` | Users | Manage all users | CRUD, role filter, agency filter |
| `/admin/teams` | Teams | Manage all teams | CRUD, agency filter |
| `/admin/routes` | Routes | Manage all routes | CRUD, agency filter, map view |
| `/admin/locations` | Locations | Manage all locations | CRUD, hierarchy, map |
| `/admin/infringements` | Infringements | View all infringements | List, filter, search, export |
| `/admin/categories` | Categories | Manage categories | CRUD, type count |
| `/admin/types` | Types | Manage types | CRUD, category filter, GL codes |
| `/admin/payments` | Payments | View all payments | List, filter, export, reconciliation |
| `/admin/analytics` | Analytics | System analytics | Charts, trends, comparisons |
| `/admin/advanced-analytics` | Advanced Analytics | Deep insights | Custom queries, forecasting |
| `/admin/reports` | Reports | Generate reports | Templates, export, schedule |
| `/admin/reconciliation` | Reconciliation | Financial reconciliation | Match payments, GL codes |
| `/admin/integrations` | Integrations | Third-party integrations | Configure APIs, webhooks |
| `/admin/documents` | Documents | Document management | Templates, PDFs, signatures |
| `/admin/notifications` | Notifications | Notification settings | Configure, test |
| `/admin/notifications-center` | Notification Center | View all notifications | Inbox, filters |
| `/admin/audit-logs` | Audit Logs | System audit trail | Events, users, timestamps |
| `/admin/data-management` | Data Management | Archive, export, backup | Data operations |
| `/admin/payment-reminders` | Payment Reminders | Configure reminders | Templates, schedules |

---

### 6.3 Agency Admin Pages (Role: agency_admin)

| Route | Page Title | Purpose | Key Features |
|-------|------------|---------|--------------|
| `/protected` | Dashboard | Agency overview | Agency stats, quick actions |
| `/protected/infringements` | Infringements | Agency infringements | Filter by agency, approve/reject |
| `/protected/users` | Users | Agency users | CRUD for agency users only |
| `/protected/teams` | Teams | Agency teams | CRUD for agency teams only |
| `/protected/routes` | Routes | Agency routes | CRUD for agency routes only |
| `/protected/locations` | Locations | Agency locations | CRUD for agency locations only |
| `/protected/payments` | Payments | Agency payments | View agency payments |
| `/protected/reports` | Reports | Agency reports | Generate agency reports |
| `/protected/settings` | Settings | Agency settings | Configure preferences |

---

### 6.4 Officer Pages (Role: officer)

| Route | Page Title | Purpose | Key Features |
|-------|------------|---------|--------------|
| `/protected` | Dashboard | Officer overview | Personal stats, assignments |
| `/protected/infringements` | My Infringements | Officer's infringements | View own infringements |
| `/protected/infringements/new` | Record Infringement | Create infringement | Web-based recording |
| `/protected/my-performance` | Performance | Personal performance | Stats, comparisons |
| `/protected/settings` | Settings | Personal settings | Profile, preferences |

---

## 7. Common User Flows

### 7.1 Daily Super Admin Flow

1. **Morning Check**:
   - Login → `/admin`
   - Review dashboard statistics
   - Check system health
   - Review recent activity

2. **Agency Management**:
   - Navigate to `/admin/agencies`
   - Review agency performance
   - Create new agency if needed

3. **User Support**:
   - Navigate to `/admin/users`
   - Handle user requests
   - Reset passwords
   - Assign roles

4. **Performance Review**:
   - Navigate to `/admin/analytics`
   - Review system-wide trends
   - Generate reports
   - Export data

5. **End of Day**:
   - Check `/admin/audit-logs`
   - Review day's activities
   - Address any issues

---

### 7.2 Daily Agency Admin Flow

1. **Morning Start**:
   - Login → `/protected`
   - Review agency statistics
   - Check recent infringements

2. **Infringement Review**:
   - Navigate to `/protected/infringements`
   - Filter by "Pending Review"
   - Approve/reject infringements
   - Request additional info if needed

3. **Team Management**:
   - Navigate to `/protected/teams`
   - Verify team assignments
   - Adjust routes if needed

4. **Performance Monitoring**:
   - Navigate to `/protected/reports`
   - Review team performance
   - Identify training needs

5. **End of Day**:
   - Final infringement review
   - Generate daily report
   - Plan next day's assignments

---

### 7.3 Daily Officer Flow (Web)

**Note**: Officers primarily use mobile app

1. **Shift Start**:
   - Login → `/protected`
   - Check today's assignment
   - Review assigned route

2. **Record Infringement** (if mobile unavailable):
   - Navigate to `/protected/infringements/new`
   - Fill out form
   - Submit for review

3. **Check Status**:
   - Navigate to `/protected/infringements`
   - Review pending infringements
   - Respond to supervisor requests

4. **Performance Check**:
   - Navigate to `/protected/my-performance`
   - Review week's statistics
   - Compare with team

5. **End of Shift**:
   - Check for approvals
   - Review feedback
   - Logout

---

## 8. Key Features by Role

### 8.1 Super Admin Capabilities

✅ **Full System Access**:
- Create/manage all agencies
- Create/manage all users (any role)
- View all infringements across agencies
- Configure system-wide settings
- Manage integration configurations
- Access all analytics and reports
- View complete audit logs
- Perform data management operations

❌ **Cannot**:
- Record infringements (not a field officer)
- Access officer mobile app features

---

### 8.2 Agency Admin Capabilities

✅ **Agency-Level Access**:
- Manage agency users (agency_admin, officer)
- Manage agency teams and routes
- Review/approve agency infringements
- Generate agency reports
- View agency analytics
- Configure agency locations

❌ **Cannot**:
- Access other agencies' data
- Create or manage other agencies
- Configure system integrations
- Access system-wide audit logs
- Manage Super Admins

---

### 8.3 Officer Capabilities

✅ **Limited Access**:
- Record infringements (primarily via mobile)
- View own infringements
- Check assignment and routes
- View personal performance
- Update personal profile

❌ **Cannot**:
- Approve/reject infringements
- Manage users or teams
- Access analytics (except personal)
- Configure system settings
- View other officers' data

---

## 9. Navigation Patterns

### 9.1 Breadcrumbs

All pages include breadcrumb navigation:

```
Home > Admin > Agencies > Police Force > Edit
```

Click any breadcrumb to navigate back.

---

### 9.2 Search Functionality

**Global Search** (Top navigation):
- Search infringements by ID, vehicle plate
- Search users by name, email
- Search agencies by name
- Recent searches dropdown

**Results Page**:
- Categorized results
- Quick preview
- Click to view full details

---

### 9.3 Filters & Sorting

**Standard Filters** (on list pages):
- Date range picker
- Status dropdown
- Agency dropdown (Super Admin)
- Category/Type dropdown
- Location dropdown

**Sorting**:
- Click column headers to sort
- Ascending/descending toggle
- Multiple column sorting

---

## 10. Mobile Responsiveness

### 10.1 Responsive Breakpoints

- **Desktop**: 1024px+ (Full sidebar, multi-column layout)
- **Tablet**: 768px - 1023px (Collapsible sidebar, 2-column layout)
- **Mobile**: < 768px (Hidden sidebar, single column, hamburger menu)

---

### 10.2 Mobile Navigation

**Hamburger Menu**:
- Tap icon to open sidebar
- Sidebar slides in from left
- Tap outside to close
- Main navigation items listed

**Bottom Actions** (on mobile):
- Primary actions fixed at bottom
- Easy thumb access
- Large tap targets (44px minimum)

---

## 11. Accessibility Features

### 11.1 Keyboard Navigation

- **Tab**: Move forward through interactive elements
- **Shift+Tab**: Move backward
- **Enter**: Activate buttons, links
- **Esc**: Close modals, dropdowns
- **Arrow keys**: Navigate dropdown options

---

### 11.2 Screen Reader Support

- Semantic HTML elements
- ARIA labels for icons
- Form field associations
- Error announcements
- Status updates announced

---

### 11.3 Visual Accessibility

- **Contrast**: WCAG AA compliant (4.5:1 minimum)
- **Focus indicators**: Visible blue outline on focus
- **Text size**: Minimum 16px for body text
- **Touch targets**: Minimum 44px height
- **Color**: Not sole indicator (icons + text)

---

## 12. Performance Optimization

### 12.1 Loading States

- **Initial page load**: Skeleton screens
- **Data fetching**: Loading spinners
- **Form submission**: Button loading state
- **Lazy loading**: Images, charts load on demand

---

### 12.2 Caching Strategy

- **Static assets**: Cached in browser
- **API responses**: Short-term cache (5 minutes)
- **User session**: Persistent until logout
- **Dashboard stats**: Refresh every 30 seconds

---

## 13. Error Handling

### 13.1 Error Types

1. **Validation Errors**:
   - Inline field errors (red text)
   - Form-level summary
   - Prevent submission until fixed

2. **Network Errors**:
   - Toast notification
   - Retry button
   - Offline indicator

3. **Permission Errors**:
   - Redirect to appropriate page
   - Toast explanation
   - Contact admin message

4. **Not Found (404)**:
   - Custom 404 page
   - Navigation back home
   - Search functionality

---

## 14. Success Indicators

### 14.1 Feedback Mechanisms

1. **Toast Notifications**:
   - ✅ Success (green)
   - ⚠️ Warning (yellow)
   - ❌ Error (red)
   - ℹ️ Info (blue)
   - Auto-dismiss after 5 seconds

2. **Inline Success**:
   - Checkmark icons
   - Green success text
   - Confirmation messages

3. **Page-Level Success**:
   - Success pages (e.g., `/auth/sign-up-success`)
   - Large checkmark
   - Next steps instructions

---

## 15. Future Enhancements

### Potential User Journey Improvements

1. **Onboarding Tour**:
   - First-time user walkthrough
   - Interactive tooltips
   - Feature highlights

2. **Quick Actions Menu**:
   - Command palette (Cmd+K)
   - Quick navigation
   - Global actions

3. **Saved Views**:
   - Save filter configurations
   - Custom dashboards
   - Personalized layouts

4. **Notifications Center**:
   - Unified notification inbox
   - Real-time updates
   - Action buttons

5. **Dark Mode**:
   - Toggle in settings
   - System preference detection
   - Persistent choice

---

## 📚 Related Documentation

- [UI Specifications](ui-spec.md) - Design system and components
- [API Documentation](api-spec.md) - API endpoints and usage
- [Database Schema](schema.md) - Database structure
- [System Design](system-design.md) - Architecture overview

---

**Document Status**: ✅ Complete and Up-to-Date  
**Maintained By**: Development Team  
**Review Frequency**: Quarterly or when major features added
