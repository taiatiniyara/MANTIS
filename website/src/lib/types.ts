import type { Agency, Team } from "./supabase/schema";

export type UserRole = "Super Admin" | "Agency Admin" | "Team Leader" | "Officer" | "Guest";

export interface UserMetaData {
    role: UserRole;
    agencyId?: Agency["id"];
    teamId?: Team["id"];
}