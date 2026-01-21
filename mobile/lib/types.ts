/**
 * MANTIS Mobile App - TypeScript Types
 * 
 * These types match the Supabase database schema defined in:
 * website/src/lib/supabase/schema.ts
 * 
 * Keep these types in sync with the database schema.
 */

// -----------------------------------------------------
// Database Type (for Supabase Client)
// -----------------------------------------------------

export type Database = {
  public: {
    Tables: {
      agencies: {
        Row: Agency;
        Insert: NewAgency;
        Update: Partial<NewAgency>;
      };
      locations: {
        Row: Location;
        Insert: NewLocation;
        Update: Partial<NewLocation>;
      };
      teams: {
        Row: Team;
        Insert: NewTeam;
        Update: Partial<NewTeam>;
      };
      users: {
        Row: User;
        Insert: NewUser;
        Update: Partial<NewUser>;
      };
      drivers: {
        Row: Driver;
        Insert: NewDriver;
        Update: Partial<NewDriver>;
      };
      vehicles: {
        Row: Vehicle;
        Insert: NewVehicle;
        Update: Partial<NewVehicle>;
      };
      offence_categories: {
        Row: OffenceCategory;
        Insert: Omit<OffenceCategory, 'id' | 'created_at'>;
        Update: Partial<Omit<OffenceCategory, 'id' | 'created_at'>>;
      };
      offences: {
        Row: Offence;
        Insert: NewOffence;
        Update: Partial<NewOffence>;
      };
      infringements: {
        Row: Infringement;
        Insert: NewInfringement;
        Update: Partial<NewInfringement>;
      };
      evidence_files: {
        Row: EvidenceFile;
        Insert: NewEvidenceFile;
        Update: Partial<NewEvidenceFile>;
      };
      payments: {
        Row: Payment;
        Insert: NewPayment;
        Update: Partial<NewPayment>;
      };
      appeals: {
        Row: Appeal;
        Insert: NewAppeal;
        Update: Partial<NewAppeal>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: NewAuditLog;
        Update: Partial<NewAuditLog>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      agency_type: AgencyType;
      role: Role;
      infringement_status: InfringementStatus;
      payment_method: PaymentMethod;
      appeal_status: AppealStatus;
      offence_severity: OffenceSeverity;
      location_type: LocationType;
    };
  };
};

// -----------------------------------------------------
// Enums and Constants
// -----------------------------------------------------

export type AgencyType = "National" | "Municipal" | "Police";

export type Role = 
  | "Super Admin" 
  | "Agency Admin" 
  | "Team Leader" 
  | "Officer" 
  | "Citizen" 
  | "Government Official";

export type InfringementStatus = 
  | "draft"           // Created but not submitted
  | "pending"         // Submitted, awaiting review
  | "approved"        // Approved by team leader
  | "paid"            // Payment received
  | "appealed"        // Under appeal
  | "appeal_approved" // Appeal successful
  | "appeal_rejected" // Appeal rejected
  | "cancelled"       // Cancelled/voided
  | "overdue";        // Payment overdue

export type PaymentMethod = 
  | "mpaisa" 
  | "mycash" 
  | "card" 
  | "postfiji" 
  | "cash" 
  | "bank_transfer";

export type AppealStatus = 
  | "pending" 
  | "reviewing" 
  | "approved" 
  | "rejected";

export type OffenceSeverity = 
  | "minor" 
  | "serious" 
  | "critical";

export type LocationType = 
  | "country" 
  | "division" 
  | "province" 
  | "municipal" 
  | "ward" 
  | "station" 
  | "office";

// -----------------------------------------------------
// Database Tables
// -----------------------------------------------------

export interface Agency {
  id: string;
  name: string;
  code: string;
  type: AgencyType;
  created_at: Date | string;
}

export interface Location {
  id: string;
  type: LocationType;
  name: string;
  parent_id: string | null;
  agency_id: string | null;
  geom: string | null; // GeoJSON string
  created_at: Date | string;
}

export interface Team {
  id: string;
  agency_id: string;
  location_id: string | null;
  name: string;
  created_at: Date | string;
}

export interface User {
  id: string;
  agency_id: string;
  team_id: string | null;
  role: Role;
  display_name: string | null;
  created_at: Date | string;
}

export interface Driver {
  id: string;
  license_number: string;
  full_name: string;
  address: string | null;
  dob: Date | string | null;
  created_at: Date | string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  make: string | null;
  model: string | null;
  color: string | null;
  owner_id: string | null;
  created_at: Date | string;
}

export interface OffenceCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: Date | string;
}

