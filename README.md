# 🛠️ MANTIS — Multi-Agency National Traffic Infringement System

**Status**: ✅ **Production Ready** | **Internal System Only**

MANTIS is a comprehensive traffic infringement management platform for Fiji, unifying the **Fiji Police Force**, **Land Transport Authority (LTA)**, and **City/Town Councils** with web dashboards and mobile apps.

**Important**: Internal system only - all users must be authorized staff members.

---

## 🎯 Project Status
- **Web Application**: ✅ 95% Complete (Admin Portal + GIS)
- **Mobile Application**: ✅ 100% Complete (Officer App)
- **Database & Backend**: ✅ 100% Complete (PostgreSQL + PostGIS + Supabase)
- **Overall**: ✅ **Production Ready**

---

## ✨ Key Features

### 🌐 Web Dashboard (Next.js 15 + React 19)
- **Admin Panel**: Complete agency, user, and infringement management
- **Real-Time Analytics**: Comprehensive dashboards with live updates
- **Advanced Reporting**: Customizable reports with export capabilities
- **GIS Integration**: Google Maps with spatial analysis capabilities
- **Document Management**: Templates, digital signatures, PDF generation
- **Payment Processing**: Multi-gateway payment integration
- **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui

### 📱 Mobile App (Expo SDK 54 + React Native 0.81.4)
- **Infringement Recording**: Complete form with vehicle ID, type, and notes
- **Photo Capture**: Built-in camera with automatic watermarking
- **Evidence Photos**: Watermarks include timestamp, officer, GPS, vehicle, violation type
- **GPS Tracking**: Real-time location with accuracy display
- **History & Search**: Complete list with filters and full-screen details
- **Photo Gallery**: Load and display evidence photos from storage
- **Dashboard**: Statistics, quick actions, online/offline status
- **Authentication**: Secure login with token refresh and fallback
- **Tech Stack**: Expo SDK 54, React Native 0.81.4, TypeScript, Supabase

### 🗄️ Database (PostgreSQL + Supabase + PostGIS)
- **35+ Tables**: Complete schema with relationships
- **20 Migrations**: Structured database evolution with GIS support
- **Row-Level Security**: 100+ RLS policies (optional - can be disabled)
- **Audit Logging**: Complete activity tracking
- **Spatial Features**: PostGIS integration for geographic analysis
- **Storage Integration**: Supabase storage buckets (evidence-photos)

### 🔗 Integration Layer
- **REST API**: Authenticated public API with rate limiting
- **Webhooks**: Event-driven integrations with HMAC signatures
- **Service Integrations**: Payment, messaging, storage, analytics
- **API Security**: SHA256 hashing, permissions, comprehensive logging

---

## 📂 Project Structure

```
mantis/
├── web/                    # Next.js 15 app (admin dashboards)
├── mobile/                 # React Native/Expo SDK 54 app (officers)
├── db/                     # Database migrations + seeds
│   ├── migrations/         # SQL schema files (14 migrations)
│   └── seeds/              # Preloaded data (agencies, locations, etc.)
├── docs/                   # Comprehensive documentation
│   ├── mobile/             # Mobile app documentation
│   ├── web/                # Web app documentation  
│   ├── database/           # Database documentation
│   ├── system-design.md    # Architecture overview
│   ├── schema.md           # Database schema
│   ├── api-spec.md         # API documentation
│   └── GETTING_STARTED.md  # Setup guide
├── supabase/               # Supabase configuration
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (for web development)
- **Supabase Account** (database & backend)
- **Expo CLI** (for mobile development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/taiatiniyara/MANTIS.git
   cd MANTIS
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your `.env.local`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ```

3. **Run database migrations**
   ```bash
   # If using Supabase CLI
   supabase db push
   
   # Or manually run migrations 001-014 in order
   ```

