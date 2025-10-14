# MANTIS - Phase 4: Advanced Features - Implementation Plan

**Status**: 🚀 READY TO START  
**Start Date**: October 13, 2025  
**Estimated Duration**: 4-5 weeks  
**Current Progress**: 40% (Google Maps Web complete)  

---

## 📋 Phase 4 Overview

Phase 4 focuses on advanced features that enhance the MANTIS system with powerful tools for administrators, officers, and citizens. This phase builds on the solid foundation of Phases 1-3 to add reporting, analytics, admin tools, and enhanced integrations.

---

## 🎯 Phase 4 Goals

1. **Complete Google Maps integration** (Mobile)
2. **Build comprehensive reporting system** (Web + Mobile)
3. **Create admin management tools**
4. **Enhance evidence management**
5. **Add audit & compliance features**
6. **Implement push notifications** (Mobile)

---

## 📊 Sprint Breakdown

### Sprint 1: Google Maps Mobile Integration (Week 9)
**Duration**: 5-7 days  
**Priority**: HIGH  
**Estimated Lines**: ~800 lines  

#### Objectives
- Install and configure react-native-maps
- Build LocationPicker component for mobile
- Add map view to infringement detail
- Integrate with GPS location capture
- Offline map caching (basic)

#### Deliverables
- [ ] `react-native-maps` package installed
- [ ] Google Maps API keys configured (iOS/Android)
- [ ] `components/maps/location-picker-mobile.tsx` - Interactive map picker
- [ ] `components/maps/infringement-map-mobile.tsx` - Single location display
- [ ] Map integration in create-infringement.tsx
- [ ] Map view in infringement detail modal
- [ ] Custom marker icons
- [ ] "Get Directions" functionality
- [ ] Offline map tiles (basic caching)

#### Technical Requirements
```json
{
  "packages": [
    "react-native-maps",
    "react-native-maps-directions",
    "@react-native-community/geolocation"
  ],
  "api-keys": [
    "GOOGLE_MAPS_API_KEY_IOS",
    "GOOGLE_MAPS_API_KEY_ANDROID"
  ]
}
```

---

### Sprint 2: Push Notifications (Week 9-10)
**Duration**: 5-7 days  
**Priority**: HIGH  
**Estimated Lines**: ~600 lines  

#### Objectives
- Setup Expo Push Notifications
- Create notification service
- Implement notification handlers
- Build notification preferences UI
- Test on iOS & Android

#### Deliverables
- [ ] Expo Notifications configured
- [ ] `lib/api/notifications.ts` - Notification service
- [ ] Push token registration
- [ ] Notification handlers (foreground/background)
- [ ] Notification preferences screen
- [ ] Database: `push_tokens` table
- [ ] Supabase Edge Function: `send-push-notification`
- [ ] Notification triggers:
  - [ ] Payment confirmation
  - [ ] Dispute update
  - [ ] Infringement voided
  - [ ] Payment reminder (3 days before due)
  - [ ] Appeal deadline approaching

#### Notification Types
```typescript
type NotificationType = 
  | 'payment_received'
  | 'payment_reminder'
  | 'dispute_submitted'
  | 'dispute_resolved'
  | 'infringement_voided'
  | 'appeal_deadline';
```

---

### Sprint 3: Reports & Analytics (Week 10)
**Duration**: 7-10 days  
**Priority**: MEDIUM  
**Estimated Lines**: ~1,200 lines  

#### Objectives
- Build report generation system
- Create analytics dashboard
- Add geographic filtering with maps
- Implement export functionality
- Add scheduled reports

#### Deliverables

**Web Reports**
- [ ] `routes/reports.tsx` - Reports dashboard
- [ ] `components/report-builder.tsx` - Custom report builder
- [ ] `components/analytics-dashboard.tsx` - Charts & metrics
- [ ] Report types:
  - [ ] Revenue report (by date, agency, officer)
  - [ ] Infringement trends (by offence, location, time)
  - [ ] Payment status report
  - [ ] Dispute resolution report
  - [ ] Officer performance report
- [ ] Geographic analysis:
  - [ ] Heatmap showing infringement density
  - [ ] Click map to filter by area
  - [ ] Export map as PNG/PDF
- [ ] Export formats:
  - [ ] PDF with charts
  - [ ] Excel (CSV)
  - [ ] Email delivery
- [ ] Scheduled reports (daily/weekly/monthly)

**Mobile Reports**
- [ ] `app/(tabs)/reports.tsx` - Mobile reports screen
- [ ] Quick stats dashboard
- [ ] Officer daily summary
- [ ] Export to email/share

