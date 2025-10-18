// Database types for MANTIS
// Generated from Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          agency_id: string | null
          type: 'division' | 'station' | 'post' | 'region' | 'office' | 'council' | 'department' | 'zone'
          name: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agency_id?: string | null
          type: 'division' | 'station' | 'post' | 'region' | 'office' | 'council' | 'department' | 'zone'
          name: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string | null
          type?: 'division' | 'station' | 'post' | 'region' | 'office' | 'council' | 'department' | 'zone'
          name?: string
          parent_id?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          agency_id: string | null
          role: 'super_admin' | 'agency_admin' | 'officer'
          position: string | null
          location_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          agency_id?: string | null
          role: 'super_admin' | 'agency_admin' | 'officer'
          position?: string | null
          location_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string | null
          role?: 'super_admin' | 'agency_admin' | 'officer'
          position?: string | null
          location_id?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          agency_id: string | null
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          agency_id?: string | null
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string | null
          name?: string
          created_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          agency_id: string | null
          name: string
          description: string | null
          location_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agency_id?: string | null
          name: string
          description?: string | null
          location_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agency_id?: string | null
          name?: string
          description?: string | null
          location_id?: string | null
          created_at?: string
        }
      }
      team_routes: {
        Row: {
          team_id: string
          route_id: string
        }
        Insert: {
          team_id: string
          route_id: string
        }
        Update: {
          team_id?: string
          route_id?: string
        }
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
        }
        Insert: {
          team_id: string
          user_id: string
        }
        Update: {
          team_id?: string
          user_id?: string
        }
      }
      infringement_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      infringement_types: {
        Row: {
          id: string
          category_id: string
          code: string
          name: string
          description: string | null
          fine_amount: number | null
          demerit_points: number | null
          gl_code: string
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          code: string
          name: string
          description?: string | null
          fine_amount?: number | null
          demerit_points?: number | null
          gl_code: string
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          code?: string
          name?: string
          description?: string | null
          fine_amount?: number | null
          demerit_points?: number | null
          gl_code?: string
          created_at?: string
        }
      }
      infringements: {
        Row: {
          id: string
          officer_id: string | null
          agency_id: string | null
          team_id: string | null
          route_id: string | null
          type_id: string | null
          vehicle_id: string | null
          location_id: string | null
          notes: string | null
          issued_at: string
          created_at: string
        }
        Insert: {
          id?: string
          officer_id?: string | null
          agency_id?: string | null
          team_id?: string | null
          route_id?: string | null
          type_id?: string | null
          vehicle_id?: string | null
          location_id?: string | null
          notes?: string | null
          issued_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          officer_id?: string | null
          agency_id?: string | null
          team_id?: string | null
          route_id?: string | null
          type_id?: string | null
          vehicle_id?: string | null
          location_id?: string | null
          notes?: string | null
          issued_at?: string
          created_at?: string
        }
      }
    }
    Views: {
      finance_reports: {
        Row: {
          agency_id: string | null
          agency_name: string | null
          gl_code: string | null
          infringement_code: string | null
          infringement_name: string | null
          infringement_count: number | null
          total_fines: number | null
          first_infringement: string | null
          last_infringement: string | null
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}
