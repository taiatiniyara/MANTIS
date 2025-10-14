import { supabase } from "@/lib/supabase"

export type InfringementStatus = "issued" | "paid" | "voided" | "disputed"

export interface Infringement {
  id: string
  infringement_number: string
  issuing_agency_id: string
  officer_user_id: string
  vehicle_id: string
  driver_licence_number: string | null
  offence_id: string
  fine_amount: number
  status: InfringementStatus
  location: { lat: number; lng: number } | null
  location_description: string | null
  notes: string | null
  evidence_urls: string[]
  issued_at: string
  created_at: string
  updated_at: string
  // Joined data
  vehicle?: {
    reg_number: string
    make?: string | null
    model?: string | null
    year?: number | null
    color?: string | null
  }
  offence?: {
    code: string
    description: string
    category?: string
  }
  agency?: {
    name: string
    code: string
  }
  officer?: {
    display_name: string
  }
}

export interface Vehicle {
  id: string
  reg_number: string
  make?: string | null
  model?: string | null
  year?: number | null
  color?: string | null
}

export interface Offence {
  id: string
  code: string
  description: string
  base_fine_amount: number
  category?: string
}

export interface CreateInfringementData {
  vehicle_reg_number: string
  offence_id: string
  driver_licence_number?: string
  location_description?: string
  notes?: string
  latitude?: number
  longitude?: number
}

/**
 * Search for a vehicle by registration number
 */
export async function searchVehicle(regNumber: string): Promise<Vehicle | null> {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("reg_number", regNumber.toUpperCase().trim())
    .eq("active", true)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null
    }
    throw new Error(`Failed to search vehicle: ${error.message}`)
  }

  return data
}

/**
 * Create a new vehicle if it doesn't exist
 */
export async function createVehicle(regNumber: string): Promise<Vehicle> {
  const { data, error } = await supabase
    .from("vehicles")
    .insert({
      reg_number: regNumber.toUpperCase().trim(),
      active: true,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create vehicle: ${error.message}`)
  }

  return data
}

/**
 * Get all active offences
 */
export async function getOffences(): Promise<Offence[]> {
  const { data, error } = await supabase
    .from("offences")
    .select("*")
    .eq("active", true)
    .order("code")

  if (error) {
    throw new Error(`Failed to fetch offences: ${error.message}`)
  }

  return data
}

/**
 * Get a single offence by ID
 */
export async function getOffence(id: string): Promise<Offence> {
  const { data, error } = await supabase
    .from("offences")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch offence: ${error.message}`)
  }

  return data
}

/**
 * Create a new infringement
 */
export async function createInfringement(
  data: CreateInfringementData
): Promise<Infringement> {
  // First, get or create the vehicle
  let vehicle = await searchVehicle(data.vehicle_reg_number)
  if (!vehicle) {
    vehicle = await createVehicle(data.vehicle_reg_number)
  }

  // Get the offence to retrieve the base fine amount
  const offence = await getOffence(data.offence_id)

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // Get user profile to get agency_id
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("agency_id")
    .eq("id", user.id)
    .single()

  if (profileError || !profile?.agency_id) {
    throw new Error("User profile or agency not found")
  }

  // Create the infringement
  const infringementData: any = {
    issuing_agency_id: profile.agency_id,
    officer_user_id: user.id,
    vehicle_id: vehicle.id,
    offence_id: data.offence_id,
    fine_amount: offence.base_fine_amount,
    status: "issued",
    driver_licence_number: data.driver_licence_number || null,
    location_description: data.location_description || null,
    notes: data.notes || null,
  }

  // Add location if provided
  if (data.latitude && data.longitude) {
    infringementData.location = `POINT(${data.longitude} ${data.latitude})`
  }

  const { data: infringement, error } = await supabase
    .from("infringements")
    .insert(infringementData)
    .select(
      `
      *,
      vehicle:vehicles(*),
      offence:offences(*),
      agency:agencies(*),
      officer:users(display_name)
    `
    )
    .single()

  if (error) {
    throw new Error(`Failed to create infringement: ${error.message}`)
  }

  return infringement
}

/**
 * Get infringements with filters
 */
export async function getInfringements(filters?: {
  status?: InfringementStatus
  agency_id?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ infringements: Infringement[]; total: number }> {
  let query = supabase
    .from("infringements")
    .select(
      `
      *,
      vehicle:vehicles(*),
      offence:offences(*),
      agency:agencies(*),
      officer:users(display_name)
    `,
      { count: "exact" }
    )
    .order("issued_at", { ascending: false })

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.agency_id) {
    query = query.eq("issuing_agency_id", filters.agency_id)
  }

  if (filters?.search) {
    // Search in infringement_number, vehicle reg, or driver licence
    query = query.or(
      `infringement_number.ilike.%${filters.search}%,driver_licence_number.ilike.%${filters.search}%`
    )
  }

  // Pagination
  const limit = filters?.limit || 50
  const offset = filters?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch infringements: ${error.message}`)
  }

  return {
    infringements: data || [],
    total: count || 0,
  }
}

/**
 * Get a single infringement by ID
 */
export async function getInfringement(id: string): Promise<Infringement> {
  const { data, error } = await supabase
    .from("infringements")
    .select(
      `
      *,
      vehicle:vehicles(*),
      offence:offences(*),
      agency:agencies(*),
      officer:users(display_name)
    `
    )
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch infringement: ${error.message}`)
  }

  return data
}

/**
 * Update infringement status
 */
export async function updateInfringementStatus(
  id: string,
  status: InfringementStatus,
  notes?: string
): Promise<Infringement> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (notes) {
    updateData.notes = notes
  }

  const { data, error } = await supabase
    .from("infringements")
    .update(updateData)
    .eq("id", id)
    .select(
      `
      *,
      vehicle:vehicles(*),
      offence:offences(*),
      agency:agencies(*),
      officer:users(display_name)
    `
    )
    .single()

  if (error) {
    throw new Error(`Failed to update infringement: ${error.message}`)
  }

  return data
}
