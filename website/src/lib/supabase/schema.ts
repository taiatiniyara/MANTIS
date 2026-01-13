import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------
// Agencies (LTA, Police, Municipal Councils, etc.)
// -----------------------------------------------------

export type AgencyType = "National" | "Municipal" | "Police";

export const agencies = pgTable("agencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),          // e.g., "Suva City Council"
  code: text("code").notNull().unique(), // e.g., "SCC", "LTA", "FJPOL"
  type: text("type").notNull().$type<AgencyType>(),          // national, municipal, police
  createdAt: timestamp("created_at").defaultNow(),
});
export type Agency = typeof agencies.$inferSelect;
export type NewAgency = typeof agencies.$inferInsert;

// -----------------------------------------------------
// Hierarchical GIS Locations
// Supports unlimited depth: country → division → province → municipal → ward → office
// -----------------------------------------------------
export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),

  type: text("type").notNull(), // country, division, province, municipal, ward, station, office

  name: text("name").notNull(),

  parent_id: uuid("parent_id"),

  // Optional: which agency this location belongs to
  agency_id: uuid("agency_id").references(() => agencies.id),

  // GeoJSON string for boundaries (Polygon) or points (Point)
  geom: text("geom"),

  createdAt: timestamp("created_at").defaultNow(),
});
export type Location = typeof locations.$inferSelect;
export type NewLocation = typeof locations.$inferInsert;

// -----------------------------------------------------
// Teams (inside agencies, optionally tied to a location)
// -----------------------------------------------------
export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),

  agency_id: uuid("agency_id")
    .notNull()
    .references(() => agencies.id),

  location_id: uuid("location_id").references(() => locations.id),

  name: text("name").notNull(), // e.g., "Suva Parking Enforcement", "Traffic West"

  createdAt: timestamp("created_at").defaultNow(),
});
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;

// -----------------------------------------------------
// Users (officers, supervisors, admins)
// -----------------------------------------------------

export type Role = "Super Admin" | "Agency Admin" | "Team Leader" | "Officer" | "Citizen" | "Government Official";
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Supabase auth.user.id

  agency_id: uuid("agency_id")
    .notNull()
    .references(() => agencies.id),

  team_id: uuid("team_id").references(() => teams.id),

  role: text("role").notNull().$type<Role>(), // officer, supervisor, finance, admin, super_admin

  display_name: text("display_name"),

  createdAt: timestamp("created_at").defaultNow(),
});
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// -----------------------------------------------------
// Drivers
// -----------------------------------------------------
export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().defaultRandom(),
  licenseNumber: text("license_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  address: text("address"),
  dateOfBirth: timestamp("dob"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;

// -----------------------------------------------------
// Vehicles
// -----------------------------------------------------
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  plateNumber: text("plate_number").notNull().unique(),
  make: text("make"),
  model: text("model"),
  color: text("color"),
  owner_id: uuid("owner_id").references(() => drivers.id),
  createdAt: timestamp("created_at").defaultNow(),
});
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;

// -----------------------------------------------------
// Infringements (core record)
// -----------------------------------------------------
export const infringements = pgTable("infringements", {
  id: uuid("id").primaryKey().defaultRandom(),

  agency_id: uuid("agency_id")
    .notNull()
    .references(() => agencies.id),

  team_id: uuid("team_id").references(() => teams.id),

  officer_id: uuid("officer_id")
    .notNull()
    .references(() => users.id),

  driver_id: uuid("driver_id").references(() => drivers.id),
  vehicle_id: uuid("vehicle_id").references(() => vehicles.id),

  offenceCode: text("offence_code").notNull(),
  description: text("description"),
  fineAmount: integer("fine_amount").notNull(),

  // Where the offence occurred (GeoJSON Point)
  location: text("location"),

  // Jurisdiction resolved via GIS
  jurisdictionLocation_id: uuid("jurisdiction_location_id").references(
    () => locations.id
  ),

  issuedAt: timestamp("issued_at").defaultNow(),
  status: text("status").notNull().default("pending"),
});
export type Infringement = typeof infringements.$inferSelect;
export type NewInfringement = typeof infringements.$inferInsert;

// -----------------------------------------------------
// Evidence Files
// -----------------------------------------------------
export const evidenceFiles = pgTable("evidence_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  infringement_id: uuid("infringement_id")
    .notNull()
    .references(() => infringements.id),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export type EvidenceFile = typeof evidenceFiles.$inferSelect;
export type NewEvidenceFile = typeof evidenceFiles.$inferInsert;

// -----------------------------------------------------
// Payments
// -----------------------------------------------------
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  infringement_id: uuid("infringement_id")
    .notNull()
    .references(() => infringements.id),
  amount: integer("amount").notNull(),
  method: text("method").notNull(), // mpaisa, mycash, card, postfiji
  reference: text("reference"),
  paidAt: timestamp("paid_at").defaultNow(),
});
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

// -----------------------------------------------------
// Appeals
// -----------------------------------------------------
export const appeals = pgTable("appeals", {
  id: uuid("id").primaryKey().defaultRandom(),
  infringement_id: uuid("infringement_id")
    .notNull()
    .references(() => infringements.id),
  submittedBy: uuid("submitted_by").references(() => drivers.id),
  reason: text("reason").notNull(),
  evidencePath: text("evidence_path"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type Appeal = typeof appeals.$inferSelect;
export type NewAppeal = typeof appeals.$inferInsert;

// -----------------------------------------------------
// Audit Logs
// -----------------------------------------------------
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;

export const tables = {
  agencies,
  locations,
  teams,
  users,
  drivers,
  vehicles,
  infringements,
  evidenceFiles,
  payments,
  appeals,
  auditLogs,
}

export const tableNames = {
  agencies: "agencies",
  locations: "locations",
  teams: "teams",
  users: "users",
  drivers: "drivers",
  vehicles: "vehicles",
  infringements: "infringements",
  evidenceFiles: "evidence_files",
  payments: "payments",
  appeals: "appeals",
  auditLogs: "audit_logs",
};