export interface Offence {
  id: string;
  code: string;
  category_id: string | null;
  name: string;
  description: string | null;
  agency_type: string;
  agency_id: string | null;
  fixed_penalty: number;
  severity: OffenceSeverity;
  requires_evidence: boolean;
  requires_location: boolean;
  active: boolean;
  created_at: Date | string;
}

export interface Infringement {
  id: string;
  agency_id: string;
  team_id: string | null;
  officer_id: string;
  tin: string | null;
  driver_id: string | null;
  vehicle_id: string | null;
  offence_code: string;
  description: string | null;
  fine_amount: number;
  location: string | null; // GeoJSON Point
  jurisdiction_location_id: string | null;
  issued_at: Date | string;
  status: InfringementStatus;
}

export interface EvidenceFile {
  id: string;
  infringement_id: string;
  file_path: string;
  file_type: string;
  created_at: Date | string;
}

export interface Payment {
  id: string;
  infringement_id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paid_at: Date | string;
}

export interface Appeal {
  id: string;
  infringement_id: string;
  submitted_by: string | null;
  reason: string;
  evidence_path: string | null;
  status: AppealStatus;
  created_at: Date | string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  metadata: any; // JSON
  created_at: Date | string;
}

// -----------------------------------------------------
// Insert Types (for creating new records)
// -----------------------------------------------------

export type NewAgency = Omit<Agency, 'id' | 'created_at'>;
export type NewLocation = Omit<Location, 'id' | 'created_at'>;
export type NewTeam = Omit<Team, 'id' | 'created_at'>;
export type NewUser = Omit<User, 'created_at'>;
export type NewDriver = Omit<Driver, 'id' | 'created_at'>;
export type NewVehicle = Omit<Vehicle, 'id' | 'created_at'>;
export type NewOffence = Omit<Offence, 'id' | 'created_at'>;
export type NewInfringement = Omit<Infringement, 'id' | 'issued_at'> & { tin: string };
export type NewEvidenceFile = Omit<EvidenceFile, 'id' | 'created_at'>;
export type NewPayment = Omit<Payment, 'id' | 'paid_at'>;
export type NewAppeal = Omit<Appeal, 'id' | 'created_at'>;
export type NewAuditLog = Omit<AuditLog, 'id' | 'created_at'>;

// -----------------------------------------------------
// Joined/Extended Types (for queries with relations)
// -----------------------------------------------------

export interface InfringementWithDetails extends Infringement {
  driver?: Driver;
  vehicle?: Vehicle;
  offence?: Offence;
  officer?: User;
  team?: Team;
  agency?: Agency;
  jurisdiction?: Location;
  evidence_files?: EvidenceFile[];
  payments?: Payment[];
  appeals?: Appeal[];
}

export interface UserWithRelations extends User {
  agency?: Agency;
  team?: Team;
}

export interface TeamWithRelations extends Team {
  agency?: Agency;
  location?: Location;
  members?: User[];
}

// -----------------------------------------------------
// GeoJSON Types
// -----------------------------------------------------

export interface GeoJSONPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: [number, number][][]; // Array of rings
}

export type GeoJSON = GeoJSONPoint | GeoJSONPolygon;

// -----------------------------------------------------
// Mobile-specific Types
// -----------------------------------------------------

export interface LocalInfringement {
  id: string;
  status: 'draft' | 'pending_sync' | 'synced';
  data: Partial<Infringement>;
  photos: LocalPhoto[];
  created_at: Date;
  modified_at: Date;
  synced_at: Date | null;
}