4. **Install and run web application**
   ```bash
   cd web
   npm install
   npm run dev
   ```
   Open [http://localhost:3201](http://localhost:3201)

5. **Install and run mobile application**
   ```bash
   cd mobile
   npm install
   npx expo start
   ```

---

## 👥 User Roles

- **Super Admin**: System-wide administration, multi-agency management
- **Agency Admin**: Agency management, user administration
- **Supervisor**: Team oversight, report access
- **Officer**: Infringement recording, mobile app access
- **Viewer**: Read-only access to data

---

## 🔒 Security Features

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Row-Level Security (RLS) with 100+ policies
- **RBAC**: Comprehensive role-based access control
- **Audit Logging**: Complete activity tracking
- **API Security**: SHA256 key hashing, rate limiting
- **Webhook Security**: HMAC SHA256 signature verification
- **Data Encryption**: Encrypted sensitive data storage
- **Biometric Auth**: Mobile device biometric security

---

## 📱 Mobile Features

### Infringement Recording
- Vehicle ID input with validation
- Searchable infringement type picker
- Auto-generated notes with metadata
- GPS location capture
- Multiple photo capture with camera
- Automatic watermarking with:
  - Timestamp, officer name, GPS coordinates
  - Vehicle ID and infringement type
  - High-contrast text (26px, bold)
  - MANTIS branding
- Form validation and auto-clear after submission

### History & Evidence
- Complete infringement list
- Search by vehicle ID
- Filter by status (pending, issued, paid, appealed)
- Full-screen details modal
- Evidence photo gallery loaded from Supabase Storage
- Pull-to-refresh

### Dashboard & Profile
- Officer statistics (today, week, month, total)
- Quick action buttons
- Online/offline status
- GPS permission status
- Current location display
- Profile information
- Sign out functionality

### Authentication & Security
- Supabase Auth with JWT tokens
- Token refresh with error handling
- SecureStore with AsyncStorage fallback
- Session persistence
- Auto-logout on session expiry

---

## �️ GIS & Mapping

### Leaflet Integration
- Interactive map with Leaflet.js
- Route polygon drawing and editing
- Coverage area visualization
- GPS coordinate handling
- PostGIS spatial queries
- Heatmap overlay support

### Geospatial Features
- Polygon-based patrol coverage areas
- Route waypoint management
- Distance calculations
- Location-based queries
- Spatial data analysis

## �📄 Document Management

### Template System
- Reusable HTML templates with variables: `{{variable_name}}`
- Template types: Notice, Letter, Report, Receipt, Certificate
- Activate/deactivate templates
- Version control

### Document Generation
- Auto-numbering with prefixes
- Data binding from templates
- Digital signatures with canvas
- PDF export
- Document sharing with expiration

---

## 🔗 API & Integrations

### Public REST API
```
POST /api/public/infringements - Create infringement
GET  /api/public/infringements - List infringements (paginated)
```

**Features**:
- Bearer token authentication
- Granular permissions
- Rate limiting
- Request logging
- Automatic webhook triggering

### Webhooks
- Event subscriptions
- HMAC SHA256 signatures
- Exponential backoff retry
- Delivery tracking
- Custom headers support

### Service Integrations
- **Payment**: Stripe, PayPal, M-Pesa
- **Messaging**: Twilio SMS, SendGrid Email
- **Storage**: Supabase Storage
- **Analytics**: Real-time analytics

---

## 🚀 Deployment

### Web Application
```bash
cd web
npm install
npm run build
npm start
```
Deploy to Vercel, Netlify, or any Node.js hosting platform.

### Mobile Application
```bash
cd mobile
npm install

# Build for Android
expo build:android

# Build for iOS
expo build:ios
```
Submit to Google Play Store and Apple App Store.

### Database
1. Run all 19 migrations in order (001-019)
2. Configure RLS policies (or disable for development with 019)
3. Set up PostGIS extension (included in migration 014)
4. Configure Supabase storage buckets (migration 015)
5. Set up backup schedule

---

## 📚 Documentation

Key documentation files:

- **[README.md](README.md)** - This file, project overview
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes
- **[mobile/README.md](mobile/README.md)** - Complete mobile app documentation
- **[docs/](docs/)** - Technical documentation folder
  - DATABASE_SETUP.md - Database configuration
  - GETTING_STARTED.md - Setup guide
  - system-design.md - Architecture overview
  - schema.md - Database schema
  - api-spec.md - API documentation

---

## 📊 Project Statistics

- **Total Files**: 150+
- **Lines of Code**: 20,000+
- **Database Tables**: 35+
- **Database Migrations**: 20
- **RLS Policies**: 100+ (optional)
- **API Endpoints**: 50+
- **React Components**: 70+
- **Mobile Screens**: 6 (Dashboard, History, Record, Profile, Login, Details Modal)

---

## 🎯 Technology Stack

### Frontend
- **Web**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Mobile**: Expo SDK 54, React Native, TypeScript

### Backend
- **Database**: PostgreSQL 14+ with PostGIS and Supabase
- **Authentication**: Supabase Auth (JWT)
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Integrations
- **Payments**: Stripe, PayPal, M-Pesa
- **Messaging**: Twilio, SendGrid
- **Maps**: Leaflet.js (replaced Google Maps)
- **Analytics**: Real-time analytics
- **Storage**: Supabase Storage

---

## 📞 Support

For questions or issues:
- Review the [mobile/README.md](mobile/README.md) for mobile app documentation
- Check [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) for setup
- See [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) for database configuration

---

## 🎉 Status

**✅ MANTIS Platform is production-ready!**

The platform includes complete web dashboards, mobile app with photo watermarking and storage, payment integration, document management, API layer, and comprehensive security features.

**Version**: 1.0.0  
**Last Updated**: October 27, 2025  
**Status**: Production Ready