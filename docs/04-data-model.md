# Data Model

MANTIS uses a normalized relational database schema designed for multi-tenancy, GIS operations, and strict data isolation.

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Agencies   │────<│    Teams    │────<│    Users    │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Locations  │     │ Infringements│────<│Evidence Files│
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │
       │                    ├────────┬─────────┐
       │                    │        │         │
       ▼                    ▼        ▼         ▼
┌─────────────┐     ┌──────────┐ ┌────────┐ ┌────────┐
│  Hierarchy  │     │ Payments │ │Appeals │ │ Audit  │
│   (Self)    │     └──────────┘ └────────┘ │  Logs  │
└─────────────┘                              └────────┘
       ▲
       │
┌─────────────┐     ┌─────────────┐
│   Drivers   │     │  Vehicles   │
└─────────────┘     └─────────────┘
```

## Core Tables

### Agencies

Represents enforcement agencies (LTA, Police, Municipal Councils).

```typescript
interface Agency {
  id: string;              // UUID primary key
  name: string;            // "Suva City Council", "LTA"
  code: string;            // "SCC", "LTA", "FJPOL" (unique)
  type: AgencyType;        // "National" | "Municipal" | "Police"
  created_at: Date;
}
```

**Business Rules:**
- Each agency operates independently
- Agency code must be unique
- Cannot be deleted if teams exist

**Example Data:**
```sql
INSERT INTO agencies (name, code, type) VALUES
  ('Land Transport Authority', 'LTA', 'National'),
  ('Suva City Council', 'SCC', 'Municipal'),
  ('Fiji Police Force', 'FJPOL', 'Police');
```

### Locations

Hierarchical GIS-enabled location structure.

```typescript
interface Location {
  id: string;              // UUID primary key
  type: string;            // "country", "division", "province", "municipal", "ward", "office"
  name: string;            // Location name
  parent_id: string | null;// Parent location (self-reference)
  agency_id: string | null;// Optional agency assignment
  geom: string | null;     // GeoJSON (Point or Polygon)
  created_at: Date;
}
```

**Hierarchy Example:**
```
Fiji (Country)
 └─ Central Division
     └─ Rewa Province
         └─ Suva Municipal
             └─ Ward 1
                 └─ Suva Central Office
```

**GeoJSON Format:**
```json
{
  "type": "Point",
  "coordinates": [178.4419, -18.1416]
}
```

**Business Rules:**
- Root location (country) has `parent_id = null`
- Each location can have multiple children
- PostGIS geometry stored as text (GeoJSON)
- Boundaries must be valid (no self-intersections)

### Teams

Groups of officers within an agency.

```typescript
interface Team {
  id: string;              // UUID primary key
  agency_id: string;       // Foreign key to agencies
  location_id: string | null; // Optional location assignment
  name: string;            // "Suva Parking Enforcement"
  created_at: Date;
}
```

**Business Rules:**
- Must belong to an agency
- Can be assigned to a specific location
- Cannot be deleted if users exist
- Name must be unique within agency

### Users

Officers, admins, and other system users.

```typescript
interface User {
  id: string;              // UUID (matches Supabase auth.users.id)
  agency_id: string;       // Foreign key to agencies
  team_id: string | null;  // Optional team assignment
  role: Role;              // User role
  display_name: string | null;
  created_at: Date;
}

type Role = 
  | "Super Admin"
  | "Agency Admin"
  | "Team Leader"
  | "Officer"
  | "Citizen"
  | "Government Official";
```

**Role Hierarchy:**
```
Super Admin (full system access)
  └─ Agency Admin (agency-wide access)
      └─ Team Leader (team management)
          └─ Officer (field operations)
```

**Business Rules:**
- ID matches Supabase `auth.users.id`
- Must belong to an agency
- Role determines permissions (enforced by RLS)
- Super Admins can access all agencies

### Drivers

Registered drivers in the system.

```typescript
interface Driver {
  id: string;              // UUID primary key
  license_number: string;  // Unique license number
  full_name: string;
  address: string | null;
  dob: Date | null;
  phone: string | null;
  email: string | null;
  created_at: Date;
}
```

**Business Rules:**
- License number must be unique
- Used for infringement assignment
- Can be created on-the-fly during infringement

### Vehicles

Registered vehicles.

```typescript
interface Vehicle {
  id: string;              // UUID primary key
  registration: string;    // Unique registration number
  make: string | null;
  model: string | null;
  color: string | null;
  owner_id: string | null; // Foreign key to drivers
  created_at: Date;
}
```

**Business Rules:**
- Registration must be unique
- Can be linked to a driver (owner)
- Created during infringement if not exists

### Infringements

Core traffic violation records.

```typescript
interface Infringement {
  id: string;              // UUID primary key
  
  // WHO
  driver_id: string;       // Foreign key to drivers
  vehicle_id: string;      // Foreign key to vehicles
  issued_by: string;       // Foreign key to users (officer)
  