export interface LocalPhoto {
  id: string;
  uri: string;              // Local file path
  infringement_id: string;
  uploaded: boolean;
  upload_url: string | null;
  file_type: string;        // 'image/jpeg', 'image/png', etc.
  created_at: Date;
}

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
  retries: number;
  last_error?: string;
}

export interface SyncQueue {
  items: SyncQueueItem[];
  last_sync: Date | null;
  pending_count: number;
}

export interface AppSettings {
  offline_mode: boolean;
  auto_sync: boolean;
  camera_quality: 'low' | 'medium' | 'high';
  gps_accuracy: 'low' | 'medium' | 'high';
  map_cache_enabled: boolean;
  notifications_enabled: boolean;
  dark_mode: boolean;
}

export interface NetworkStatus {
  isConnected: boolean;
  type: string | null; // 'wifi', 'cellular', etc.
  isInternetReachable: boolean | null;
}

// -----------------------------------------------------
// Form Types
// -----------------------------------------------------

export interface InfringementFormData {
  // Offence details
  offence_code: string;
  description?: string;
  
  // Driver details
  driver_license_number: string;
  driver_full_name: string;
  driver_address?: string;
  driver_dob?: Date;
  
  // Vehicle details
  vehicle_plate_number: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  
  // Location
  location?: GeoJSONPoint;
  location_description?: string;
  
  // Evidence
  photos: LocalPhoto[];
  
  // Metadata
  issued_at: Date;
}

export interface DriverSearchResult {
  id: string;
  license_number: string;
  full_name: string;
  address: string | null;
  recent_infringements_count: number;
}

export interface VehicleSearchResult {
  id: string;
  plate_number: string;
  make: string | null;
  model: string | null;
  color: string | null;
  owner_name: string | null;
  recent_infringements_count: number;
}

// -----------------------------------------------------
// API Response Types
// -----------------------------------------------------

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// -----------------------------------------------------
// Analytics Types (Team Leader)
// -----------------------------------------------------

export interface TeamStats {
  total_infringements: number;
  today_infringements: number;
  week_infringements: number;
  month_infringements: number;
  pending_approvals: number;
  total_fines_issued: number;
  total_fines_collected: number;
  active_officers: number;
}

export interface OfficerPerformance {
  officer_id: string;
  officer_name: string;
  total_infringements: number;
  approved_infringements: number;
  rejected_infringements: number;
  total_fines: number;
  average_daily: number;
}

// -----------------------------------------------------
// Table Names (for Supabase queries)
// -----------------------------------------------------

export const TableNames = {
  AGENCIES: 'agencies',
  LOCATIONS: 'locations',
  TEAMS: 'teams',
  USERS: 'users',
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  OFFENCE_CATEGORIES: 'offence_categories',
  OFFENCES: 'offences',
  INFRINGEMENTS: 'infringements',
  EVIDENCE_FILES: 'evidence_files',
  PAYMENTS: 'payments',
  APPEALS: 'appeals',
  AUDIT_LOGS: 'audit_logs',
} as const;

// -----------------------------------------------------
// Storage Keys (AsyncStorage)
// -----------------------------------------------------

export const StorageKeys = {
  AUTH_TOKEN: '@mantis:auth:token',
  USER_PROFILE: '@mantis:user:profile',
  INFRINGEMENTS: '@mantis:infringements',
  SYNC_QUEUE: '@mantis:sync:queue',
  SETTINGS: '@mantis:settings',
  MAP_CACHE: '@mantis:map:cache',
  LAST_SYNC: '@mantis:sync:last',
  OFFLINE_MODE: '@mantis:offline:mode',
} as const;

// -----------------------------------------------------
// Constants
// -----------------------------------------------------

export const Constants = {
  MAX_PHOTO_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_PHOTOS_PER_INFRINGEMENT: 5,
  SYNC_RETRY_LIMIT: 3,
  SYNC_RETRY_DELAY: 5000, // 5 seconds
  GPS_ACCURACY_THRESHOLD: 50, // meters
  MAP_DEFAULT_ZOOM: 15,
  MAP_DEFAULT_CENTER: {
    latitude: -18.1416,
    longitude: 178.4419,
  }, // Suva, Fiji
} as const;
