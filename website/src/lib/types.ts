import type { Agency, Team } from "./supabase/schema";

export type UserRole = "DEV Engineer" | "App Admin" | "Super Admin" | "Tenant Admin" | "Team Leader" | "Officer" | "Guest";

export interface UserMetaData {
    role: UserRole;
    agency_id?: Agency["id"];
    team_id?: Team["id"];
}