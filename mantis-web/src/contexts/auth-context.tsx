import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"
import type { PropsWithChildren } from "react"
import { supabase } from "@/lib/supabase"

export type UserRole = "officer" | "agency_admin" | "central_admin" | "citizen"

export type UserProfile = {
  id: string
  role: UserRole
  displayName: string
  agencyId: string | null
  agencyName: string | null
  driverLicenceNumber: string | null
  phone: string | null
  active: boolean
}

export type AuthContextType = {
  user: SupabaseUser | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  hasRole: (roles: UserRole | UserRole[]) => boolean
  isOfficer: boolean
  isAgencyAdmin: boolean
  isCentralAdmin: boolean
  isCitizen: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from the users table
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select(
          `
          id,
          role,
          display_name,
          agency_id,
          driver_licence_number,
          phone,
          active,
          agencies:agency_id (
            name
          )
        `
        )
        .eq("id", userId)
        .single()

      if (error) throw error

      return {
        id: data.id,
        role: data.role as UserRole,
        displayName: data.display_name,
        agencyId: data.agency_id,
        agencyName: (data.agencies as any)?.name || null,
        driverLicenceNumber: data.driver_licence_number,
        phone: data.phone,
        active: data.active,
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id).then(setProfile)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id)
        setProfile(userProfile)

        // Log the login action
        await supabase.from("audit_logs").insert({
          actor_user_id: data.user.id,
          action: "LOGIN",
          entity_type: "user",
          entity_id: data.user.id,
          new_data: { display_name: userProfile?.displayName },
        })
      }

      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      // Log the logout action before signing out
      if (user) {
        await supabase.from("audit_logs").insert({
          actor_user_id: user.id,
          action: "LOGOUT",
          entity_type: "user",
          entity_id: user.id,
        })
      }

      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!profile) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(profile.role)
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    hasRole,
    isOfficer: profile?.role === "officer",
    isAgencyAdmin: profile?.role === "agency_admin",
    isCentralAdmin: profile?.role === "central_admin",
    isCitizen: profile?.role === "citizen",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
