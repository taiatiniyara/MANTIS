# 🚀 MANTIS Production Deployment Guide

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Date**: November 20, 2025

This guide provides comprehensive instructions for deploying the MANTIS platform to production environments, including web application, mobile application, and database setup.

---

## 📋 Deployment Overview

### Components to Deploy
1. **🗄️ Database** - Supabase (PostgreSQL + PostGIS + Auth)
2. **🌐 Web Application** - Next.js 15 admin portal (Vercel/Netlify recommended)
3. **📱 Mobile Application** - React Native/Expo app (iOS App Store + Google Play Store)

### Prerequisites
- **Domain Name** (for web application)
- **Supabase Account** (for database and backend services)
- **Apple Developer Account** (for iOS deployment)
- **Google Play Developer Account** (for Android deployment)
- **Hosting Account** (Vercel, Netlify, or similar for web app)

---

## 🗄️ Database Deployment (Supabase)

### Step 1: Create Supabase Project

1. **Sign up/Login** to [Supabase](https://supabase.com)
2. **Create New Project**:
   - Project Name: `MANTIS Production`
   - Database Password: Generate a strong password
   - Region: Choose closest to your users (e.g., `ap-southeast-1` for Pacific region)

3. **Save Credentials** (you'll need these later):
   ```
   Project URL: https://[your-project-ref].supabase.co
   Anon Key: [your-anon-key]
   Service Role Key: [your-service-role-key]
   ```

### Step 2: Apply Database Migrations

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link to Your Project**:
   ```bash
   cd /path/to/MANTIS
   supabase link --project-ref [your-project-ref]
   ```

4. **Apply All Migrations** (6 migrations):
   ```bash
   # Apply all 6 migrations at once
   supabase db push
   ```

5. **Verify Migration Success**:
   - Check Supabase Dashboard → Database → Tables
   - Should see 17 core tables including gps_tracking with PostGIS

### Step 3: Configure Storage Buckets

1. **Go to Supabase Dashboard** → Storage
2. **Create Required Buckets**:

   **evidence-photos** (Public):
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('evidence-photos', 'evidence-photos', true);
   ```

   **documents** (Private):
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('documents', 'documents', false);
   ```

   **signatures** (Private):
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('signatures', 'signatures', false);
   ```

   **receipts** (Private):
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('receipts', 'receipts', false);
   ```

   **reports** (Private):
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('reports', 'reports', false);
   ```

   **profile-photos** (Public):
   ```sql
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('profile-photos', 'profile-photos', true);
   ```

### Step 4: Load Seed Data

1. **Load Reference Data**:
   ```bash
   # Load agencies, locations, categories, etc.
   supabase db seed
   ```

2. **Create Admin User**:
   - Go to Supabase Dashboard → Authentication → Users
   - Add User: `admin@mantis.gov.fj` / `Password123!`
   - Note the User ID for the next step

3. **Promote to Super Admin**:
   ```sql
   -- Replace 'user-id-here' with actual admin user ID
   UPDATE users 
   SET role = 'super_admin', 
       is_active = true 
   WHERE auth_id = 'user-id-here';
   ```

### Step 5: Configure Security

1. **Enable RLS** (if not already enabled):
   ```sql
   -- Verify RLS is enabled on all tables
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

2. **Test Database Connection**:
   ```bash
   cd web
   npm run test:db  # If test script exists
   ```

---

## 🌐 Web Application Deployment

### Step 1: Prepare for Deployment

1. **Clone Repository** (if not already done):
   ```bash
   git clone https://github.com/taiatiniyara/MANTIS.git
   cd MANTIS/web
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

   # Web uses Leaflet (no API key needed)
   # Mobile uses Google Maps - API key configured in mobile/.env

   # Payment Integration (Optional)
   STRIPE_SECRET_KEY=[your-stripe-secret-key]
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your-stripe-publishable-key]

   # Environment
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

4. **Test Build Locally**:
   ```bash
   npm run build
   npm start
   ```
   Verify application loads at `http://localhost:3200`

### Step 2: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Configure Environment Variables** in Vercel Dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`

5. **Configure Custom Domain** (optional):
   - Go to Project Settings → Domains
   - Add your domain (e.g., `mantis.gov.fj`)

### Step 3: Alternative Deployment (Netlify)

1. **Create `netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via Git**:
   - Connect GitHub repository to Netlify
   - Configure build settings
   - Add environment variables

### Step 4: Post-Deployment Verification

1. **Test Login**:
   - Navigate to `https://your-domain.com/auth/login`
   - Login with admin credentials: `admin@mantis.gov.fj` / `Password123!`

2. **Test Core Features**:
   - Dashboard loads with analytics
   - User management works
   - Infringement recording functions
   - Leaflet maps display correctly (web uses OpenStreetMap tiles)

3. **Performance Check**:
   - Run Lighthouse audit
   - Verify loading times < 3 seconds
   - Check mobile responsiveness

---

## 📱 Mobile Application Deployment

### Step 1: Prepare Mobile App

1. **Navigate to Mobile Directory**:
   ```bash
   cd mobile
   npm install
   ```

2. **Configure Environment Variables**:
   Create `.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   ```

3. **Update App Configuration** (`app.json`):
   ```json
   {
     "expo": {
       "name": "MANTIS Officer",
       "slug": "mantis-officer",
       "version": "1.0.0",
       "scheme": "mantis",
       "platforms": ["ios", "android"],
       "icon": "./assets/icon.png",
       "splash": {
         "image": "./assets/splash.png",
         "resizeMode": "contain",
         "backgroundColor": "#ffffff"
       },
       "ios": {
         "bundleIdentifier": "fj.gov.mantis.officer",
         "buildNumber": "1",
         "supportsTablet": true
       },
       "android": {
         "package": "fj.gov.mantis.officer",
         "versionCode": 1,
         "permissions": [
           "ACCESS_FINE_LOCATION",
           "ACCESS_COARSE_LOCATION",
           "CAMERA",
           "READ_EXTERNAL_STORAGE",
           "WRITE_EXTERNAL_STORAGE"
         ]
       }
     }
   }
   ```

### Step 2: Create App Assets

1. **App Icon** (1024x1024px):
   - Create professional app icon
   - Save as `assets/icon.png`

2. **Splash Screen** (1284x2778px for iOS, 1080x1920px for Android):
   - Create branded splash screen
   - Save as `assets/splash.png`

3. **App Store Screenshots**:
   - Capture screenshots of key features
   - Multiple device sizes for both platforms

### Step 3: Build for Production

1. **Configure EAS Build**:
   ```bash
   npm install -g @expo/eas-cli
   eas login
   eas build:configure
   ```

2. **Build for iOS**:
   ```bash
   eas build --platform ios --profile production
   ```

3. **Build for Android**:
   ```bash
   eas build --platform android --profile production
   ```

### Step 4: App Store Submission

#### iOS App Store

1. **Prepare App Store Connect**:
   - Create new app in App Store Connect
   - Configure app metadata, screenshots, description

2. **Upload Build**:
   - Download IPA file from EAS build
   - Upload via Xcode or Application Loader

3. **App Information**:
   ```
   App Name: MANTIS Officer
   Category: Business
   Content Rating: 4+
   Keywords: traffic, infringement, police, government
   ```

4. **Submit for Review**:
   - Complete all required information
   - Submit for Apple review (typically 24-48 hours)

#### Google Play Store

1. **Prepare Play Console**:
   - Create new app in Google Play Console
   - Configure store listing

2. **Upload APK/AAB**:
   - Download AAB file from EAS build
   - Upload to Play Console

3. **Store Listing**:
   ```
   App Name: MANTIS Officer
   Category: Business
   Content Rating: Everyone
   Target Audience: Government/Business users
   ```

4. **Submit for Review**:
   - Complete all required information
   - Submit for Google review (typically 2-3 days)

### Step 5: Beta Testing (Recommended)

1. **Internal Testing**:
   - Create internal testing track
   - Add team members as testers
   - Test all core functionality

2. **Closed Testing**:
   - Invite government officials
   - Gather feedback and iterate
   - Fix any reported issues

---

## 🔧 Production Configuration

### SSL Certificate
- **Automatic**: Vercel/Netlify provide automatic HTTPS
- **Custom**: Configure SSL certificate for custom domains

### Domain Configuration
1. **Web App**: Point domain to hosting provider
2. **API Subdomain** (optional): `api.mantis.gov.fj` → web app
3. **CDN** (optional): Configure CloudFlare for better performance

### Monitoring & Analytics
1. **Supabase Monitoring**: Built-in database monitoring
2. **Vercel Analytics**: Built-in web app analytics
3. **Error Tracking**: Configure Sentry (optional)
4. **Uptime Monitoring**: Configure UptimeRobot (optional)

### Backup Strategy
1. **Database Backups**: Supabase provides automatic daily backups
2. **Code Backups**: GitHub repository serves as code backup
3. **Media Backups**: Supabase Storage includes redundancy

---

## 🔒 Security Checklist

### Database Security
- [x] Row Level Security (RLS) enabled on all tables
- [x] Service role key secured and not exposed to client
- [x] Database access restricted to authorized IPs (optional)
- [x] Regular security updates applied

### Web Application Security
- [x] HTTPS enforced (SSL certificate)
- [x] Environment variables secured
- [x] API routes protected with authentication
- [x] Input validation on all forms
- [x] XSS protection enabled

### Mobile Application Security
- [x] API keys stored securely (not in code)
- [x] Biometric authentication enabled
- [x] Secure storage for sensitive data
- [x] Certificate pinning (optional for enterprise)

---

## 📊 Production Testing

### Performance Testing
1. **Web Application**:
   - Load time < 3 seconds
   - Lighthouse score > 90
   - Mobile responsiveness

2. **Mobile Application**:
   - App startup < 2 seconds
   - Smooth animations and transitions
   - Offline functionality

3. **Database**:
   - Query response time < 500ms
   - Connection pooling working
   - Spatial queries optimized

### Functional Testing
1. **User Authentication**:
   - Login/logout functionality
   - Password reset
   - Session management

2. **Core Features**:
   - Infringement recording
   - Data synchronization
   - File uploads
   - Report generation

3. **Integration Testing**:
   - Web ↔ Database
   - Mobile ↔ Database
   - Real-time updates

---

## 🚀 Go-Live Checklist

### Pre-Launch (1 week before)
- [ ] All components deployed to production
- [ ] DNS configured and propagated
- [ ] SSL certificates active
- [ ] Admin users created and tested
- [ ] Backup systems verified
- [ ] Monitoring systems active

### Launch Day
- [ ] Final functionality testing
- [ ] Performance monitoring active
- [ ] Support team briefed
- [ ] User training materials ready
- [ ] Communication plan executed

### Post-Launch (1 week after)
- [ ] Monitor system performance
- [ ] Collect user feedback
- [ ] Address any issues quickly
- [ ] Plan regular maintenance schedule

---

## 📞 Support & Maintenance

### Regular Maintenance
- **Weekly**: Review system performance and user feedback
- **Monthly**: Security updates and dependency updates
- **Quarterly**: Full system backup verification and disaster recovery testing

### Monitoring
- **Uptime**: Monitor web application availability
- **Performance**: Track database query performance
- **Usage**: Monitor user activity and feature adoption
- **Errors**: Track and resolve application errors

### Support Contacts
- **Technical Issues**: System administrator
- **User Training**: Designated trainers
- **Bug Reports**: Development team
- **Security Issues**: Immediate escalation protocol

---

## 🎯 Success Metrics

### Technical Metrics
- **Uptime**: > 99.5%
- **Response Time**: < 3 seconds for web, < 2 seconds for mobile
- **Error Rate**: < 1%
- **User Satisfaction**: > 4.5/5 rating

### Business Metrics
- **User Adoption**: Track active users
- **Feature Usage**: Monitor most-used features
- **Data Quality**: Verify data accuracy and completeness
- **Efficiency Gains**: Measure time savings vs. previous system

---

**Deployment Status**: ✅ Ready for Production  
**Estimated Deployment Time**: 4-6 hours for complete setup  
**Last Updated**: October 22, 2025