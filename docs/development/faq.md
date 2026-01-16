# Frequently Asked Questions (FAQ)

Common questions about MANTIS and their answers.

## General

### What is MANTIS?

MANTIS (Multi-Agency National Traffic Infringement System) is a unified enforcement platform for Fiji's traffic agencies including LTA, Municipal Councils, and Fiji Police. It's a Progressive Web App that enables officers to issue and manage traffic infringements through a mobile-friendly, offline-capable interface.

### Who can use MANTIS?

MANTIS is designed for:
- **Law enforcement officers** (Fiji Police, LTA, Municipal Councils)
- **Agency administrators** (managing teams and users)
- **System administrators** (full system access)
- **Citizens** (viewing and paying infringements - future)

### Is MANTIS open source?

MANTIS is built with open-source technologies. Check the project license for usage terms.

### What devices are supported?

- **Desktop:** Windows, Mac, Linux (Chrome, Firefox, Edge, Safari)
- **Mobile:** iOS 14+, Android 8+ (Chrome, Safari)
- **Tablet:** iPad, Android tablets

## Technical

### What technologies does MANTIS use?

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **Backend:** Supabase (PostgreSQL + PostGIS)
- **Maps:** MapLibre GL
- **State:** TanStack Query
- **Routing:** TanStack Router

See [Tech Stack](./03-tech-stack.md) for complete details.

### Can MANTIS work offline?

Yes! MANTIS is designed offline-first. Officers can:
- Create infringements without internet
- Capture photos and GPS data
- Queue operations for sync
- Automatic background sync when online

### How is data secured?

MANTIS uses multiple security layers:
- **Row Level Security (RLS)** for data isolation
- **JWT authentication** with Supabase Auth
- **HTTPS/TLS encryption** for all communications
- **Role-based access control (RBAC)**
- **Audit logging** for all actions

See [Security Model](./23-security.md) for details.

### What browsers are supported?

| Browser | Minimum Version | PWA Support |
|---------|----------------|-------------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ⚠️ Limited |
| Edge | 90+ | ✅ Full |

### How does the GIS system work?

MANTIS uses PostGIS for location-aware operations:
- **Hierarchical location model** (Country → Office)
- **Point-in-polygon queries** for jurisdiction
- **Automatic location resolution** from GPS
- **Boundary management** for agencies

See [GIS & Locations](./05-gis-locations.md) for details.

## Usage

### How do I create an infringement?

As an officer:
1. Log in to MANTIS
2. Navigate to "Create Infringement"
3. Enter driver/vehicle details
4. Select offense type
5. Capture GPS location
6. Upload evidence photos
7. Submit

The system automatically assigns jurisdiction based on GPS.

### Can I edit an infringement after creation?

- **Officers:** Cannot edit after submission
- **Team Leaders:** Can update status and notes
- **Agency Admins:** Can modify most fields
- **Super Admins:** Full edit access

This ensures audit trail integrity.

### How do I work offline?

MANTIS automatically handles offline mode:
1. When offline, operations are queued locally
2. Data is stored in IndexedDB
3. When connection restored, sync happens automatically
4. You'll see a sync status indicator

### What payment methods are supported?

Currently planned:
- M-PAiSA
- MyCash
- Credit/Debit cards
- Post Fiji

Implementation varies by agency.

### How do citizens appeal infringements?

(Future feature)
1. Citizen logs in with license/reference number
2. Views infringement details
3. Submits appeal with reason and evidence
4. Agency admin reviews and decides
5. Citizen notified of decision

## Administration

### How do I add a new user?

As Agency Admin or Super Admin:
1. Go to "User Management"
2. Click "Add User"
3. Enter email and details
4. Assign role and team
5. User receives invitation email

### How do I create a new team?

As Agency Admin:
1. Go to "Teams"
2. Click "Create Team"
3. Enter team name
4. Assign location (optional)
5. Add team members

### How do I manage locations?