#### Database Schema
```sql
-- reports table
CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  report_type text NOT NULL,
  filters jsonb,
  schedule text, -- 'daily', 'weekly', 'monthly', null
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now()
);

-- report_executions table
CREATE TABLE report_executions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id uuid REFERENCES reports(id),
  executed_at timestamptz DEFAULT now(),
  file_url text,
  status text -- 'success', 'failed'
);
```

---

### Sprint 4: Admin Management Tools (Week 11)
**Duration**: 7-10 days  
**Priority**: MEDIUM  
**Estimated Lines**: ~1,000 lines  

#### Objectives
- Build user management interface
- Create agency configuration tools
- Add offence catalog management
- Implement system settings
- Add bulk operations

#### Deliverables

**User Management**
- [ ] `routes/admin/users.tsx` - User list & management
- [ ] Create/edit user dialog
- [ ] Role assignment
- [ ] Agency assignment
- [ ] Deactivate/reactivate users
- [ ] Password reset
- [ ] Bulk user import (CSV)

**Agency Management**
- [ ] `routes/admin/agencies.tsx` - Agency configuration
- [ ] Create/edit agency dialog
- [ ] Agency hierarchy (parent/child)
- [ ] Territory assignment
- [ ] Officer allocation

**Offence Catalog Management**
- [ ] `routes/admin/offences.tsx` - Offence management
- [ ] Create/edit offence dialog
- [ ] Fine amount configuration
- [ ] Offence categories
- [ ] Active/inactive status
- [ ] Bulk update

**System Settings**
- [ ] `routes/admin/settings.tsx` - System configuration
- [ ] Payment gateway settings
- [ ] Notification settings
- [ ] Email templates
- [ ] System maintenance mode
- [ ] Feature flags

**Bulk Operations**
- [ ] Bulk void infringements
- [ ] Bulk reassign infringements
- [ ] Bulk update fines
- [ ] Export/import data

---

### Sprint 5: Enhanced Evidence Management (Week 11-12)
**Duration**: 5-7 days  
**Priority**: LOW  
**Estimated Lines**: ~600 lines  

#### Objectives
- Add video evidence support
- Implement integrity verification
- Create immutable audit trail
- Add evidence timeline
- Build evidence export tools

#### Deliverables

**Video Support**
- [ ] Video upload (mobile camera)
- [ ] Video player component
- [ ] Video thumbnails
- [ ] Compression before upload
- [ ] Streaming from Storage

**Integrity & Audit**
- [ ] SHA-256 checksums on upload
- [ ] Evidence metadata logging
- [ ] Immutable audit trail (blockchain-style)
- [ ] Evidence chain of custody
- [ ] Tamper detection

**Evidence Timeline**
- [ ] Chronological evidence view
- [ ] Evidence access logs
- [ ] Who viewed/downloaded
- [ ] Export evidence package (ZIP)

#### Database Schema
```sql
-- evidence_audit table
CREATE TABLE evidence_audit (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  infringement_id uuid REFERENCES infringements(id),
  evidence_url text NOT NULL,
  checksum text NOT NULL,
  action text, -- 'uploaded', 'viewed', 'downloaded', 'deleted'
  user_id uuid REFERENCES user_profiles(id),
  ip_address text,
  created_at timestamptz DEFAULT now()
);
```

---

### Sprint 6: Audit & Compliance (Week 12)
**Duration**: 5-7 days  
**Priority**: MEDIUM  
**Estimated Lines**: ~700 lines  

#### Objectives
- Implement comprehensive audit logging
- Create compliance reports
- Add data retention policies
- Build audit viewer
- Add export for compliance

#### Deliverables

**Audit Logging**
- [ ] Extend `audit_logs` table
- [ ] Log all critical actions:
  - [ ] User login/logout
  - [ ] Infringement CRUD
  - [ ] Payment processing
  - [ ] Dispute actions
  - [ ] Admin changes
  - [ ] Settings changes
- [ ] IP address tracking
- [ ] User agent tracking
- [ ] Session tracking

**Compliance Reports**
- [ ] Audit log viewer (admin)
- [ ] Filter by user/action/date
- [ ] Export audit trail (PDF/CSV)
- [ ] GDPR compliance report
- [ ] Data access report
- [ ] Security incident report

**Data Retention**
- [ ] Retention policy configuration
- [ ] Automated archival
- [ ] Data deletion workflows
- [ ] Archive viewer (read-only)

**Compliance Dashboard**
- [ ] `routes/admin/compliance.tsx`
- [ ] System health metrics
- [ ] Security alerts
- [ ] Policy violations
- [ ] Compliance score

