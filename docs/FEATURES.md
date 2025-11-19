# 🌟 MANTIS - Feature Documentation

**Version**: 1.0.0 | **Status**: Production Ready | **Last Updated**: November 20, 2025

---

## 📑 Table of Contents

1. [Core Features](#core-features)
2. [Web Application](#web-application)
3. [Mobile Application](#mobile-application)
4. [GIS & Mapping](#gis--mapping)
5. [Database Features](#database-features)
6. [Security Features](#security-features)
7. [Integration Features](#integration-features)
8. [Administrative Features](#administrative-features)

---

## Core Features

### Multi-Agency Support
- **Agency Hierarchy** - Support for Police, LTA, and City/Town Councils
- **Agency Configuration** - Custom settings per agency
- **Cross-Agency Visibility** - Super Admin oversight across all agencies
- **Agency Branding** - Customizable agency logos and colors
- **Data Isolation** - Agency-specific data access control

### User Management
- **Role-Based Access Control (RBAC)**
  - Super Admin (system-wide control)
  - Agency Admin (agency management)
  - Supervisor (team oversight)
  - Officer (field operations)
  - Viewer (read-only access)
- **User Profiles** - Detailed user information and preferences
- **Team Assignments** - Users assigned to teams and routes
- **Activity Tracking** - User action audit logs
- **Session Management** - Secure authentication with JWT tokens

### Infringement Management
- **Infringement Recording** - Web and mobile recording
- **Evidence Management** - Photo and document attachments
- **Workflow States** - Pending → Issued → Paid/Disputed/Cancelled
- **Appeals System** - Submit and review appeals
- **Payment Tracking** - Payment status and history
- **Batch Operations** - Bulk status updates and exports

---

## Web Application

### Admin Dashboard
- **Real-Time Statistics** - Live infringement counts and metrics
- **Visual Analytics** - Charts and graphs for data visualization
- **Agency Overview** - Multi-agency performance comparison
- **Recent Activity** - Latest infringements and actions
- **Quick Actions** - Shortcuts to common tasks
- **Customizable Widgets** - Drag-and-drop dashboard layout

### Agency Management
- **Agency CRUD** - Create, read, update, delete agencies
- **Hierarchy Management** - Parent-child agency relationships
- **Configuration** - Agency-specific settings and preferences
- **User Assignment** - Assign users to agencies
- **Team Management** - Create and manage agency teams
- **Statistics** - Agency performance metrics

### User Administration
- **User CRUD** - Complete user lifecycle management
- **Role Assignment** - Assign and change user roles
- **Team Assignment** - Assign users to teams
- **Profile Management** - Edit user profiles and settings
- **Password Reset** - Admin password reset capability
- **User Activity** - View user activity logs

### Infringement Operations
- **Create Infringement** - Record new infringements
- **Edit Infringement** - Update infringement details
- **View History** - Complete infringement timeline
- **Status Updates** - Change infringement status
- **Evidence Upload** - Attach photos and documents
- **Comments** - Add notes and comments
- **Print/Export** - Generate reports and documents

### Reporting & Analytics
- **Standard Reports**
  - Daily infringement summary
  - Weekly performance report
  - Monthly financial report
  - Agency comparison report
  - Officer performance report
- **Custom Reports** - Build custom reports with filters
- **Data Export** - Export to CSV, Excel, PDF
- **Scheduled Reports** - Automated report generation
- **Visual Dashboards** - Interactive data visualization
- **Trend Analysis** - Historical data analysis

### Document Management
- **Template System**
  - Create reusable templates
  - Variable substitution `{{variable}}`
  - Template versioning
  - Template activation/deactivation
- **Document Generation**
  - Auto-numbering with prefixes
  - Data binding from database
  - Digital signatures
  - PDF export
  - Document preview
- **Document Library**
  - Organize documents by type
  - Search and filter
  - Version history
  - Access control

---

## Mobile Application

### Authentication
- **Email/Password Login** - Standard authentication
- **Biometric Authentication** - Face ID, Touch ID, Fingerprint
- **Remember Me** - Secure credential storage
- **Session Persistence** - Stay logged in
- **Auto-Login** - Automatic login on app launch
- **Secure Storage** - Encrypted credential storage

### Dashboard
- **Welcome Screen** - Personalized greeting
- **Statistics Cards** - Today, Week, Month, Total counts
- **GPS Status** - Current GPS state indicator
- **Online/Offline Status** - Network connectivity indicator
- **Current Location** - GPS coordinates and accuracy
- **Quick Actions** - Record and view shortcuts
- **Pull-to-Refresh** - Update data with gesture

### Infringement Recording
- **Form Interface** - User-friendly recording form
- **Vehicle ID Input** - Auto-uppercase, validation
- **Infringement Type** - Scrollable chip selection
- **GPS Auto-Capture** - Automatic location tagging
- **Manual Location** - Manual coordinate entry
- **Additional Notes** - Multi-line text input
- **Photo Evidence** - Camera integration (up to 5 photos)
- **Offline Queue** - Record without internet
- **Form Validation** - Real-time field validation

### Camera Integration
- **Photo Capture** - Front and back camera support
- **Gallery Picker** - Select from photo library
- **Photo Preview** - Review before attaching
- **Multi-Photo** - Up to 5 photos per infringement
- **Image Compression** - Automatic compression (70% quality)
- **Resolution Limit** - Max 1920x1080 for performance
- **Metadata** - GPS coordinates embedded in photos
- **Offline Storage** - Photos saved locally when offline

### GPS Features
- **Real-Time Tracking** - Continuous location monitoring
- **Background Tracking** - Track when app backgrounded
- **Location History** - 1000-item history buffer
- **Distance Calculation** - Haversine formula accuracy
- **Accuracy Display** - Show GPS accuracy in meters
- **Location Refresh** - Manual refresh button
- **Reverse Geocoding** - Coordinates to address conversion
- **Location Caching** - Cache for performance

### Offline Capabilities
- **Offline Recording** - Record infringements offline
- **Offline Photos** - Capture photos offline
- **Sync Queue** - Queue actions for sync
- **Auto-Sync** - Sync when connection restored
- **Manual Sync** - Trigger sync manually
- **Sync Progress** - Visual sync progress indicator
- **Retry Logic** - 3-retry mechanism with backoff
- **Conflict Resolution** - Handle data conflicts

### Infringement List
- **View All** - List all officer's infringements
- **Search** - Search by vehicle ID
- **Filter by Status** - All, Pending, Paid, Disputed, Cancelled
- **Sort Options** - Sort by date, status, amount
- **Card Layout** - Information-rich cards
- **Status Colors** - Color-coded status badges
- **Pull-to-Refresh** - Update list with gesture
- **Empty State** - Helpful message when no data

### Push Notifications
- **Foreground Notifications** - Alerts while using app
- **Background Notifications** - Alerts when app backgrounded
- **Custom Actions** - Quick action buttons
- **Notification Badge** - Unread count badge
- **Notification History** - View past notifications
- **Settings** - Configure notification preferences

### Profile & Settings
- **User Profile** - View and edit profile
- **Statistics** - Personal performance metrics
- **Sync Status** - Pending items count
- **Clear Cache** - Clear local data
- **Logout** - Sign out of app
- **App Version** - Display app version
- **Theme Toggle** - Light/dark mode

---

## GIS & Mapping

### Map Display
- **Leaflet Integration** - Open-source mapping library
- **Multiple Tile Layers** - Street, satellite, terrain views
- **Zoom Controls** - Zoom in/out with buttons
- **Pan Controls** - Click and drag to pan
- **Geolocation** - Center map on current location
- **Full-Screen Mode** - Maximize map view
- **Responsive Design** - Works on all screen sizes

### Route Management
- **Polygon Coverage Areas**
  - Draw patrol coverage areas
  - Edit existing polygons
  - Delete polygon points
  - Visual polygon display
  - Area calculation
  - Polygon validation
- **Waypoint Management**
  - Add route waypoints
  - Reorder waypoints
  - Edit waypoint details
  - Delete waypoints
  - Waypoint icons and labels
  - Optimal route calculation

### Spatial Analysis
- **Hotspot Analysis** - Identify high-infringement areas
- **Heatmap Overlays** - Density visualization
- **Distance Calculations** - Measure distances
- **Area Calculations** - Calculate coverage areas
- **Proximity Queries** - Find nearby infringements
- **Geofencing** - Location-based alerts

### GPS Integration
- **Real-Time Tracking** - Live officer location display
- **Location History** - View historical tracks
- **Track Playback** - Replay officer movements
- **Accuracy Indicators** - Visual accuracy circles
- **Speed Display** - Show movement speed
- **Coordinate Display** - Show lat/lng coordinates

### Map Features
- **Markers** - Place custom markers
- **Popups** - Information popups on click
- **Tooltips** - Hover tooltips
- **Polylines** - Draw lines for routes
- **Polygons** - Draw areas for coverage
- **Circles** - Draw circular areas
- **Custom Icons** - Use custom marker icons
- **Layer Control** - Toggle map layers

---

## Database Features

### Schema
- **35+ Tables** - Comprehensive data model
- **Relationships** - Foreign key constraints
- **Indexes** - Optimized query performance
- **Views** - Pre-calculated views for reporting
- **Triggers** - Automated actions on data changes
- **Functions** - Stored procedures for complex logic

### Data Models

#### Core Tables
- `agencies` - Agency information
- `users` - User accounts and profiles
- `teams` - Team structure and membership
- `officers` - Officer details and assignments
- `infringements` - Infringement records
- `evidence` - Evidence files and metadata

#### Configuration Tables
- `infringement_categories` - Violation categories
- `infringement_types` - Specific violation types
- `locations` - Location hierarchy
- `divisions` - Geographic divisions
- `stations` - Police/LTA stations
- `regions` - Regional boundaries

#### Operational Tables
- `shifts` - Officer shift schedules
- `routes` - Patrol routes with coverage areas
- `route_waypoints` - Route waypoint data
- `vehicles` - Vehicle information
- `appeals` - Appeal submissions
- `payments` - Payment transactions

#### System Tables
- `audit_logs` - Activity audit trail
- `notifications` - Notification queue
- `webhooks` - Webhook configurations
- `api_keys` - API key management
- `integrations` - Third-party integrations
- `archived_data` - Historical data archive

### PostGIS Features
- **Spatial Columns** - Geometry and geography types
- **Spatial Indexes** - GIST indexes for performance
- **Distance Functions** - Calculate distances between points
- **Area Functions** - Calculate polygon areas
- **Intersection Queries** - Find overlapping areas
- **Proximity Queries** - Find nearby records
- **Route Optimization** - Calculate optimal routes

### Data Integrity
- **Foreign Keys** - Referential integrity
- **Check Constraints** - Data validation
- **Not Null Constraints** - Required fields
- **Unique Constraints** - Prevent duplicates
- **Default Values** - Sensible defaults
- **Cascading Deletes** - Maintain consistency

### Migrations
- **Version Control** - Tracked migration history
- **Idempotent** - Safe to run multiple times
- **Rollback Support** - Undo migrations if needed
- **Seed Data** - Initial data population
- **Testing** - Validated migrations

---

## Security Features

### Authentication
- **Supabase Auth** - Secure authentication provider
- **JWT Tokens** - JSON Web Token authentication
- **Session Management** - Secure session handling
- **Password Hashing** - Bcrypt password encryption
- **Email Verification** - Confirm email addresses
- **Password Reset** - Secure password recovery

### Authorization
- **Row-Level Security (RLS)** - Database-level security
  - 100+ RLS policies
  - Agency data isolation
  - Role-based access
  - User-specific filtering
  - Optional for development (migration 019)
- **API Authentication** - Bearer token authentication
- **API Key Management** - SHA256 hashed keys
- **Permission System** - Granular permissions
- **Rate Limiting** - Prevent abuse

### Data Protection
- **Encryption at Rest** - Encrypted database storage
- **Encryption in Transit** - HTTPS/TLS connections
- **Secure Storage** - Encrypted mobile storage
- **API Key Hashing** - SHA256 key hashing
- **HMAC Signatures** - Webhook verification
- **Input Validation** - Prevent injection attacks
- **XSS Protection** - Cross-site scripting prevention
- **CSRF Protection** - Cross-site request forgery prevention

### Audit & Compliance
- **Activity Logging** - Complete action audit trail
- **User Tracking** - Track user activities
- **Change History** - Record all data changes
- **Login History** - Track authentication attempts
- **IP Logging** - Record IP addresses
- **Data Retention** - Automated archiving
- **GDPR Compliance** - Data privacy controls

### Mobile Security
- **Biometric Auth** - Face ID, Touch ID, Fingerprint
- **Secure Storage** - Expo SecureStore for credentials
- **Certificate Pinning** - Prevent MITM attacks
- **App Transport Security** - Enforce HTTPS
- **Jailbreak Detection** - Detect compromised devices
- **Data Wiping** - Remote data wipe capability

---

## Integration Features

### Public REST API
- **RESTful Design** - Standard HTTP methods
- **JSON Responses** - Consistent response format
- **Error Handling** - Meaningful error messages
- **Pagination** - Cursor-based pagination
- **Filtering** - Query parameter filtering
- **Sorting** - Configurable sort orders
- **Rate Limiting** - 100 requests/minute per key
- **API Versioning** - Version in URL path
- **Documentation** - OpenAPI/Swagger spec

### API Endpoints
```
POST   /api/public/infringements      # Create infringement
GET    /api/public/infringements      # List infringements
GET    /api/public/infringements/:id  # Get infringement
PUT    /api/public/infringements/:id  # Update infringement
DELETE /api/public/infringements/:id  # Delete infringement
GET    /api/public/agencies           # List agencies
GET    /api/public/infringement-types # List types
POST   /api/webhooks/validate         # Validate webhook
```

### Webhook System
- **Event Subscriptions** - Subscribe to specific events
- **HMAC Signatures** - SHA256 signature verification
- **Retry Logic** - Exponential backoff (3 retries)
- **Delivery Tracking** - Success/failure logging
- **Custom Headers** - Configurable HTTP headers
- **Payload Filtering** - Filter event data
- **Webhook Testing** - Test endpoint before activation

### Supported Events
- `infringement.created` - New infringement recorded
- `infringement.updated` - Infringement details changed
- `infringement.status_changed` - Status transition
- `payment.received` - Payment processed
- `appeal.submitted` - New appeal filed
- `document.generated` - Document created
- `user.created` - New user registered
- `team.assigned` - User assigned to team

### Service Integrations

#### Payment Gateways
- **Stripe** - Credit/debit card payments
- **PayPal** - Online payment processing
- **M-Pesa** - Mobile money (Fiji/Pacific)
- **Payment Webhooks** - Real-time payment notifications
- **Refund Processing** - Handle payment refunds
- **Receipt Generation** - Automatic receipt creation

#### Messaging Services
- **Twilio SMS** - Send SMS notifications
- **SendGrid Email** - Send email notifications
- **Email Templates** - Customizable email templates
- **SMS Templates** - Customizable SMS messages
- **Delivery Status** - Track message delivery
- **Bounce Handling** - Handle failed deliveries

#### Storage Services
- **Supabase Storage** - Primary file storage
- **AWS S3** - Alternative storage option
- **Azure Blob** - Alternative storage option
- **File Upload** - Multipart upload support
- **File Download** - Secure download URLs
- **Access Control** - Bucket-level permissions

#### Analytics Services
- **Google Analytics** - Web analytics tracking
- **Mixpanel** - User behavior analytics
- **Custom Events** - Track custom events
- **Funnel Analysis** - Conversion tracking
- **Retention Analysis** - User retention metrics
- **Cohort Analysis** - User cohort tracking

---

## Administrative Features

### System Administration
- **Super Admin Dashboard** - System-wide overview
- **Agency Management** - Create and manage agencies
- **User Management** - System-wide user administration
- **Configuration** - System settings and preferences
- **Maintenance Mode** - Enable maintenance mode
- **Backup Management** - Database backup/restore
- **Log Viewing** - System and application logs

### Team Management
- **Team CRUD** - Create, read, update, delete teams
- **Member Assignment** - Assign users to teams
- **Team Leader** - Designate team leaders
- **Team Hierarchy** - Parent-child team relationships
- **Team Statistics** - Team performance metrics
- **Route Assignment** - Assign routes to teams

### Route Management
- **Route CRUD** - Create, read, update, delete routes
- **Route Planning** - Define patrol routes
- **Coverage Areas** - Draw polygon coverage areas
- **Waypoint Management** - Add and manage waypoints
- **Team Assignment** - Assign routes to teams
- **Route Scheduling** - Schedule route patrols
- **Route Statistics** - Route performance metrics

### Location Management
- **Location Hierarchy** - Division → Station → Region
- **Location CRUD** - Manage all location levels
- **GPS Coordinates** - Assign coordinates to locations
- **Location Assignment** - Assign locations to agencies
- **Location Statistics** - Location-based metrics

### Configuration Management
- **Infringement Types** - Define violation types
- **Fine Amounts** - Configure fine amounts
- **Demerit Points** - Set demerit point values
- **GL Codes** - Accounting codes for finance
- **Workflow States** - Configure status transitions
- **System Settings** - Global configuration options

### Reporting Administration
- **Report Templates** - Create report templates
- **Schedule Reports** - Automated report generation
- **Report Distribution** - Email report delivery
- **Report Archive** - Historical report storage
- **Custom Reports** - Build custom report queries

---

## Feature Comparison

### Web vs Mobile

| Feature | Web | Mobile |
|---------|-----|--------|
| Dashboard | ✅ Full | ✅ Simplified |
| Infringement Recording | ✅ Full Form | ✅ Quick Form |
| Evidence Upload | ✅ Drag & Drop | ✅ Camera |
| GPS Tracking | ✅ View Only | ✅ Active Tracking |
| Offline Mode | ❌ No | ✅ Full Support |
| Map Display | ✅ Full Features | ✅ Basic Display |
| Reporting | ✅ Advanced | ✅ Basic Stats |
| User Management | ✅ Full Admin | ❌ Profile Only |
| Biometric Auth | ❌ No | ✅ Yes |
| Push Notifications | ❌ No | ✅ Yes |

---

## Technology Stack

### Frontend
- **Web**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Mobile**: Expo SDK 54, React Native, TypeScript
- **Maps**: Leaflet.js, React-Leaflet

### Backend
- **Database**: PostgreSQL 14+ with PostGIS
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **API**: REST with JSON

### Integrations
- **Payments**: Stripe, PayPal, M-Pesa
- **Messaging**: Twilio, SendGrid
- **Storage**: Supabase Storage, AWS S3, Azure Blob
- **Analytics**: Google Analytics, Mixpanel

---

## Future Enhancements

### Planned Features
- [ ] Vehicle recognition with AI/ML
- [ ] Automated fine calculation
- [ ] Court integration
- [ ] License plate scanning
- [ ] Traffic camera integration
- [ ] Advanced analytics with AI insights
- [ ] Multi-language support
- [ ] Voice recording for evidence
- [ ] Video evidence support
- [ ] Real-time chat between officers

### Under Consideration
- [ ] Blockchain for immutable records
- [ ] IoT sensor integration
- [ ] Predictive policing analytics
- [ ] Public portal for fine payment
- [ ] Self-service kiosk integration

---

**For detailed implementation guides, see:**
- [Getting Started](GETTING_STARTED.md)
- [System Design](system-design.md)
- [API Specification](api-spec.md)
- [Database Schema](schema.md)

**Version**: 1.0.0  
**Status**: Production Ready  
**Last Updated**: October 27, 2025