  // WHAT
  offense_code: string;    // "PARK-01", "SPEED-02"
  offense_description: string;
  fine_amount: number;     // In cents (FJD)
  
  // WHERE
  location_id: string;     // Foreign key to locations
  gps_coordinates: string | null; // GeoJSON Point
  
  // WHEN
  occurred_at: Date;
  issued_at: Date;         // Defaults to now
  
  // ORGANIZATIONAL
  agency_id: string;       // Foreign key to agencies
  team_id: string;         // Foreign key to teams
  
  // STATUS
  status: string;          // "pending", "paid", "appealed", "cancelled"
  
  created_at: Date;
}
```

**Status Flow:**
```
pending → paid (via payment)
pending → appealed (via appeal)
pending → cancelled (by admin)
appealed → paid / cancelled (after review)
```

**Business Rules:**
- Officer must belong to same agency/team
- GPS coordinates validated against location boundaries
- Fine amount must be positive
- Cannot be deleted (audit trail)

### Evidence Files

Photos and videos linked to infringements.

```typescript
interface EvidenceFile {
  id: string;              // UUID primary key
  infringement_id: string; // Foreign key to infringements
  file_path: string;       // Supabase Storage path
  file_type: string;       // "image/jpeg", "video/mp4"
  created_at: Date;
}
```

**File Path Format:**
```
evidence/{agency_id}/{infringement_id}/{file_id}.{ext}
```

**Business Rules:**
- Files stored in Supabase Storage
- Access controlled by RLS
- Supports images and videos only
- Maximum 10 files per infringement

### Payments

Payment records for infringements.

```typescript
interface Payment {
  id: string;              // UUID primary key
  infringement_id: string; // Foreign key to infringements
  amount: number;          // In cents
  method: string;          // "mpaisa", "mycash", "card", "postfiji"
  reference: string | null;// Payment gateway reference
  paid_at: Date;           // Payment timestamp
}
```

**Supported Payment Methods:**
- M-PAiSA (mobile money)
- MyCash (mobile money)
- Credit/Debit Card
- Post Fiji

**Business Rules:**
- Amount must match or exceed fine amount
- Creates audit log entry
- Updates infringement status to "paid"
- Reference stored for reconciliation

### Appeals

Citizen appeals for infringements.

```typescript
interface Appeal {
  id: string;              // UUID primary key
  infringement_id: string; // Foreign key to infringements
  submitted_by: string | null; // Foreign key to drivers
  reason: string;          // Appeal explanation
  evidence_path: string | null; // Supporting evidence
  status: string;          // "pending", "approved", "rejected"
  created_at: Date;
}
```

**Status Flow:**
```
pending → approved (infringement cancelled)
pending → rejected (infringement stands)
```

**Business Rules:**
- Updates infringement status to "appealed"
- Can upload supporting evidence
- Reviewed by Agency Admin or higher
- Creates audit log entry

### Audit Logs

System-wide activity tracking.

```typescript
interface AuditLog {
  id: string;              // UUID primary key
  user_id: string | null;  // Foreign key to users
  action: string;          // "infringement_created", "payment_processed"
  metadata: object | null; // JSON details
  created_at: Date;
}
```

**Tracked Actions:**
- Infringement creation/update
- Payment processing
- Appeal submission/decision
- User role changes
- Agency/team changes

**Business Rules:**
- Immutable (cannot be deleted)
- Retained for compliance
- Searchable by admin users

## Indexes

Critical indexes for performance:

```sql
-- Infringements
CREATE INDEX idx_infringements_agency_id ON infringements(agency_id);
CREATE INDEX idx_infringements_status ON infringements(status);
CREATE INDEX idx_infringements_issued_at ON infringements(issued_at);

-- Locations (PostGIS spatial index)
CREATE INDEX idx_locations_geom ON locations USING GIST(geom);

-- Drivers
CREATE INDEX idx_drivers_license ON drivers(license_number);

-- Vehicles
CREATE INDEX idx_vehicles_registration ON vehicles(registration);
```

## Data Size Estimates

For a medium-sized agency (500 officers, 50,000 infringements/year):

| Table | Rows/Year | Storage |
|-------|-----------|---------|
| Agencies | 10 | <1 MB |
| Teams | 50 | <1 MB |
| Users | 500 | <1 MB |
| Drivers | 20,000 | 10 MB |
| Vehicles | 15,000 | 8 MB |
| Infringements | 50,000 | 200 MB |
| Evidence Files | 100,000 | 50 GB |
| Payments | 40,000 | 20 MB |
| Appeals | 5,000 | 10 MB |
| Audit Logs | 200,000 | 100 MB |

**Total:** ~50 GB/year (mostly evidence files)

---

**Next:** [GIS & Locations](./05-gis-locations.md)