---

## 🗓️ Phase 4 Timeline

```
Week 9:  Sprint 1 (Google Maps Mobile) + Sprint 2 Start (Notifications)
Week 10: Sprint 2 Complete (Notifications) + Sprint 3 Start (Reports)
Week 11: Sprint 3 Complete (Reports) + Sprint 4 (Admin Tools)
Week 12: Sprint 5 (Evidence) + Sprint 6 (Audit & Compliance)
```

**Total Duration**: 4 weeks  
**Total Estimated Lines**: ~4,900 lines  

---

## 📦 New Dependencies

### Mobile
```json
{
  "react-native-maps": "^1.15.0",
  "react-native-maps-directions": "^1.9.0",
  "expo-notifications": "~0.28.18",
  "expo-device": "~6.0.2",
  "expo-video": "~2.1.0"
}
```

### Web
```json
{
  "recharts": "^2.12.0",
  "jspdf": "^2.5.2",
  "jspdf-autotable": "^3.8.3",
  "papaparse": "^5.4.1",
  "@types/papaparse": "^5.3.14"
}
```

### Backend (Edge Functions)
```json
{
  "expo-server-sdk": "^3.10.0",
  "node-cron": "^3.0.3"
}
```

---

## 🎯 Success Criteria

### Sprint 1: Google Maps Mobile
- ✅ Maps display correctly on iOS/Android
- ✅ Location picker allows pin placement
- ✅ GPS integration works seamlessly
- ✅ Map markers show infringement locations
- ✅ "Get Directions" opens native maps app

### Sprint 2: Push Notifications
- ✅ Notifications received on iOS/Android
- ✅ Foreground/background handling works
- ✅ Users can enable/disable notifications
- ✅ All notification types working
- ✅ Deep links open correct screens

### Sprint 3: Reports & Analytics
- ✅ Report builder generates accurate data
- ✅ Charts render correctly
- ✅ Geographic filtering works
- ✅ PDF export includes charts
- ✅ Scheduled reports run automatically

### Sprint 4: Admin Tools
- ✅ Admins can manage users/agencies/offences
- ✅ Bulk operations complete successfully
- ✅ System settings persist correctly
- ✅ Permissions enforced via RLS

### Sprint 5: Evidence Management
- ✅ Video upload/playback works
- ✅ Checksums verify integrity
- ✅ Audit trail is immutable
- ✅ Evidence export creates valid ZIP

### Sprint 6: Audit & Compliance
- ✅ All actions logged correctly
- ✅ Audit viewer shows complete history
- ✅ Compliance reports accurate
- ✅ Data retention policies enforced

---

## 🔐 Security Considerations

### RLS Policies Required
- Reports: Only view own agency's data (unless central admin)
- Admin tools: Restrict to agency_admin and central_admin roles
- Audit logs: Read-only, admin access only
- Evidence: Chain of custody maintained

### API Security
- Rate limiting on report generation
- File size limits on uploads
- Signed URLs for evidence download
- API key rotation for external services

---

## 📊 Priority Ranking

1. **HIGH**: Google Maps Mobile (Sprint 1)
2. **HIGH**: Push Notifications (Sprint 2)
3. **MEDIUM**: Reports & Analytics (Sprint 3)
4. **MEDIUM**: Admin Tools (Sprint 4)
5. **MEDIUM**: Audit & Compliance (Sprint 6)
6. **LOW**: Enhanced Evidence (Sprint 5)

---

## 🚀 Recommended Start: Sprint 1 - Google Maps Mobile

**Why Start Here?**
- Builds on existing GPS/location work from Phase 3
- Enhances officer workflow immediately
- Provides visual context for infringements
- Required for geographic reports later

**What We'll Build First:**
1. Install react-native-maps package
2. Configure Google Maps API keys
3. Create LocationPickerMobile component
4. Add map to create infringement flow
5. Add map to detail view
6. Test on iOS and Android

---

## 📝 Notes

- Web Google Maps already complete (40% of Phase 4)
- Mobile work will complete maps integration
- Reports can reuse web map components
- Admin tools are web-only (for now)
- Evidence enhancements nice-to-have
- Audit is critical for compliance

---

## ✅ Ready to Begin?

**Recommended Starting Point**: Sprint 1 - Google Maps Mobile Integration

Would you like to proceed with Sprint 1, or would you prefer to start with a different sprint (e.g., Push Notifications)?

---

**Document Created**: October 13, 2025  
**Phase**: 4 of 6  
**Status**: 🚀 READY TO START