As Super Admin:
1. Go to "Locations"
2. View hierarchical tree
3. Add/edit locations
4. Upload boundary GeoJSON
5. Assign to agencies

### What are the user roles?

| Role | Description | Access Level |
|------|-------------|--------------|
| Super Admin | System-wide | All agencies |
| Agency Admin | Agency manager | Own agency |
| Team Leader | Team supervisor | Own team |
| Officer | Field officer | Own records |

See [Authentication](./06-auth.md) for details.

## Deployment

### How do I deploy MANTIS?

```bash
npm run deploy
```

This handles:
- Database schema push
- Production build
- Firebase deployment
- Git commit and push

See [Deployment Guide](./22-deployment.md) for details.

### What hosting is required?

- **Frontend:** Firebase Hosting (or any static host)
- **Backend:** Supabase (managed PostgreSQL)
- **Files:** Supabase Storage (S3-compatible)

### How much does it cost to run?

**Development (Free):**
- Supabase Free Tier: $0
- Firebase Free Tier: $0

**Production:**
- Supabase Pro: $25/month
- Firebase Hosting: ~$5-20/month
- Total: ~$30-50/month for small deployment

Scales with usage.

### Can I self-host?

Yes! Both Supabase and the frontend can be self-hosted:
- Supabase: Open source, self-hostable
- Frontend: Static files, host anywhere

## Development

### How do I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [Contributing Guide](../CONTRIBUTING.md) for details.

### How do I run locally?

```bash
# Clone repository
git clone https://github.com/your-org/mantis.git
cd mantis/website

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your Supabase credentials

# Start dev server
npm run dev
```

See [Getting Started](./01-getting-started.md) for details.

### How do I add a new feature?

1. Check existing issues/roadmap
2. Discuss with team (open issue)
3. Follow architectural patterns
4. Write tests
5. Update documentation
6. Submit PR

### How do I report a bug?

Open a GitHub issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs
- Device/browser info

## Data & Privacy

### How is personal data handled?

MANTIS follows data protection principles:
- **Minimal collection** (only necessary data)
- **Encryption** (at rest and in transit)
- **Access control** (role-based)
- **Audit logging** (all actions tracked)
- **Retention policies** (configurable)

### Can data be exported?

Yes, admins can export:
- Infringement reports (CSV, PDF)
- User lists
- Audit logs
- Analytics data

### How long is data retained?

Default retention (configurable):
- **Infringements:** 7 years
- **Audit logs:** 10 years
- **User accounts:** Until deactivated
- **Evidence files:** Same as infringement

### Is GDPR compliant?

MANTIS includes features for compliance:
- Right to access (view data)
- Right to rectification (edit data)
- Right to erasure (anonymize)
- Data portability (export)
- Consent management

Actual compliance depends on deployment and policies.

## Troubleshooting

### Why can't I log in?

Common causes:
- Email not confirmed
- Wrong credentials
- Session expired
- Account deactivated

See [Troubleshooting](./27-troubleshooting.md).

### Why is the map not showing?

Check:
- Internet connection (for tiles)
- Browser console for errors
- MapLibre CSS is imported
- Container has height set

### Why isn't offline mode working?

Verify:
- Service worker is registered
- HTTPS is enabled (required)
- Browser supports Service Workers
- Cache is not disabled

### Where can I get help?

- **Documentation:** Check relevant docs
- **GitHub Issues:** Report bugs
- **Community:** Discord/Slack
- **Support:** Email support team

## Roadmap

### What features are planned?

- Citizen portal (view/pay infringements)
- Mobile native apps (iOS/Android)
- AI-powered license plate recognition
- Advanced analytics dashboard
- Multi-language support (Fijian, Hindi)
- SMS notifications
- Payment gateway integration

### When will feature X be available?

Check the [GitHub roadmap](https://github.com/your-org/mantis/projects) for current progress and timelines.

### Can I request a feature?

Yes! Open a GitHub issue with:
- Feature description
- Use case
- Affected users
- Potential implementation

---

**Have a question not listed here?** Open an issue or contact the development team.
