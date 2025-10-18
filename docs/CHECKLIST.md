# 🎯 MANTIS Development Checklist

## 🔧 Initial Setup

### Supabase Configuration
- [ ] Create Supabase project at https://supabase.com
- [ ] Note down Project Reference ID
- [ ] Copy Project URL from Settings → API
- [ ] Copy `anon` public key from Settings → API
- [ ] Copy `service_role` secret key from Settings → API

### Environment Setup
- [ ] Create `web/.env.local` from `web/.env.local.example`
- [ ] Add Supabase credentials to `web/.env.local`
- [ ] Create `mobile/.env` from `mobile/.env.example`
- [ ] Add Supabase credentials to `mobile/.env`

### Database Initialization
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Link project: `supabase link --project-ref YOUR_REF`
- [ ] Push migrations: `supabase db push`
- [ ] Run seeds: `supabase db seed`
- [ ] Verify tables in Supabase Dashboard → Table Editor

### Test the Apps
- [ ] Start web app: `cd web && npm run dev`
- [ ] Verify web app loads at http://localhost:3000
- [ ] Start mobile app: `cd mobile && npm start`
- [ ] Test mobile app in Expo Go or simulator

---

## 🏗️ Sprint 1: Agencies & Users

### Database Security
- [ ] Create RLS policies for `agencies` table
- [ ] Create RLS policies for `users` table
- [ ] Create RLS policies for `locations` table
- [ ] Test policies with different user roles

### Authentication
- [ ] Set up Supabase Auth email templates
- [ ] Build login page UI (web)
- [ ] Build signup page UI (web)
- [ ] Implement login logic with Supabase Auth
- [ ] Implement signup logic
- [ ] Add password reset flow
- [ ] Create mobile login screen
- [ ] Implement mobile authentication

### Super Admin Features
- [ ] Create agency management page (list agencies)
- [ ] Add "Create Agency" form
- [ ] Add "Edit Agency" functionality
- [ ] Add "Delete Agency" functionality (with confirmation)
- [ ] Create Agency Admin assignment UI
- [ ] Implement agency filtering/search

### Agency Admin Features
- [ ] Create user management page for agency
- [ ] Add "Invite User" form
- [ ] Add user role assignment (agency_admin/officer)
- [ ] Add user location assignment
- [ ] Implement user filtering/search
- [ ] Add user deactivation functionality

### UI Components (Web)
- [ ] Create Agency card component
- [ ] Create User table component
- [ ] Create Role badge component
- [ ] Create Location selector component
- [ ] Add loading states
- [ ] Add error handling UI
- [ ] Add success notifications

---

## 🚀 Sprint 2: Teams & Routes

### Database
- [ ] Add RLS policies for `teams` table
- [ ] Add RLS policies for `routes` table
- [ ] Add RLS policies for junction tables

### Agency Admin - Teams
- [ ] Create teams management page
- [ ] Add "Create Team" form
- [ ] Add team member assignment UI
- [ ] Implement team search/filter
- [ ] Add team editing functionality
- [ ] Add team deletion (with member reassignment)

### Agency Admin - Routes
- [ ] Create routes management page
- [ ] Add "Create Route" form with location picker
- [ ] Add route-to-team assignment UI
- [ ] Implement route visualization (map?)
- [ ] Add route editing functionality
- [ ] Add route deletion

### UI Components
- [ ] Create Team card component
- [ ] Create Route card component
- [ ] Create Member assignment component
- [ ] Create Multi-select for team/route assignment

---

## 📱 Sprint 3: Infringement Recording MVP

### Database
- [ ] Add RLS policies for `infringements` table
- [ ] Add RLS policies for `infringement_types` table
- [ ] Add RLS policies for `infringement_categories` table

### Mobile App - Officer
- [ ] Create infringement recording screen
- [ ] Add category selector
- [ ] Add infringement type selector (filtered by category)
- [ ] Add vehicle ID input
- [ ] Add location selector
- [ ] Add notes text area
- [ ] Add photo capture functionality (optional)
- [ ] Implement form validation
- [ ] Add submission logic with offline support
- [ ] Add success confirmation

### Web Dashboard - View Infringements
- [ ] Create infringements list page
- [ ] Add search functionality (vehicle ID, location)
- [ ] Add filters (date range, category, type, officer)
- [ ] Add infringement detail view
- [ ] Add export to CSV functionality
- [ ] Add pagination

### UI Components
- [ ] Create Infringement card (mobile)
- [ ] Create Infringement table row (web)
- [ ] Create Filter panel component
- [ ] Create Detail modal component

---

## 📊 Sprint 4: Reporting & Finance

### Reporting Views
- [ ] Create agency-level dashboard
- [ ] Add infringement summary statistics
- [ ] Add charts (by category, by type, by time)
- [ ] Create Super Admin cross-agency dashboard
- [ ] Add agency comparison view

### Finance Integration
- [ ] Create finance reports page
- [ ] Add GL code aggregation view
- [ ] Add date range selector
- [ ] Add export to Excel functionality
- [ ] Create finance summary by agency
- [ ] Add filtering by GL code

### API Endpoints
- [ ] Create RPC for agency statistics
- [ ] Create RPC for finance reports
- [ ] Create RPC for cross-agency analytics
- [ ] Add caching for report queries

---

## ✨ Sprint 5: Refinement & UX

### UX Improvements
- [ ] Audit mobile app UX
- [ ] Implement consistent blue/zinc theme
- [ ] Add loading skeletons
- [ ] Add empty states
- [ ] Improve error messages
- [ ] Add keyboard shortcuts (web)
- [ ] Optimize form flows

### Audit Logging
- [ ] Create `audit_logs` table
- [ ] Add triggers for important actions
- [ ] Create audit log viewer (Super Admin)
- [ ] Add filtering/search in audit logs

### Performance
- [ ] Add database indexes
- [ ] Optimize slow queries
- [ ] Add caching layer
- [ ] Optimize mobile app bundle size
- [ ] Add lazy loading for lists

### Polish
- [ ] Add onboarding tour (web)
- [ ] Add help tooltips
- [ ] Improve mobile accessibility
- [ ] Add unit tests for critical functions
- [ ] Add E2E tests for key flows
- [ ] Update documentation

---

## 🎯 Backlog (Future)

### Payment Integration
- [ ] Research payment gateway options
- [ ] Design payment flow
- [ ] Implement payment processing
- [ ] Add payment status tracking

### Offline Support
- [ ] Implement local storage for mobile
- [ ] Add sync queue
- [ ] Handle conflict resolution
- [ ] Add offline indicator

### Analytics
- [ ] Set up analytics tracking
- [ ] Create custom dashboards
- [ ] Add predictive analytics
- [ ] Generate insights reports

### Notifications
- [ ] Set up push notifications (mobile)
- [ ] Add email notifications
- [ ] Create notification preferences
- [ ] Add in-app notification center

### API Integration
- [ ] Design public API
- [ ] Add API authentication
- [ ] Create API documentation
- [ ] Add rate limiting

---

## ✅ Tips

- Mark items as complete by changing `[ ]` to `[x]`
- Add notes or dates next to completed items
- Move backlog items up as priorities change
- Create new sections for additional features
- Use this as a living document!

---

**Last Updated:** October 16, 2025
