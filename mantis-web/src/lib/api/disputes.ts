import { supabase } from "@/lib/supabase"

// Types
export type DisputeStatus = "open" | "resolved" | "escalated"

export interface Dispute {
  id: string
  infringement_id: string
  citizen_user_id: string
  reason: string
  status: DisputeStatus
  resolution_notes: string | null
  created_at: string
  resolved_at: string | null
  resolved_by_user_id: string | null
  updated_at: string
  // Related data
  infringement?: {
    id: string
    infringement_number: string
    fine_amount: number
    status: string
    issued_at: string
    location_description: string | null
    vehicle?: {
      id: string
      reg_number: string
      make?: string | null
      model?: string | null
    }
    offence?: {
      id: string
      code: string
      description: string
      category?: string | null
    }
    officer?: {
      id: string
      display_name: string
    }
    agency?: {
      id: string
      name: string
    }
  }
  citizen?: {
    id: string
    display_name: string
    email: string
  }
  resolved_by?: {
    id: string
    display_name: string
  }
}

export interface DisputeSummary {
  total_disputes: number
  open_disputes: number
  resolved_disputes: number
  escalated_disputes: number
  avg_resolution_time_hours: number | null
}

export interface CreateDisputeInput {
  infringement_id: string
  reason: string
}

export interface ResolveDisputeInput {
  dispute_id: string
  resolution_notes: string
  approve: boolean // true = void infringement, false = reject dispute
}

/**
 * Get list of disputes with optional filtering
 */
export async function getDisputes(filters?: {
  status?: DisputeStatus
  agency_id?: string
  citizen_user_id?: string
}): Promise<{ disputes: Dispute[]; total: number }> {
  let query = supabase
    .from("disputes")
    .select(
      `
      *,
      infringement:infringements!inner (
        id,
        infringement_number,
        fine_amount,
        status,
        issued_at,
        location_description,
        vehicle:vehicles (
          id,
          reg_number,
          make,
          model
        ),
        offence:offences (
          id,
          code,
          description,
          category
        ),
        officer:users!infringements_issued_by_user_id_fkey (
          id,
          display_name
        ),
        agency:agencies (
          id,
          name
        )
      ),
      citizen:users!disputes_citizen_user_id_fkey (
        id,
        display_name,
        email
      ),
      resolved_by:users!disputes_resolved_by_user_id_fkey (
        id,
        display_name
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.agency_id) {
    query = query.eq("infringement.agency_id", filters.agency_id)
  }

  if (filters?.citizen_user_id) {
    query = query.eq("citizen_user_id", filters.citizen_user_id)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching disputes:", error)
    throw new Error(`Failed to fetch disputes: ${error.message}`)
  }

  return {
    disputes: data as Dispute[],
    total: count || 0,
  }
}

/**
 * Get a single dispute by ID with all related data
 */
export async function getDispute(id: string): Promise<Dispute> {
  const { data, error } = await supabase
    .from("disputes")
    .select(
      `
      *,
      infringement:infringements (
        id,
        infringement_number,
        fine_amount,
        status,
        issued_at,
        location_description,
        notes,
        vehicle:vehicles (
          id,
          reg_number,
          make,
          model,
          year,
          color
        ),
        offence:offences (
          id,
          code,
          description,
          category,
          fine_amount
        ),
        officer:users!infringements_issued_by_user_id_fkey (
          id,
          display_name,
          email
        ),
        agency:agencies (
          id,
          name,
          contact_email,
          contact_phone
        )
      ),
      citizen:users!disputes_citizen_user_id_fkey (
        id,
        display_name,
        email
      ),
      resolved_by:users!disputes_resolved_by_user_id_fkey (
        id,
        display_name
      )
    `
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching dispute:", error)
    throw new Error(`Failed to fetch dispute: ${error.message}`)
  }

  if (!data) {
    throw new Error("Dispute not found")
  }

  return data as Dispute
}

/**
 * Create a new dispute for an infringement
 */
export async function createDispute(input: CreateDisputeInput): Promise<Dispute> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // First, update the infringement status to 'disputed'
  const { error: infringementError } = await supabase
    .from("infringements")
    .update({ status: "disputed" })
    .eq("id", input.infringement_id)

  if (infringementError) {
    console.error("Error updating infringement status:", infringementError)
    throw new Error(`Failed to update infringement: ${infringementError.message}`)
  }

  // Create the dispute record
  const { data, error } = await supabase
    .from("disputes")
    .insert({
      infringement_id: input.infringement_id,
      citizen_user_id: user.id,
      reason: input.reason,
      status: "open",
    })
    .select(
      `
      *,
      infringement:infringements (
        id,
        infringement_number,
        fine_amount,
        status,
        vehicle:vehicles (
          id,
          reg_number
        )
      )
    `
    )
    .single()

  if (error) {
    console.error("Error creating dispute:", error)
    throw new Error(`Failed to create dispute: ${error.message}`)
  }

  return data as Dispute
}

/**
 * Resolve a dispute (approve or reject)
 */
export async function resolveDispute(input: ResolveDisputeInput): Promise<Dispute> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Fetch the dispute to get infringement_id
  const { data: dispute, error: fetchError } = await supabase
    .from("disputes")
    .select("infringement_id, status")
    .eq("id", input.dispute_id)
    .single()

  if (fetchError || !dispute) {
    throw new Error("Dispute not found")
  }

  if (dispute.status !== "open") {
    throw new Error("Dispute is already resolved")
  }

  // Update dispute status
  const { error: disputeError } = await supabase
    .from("disputes")
    .update({
      status: "resolved",
      resolution_notes: input.resolution_notes,
      resolved_at: new Date().toISOString(),
      resolved_by_user_id: user.id,
    })
    .eq("id", input.dispute_id)

  if (disputeError) {
    console.error("Error resolving dispute:", disputeError)
    throw new Error(`Failed to resolve dispute: ${disputeError.message}`)
  }

  // Update infringement status based on resolution
  const newInfringementStatus = input.approve ? "voided" : "issued"
  const { error: infringementError } = await supabase
    .from("infringements")
    .update({ status: newInfringementStatus })
    .eq("id", dispute.infringement_id)

  if (infringementError) {
    console.error("Error updating infringement:", infringementError)
    throw new Error(`Failed to update infringement: ${infringementError.message}`)
  }

  // Fetch and return the updated dispute
  return getDispute(input.dispute_id)
}

/**
 * Escalate a dispute to a higher authority
 */
export async function escalateDispute(
  dispute_id: string,
  escalation_notes: string
): Promise<Dispute> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase
    .from("disputes")
    .update({
      status: "escalated",
      resolution_notes: escalation_notes,
      resolved_by_user_id: user.id,
    })
    .eq("id", dispute_id)

  if (error) {
    console.error("Error escalating dispute:", error)
    throw new Error(`Failed to escalate dispute: ${error.message}`)
  }

  return getDispute(dispute_id)
}

/**
 * Get dispute statistics summary
 */
export async function getDisputeSummary(filters?: {
  agency_id?: string
  start_date?: string
  end_date?: string
}): Promise<DisputeSummary> {
  let query = supabase.from("disputes").select(
    `
    id,
    status,
    created_at,
    resolved_at,
    infringement:infringements!inner (
      agency_id
    )
  `
  )

  // Apply filters
  if (filters?.agency_id) {
    query = query.eq("infringement.agency_id", filters.agency_id)
  }

  if (filters?.start_date) {
    query = query.gte("created_at", filters.start_date)
  }

  if (filters?.end_date) {
    query = query.lte("created_at", filters.end_date)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching dispute summary:", error)
    throw new Error(`Failed to fetch dispute summary: ${error.message}`)
  }

  // Calculate statistics
  const total_disputes = data?.length || 0
  const open_disputes = data?.filter((d) => d.status === "open").length || 0
  const resolved_disputes = data?.filter((d) => d.status === "resolved").length || 0
  const escalated_disputes = data?.filter((d) => d.status === "escalated").length || 0

  // Calculate average resolution time for resolved disputes
  const resolvedWithTime = data?.filter(
    (d) => d.status === "resolved" && d.resolved_at && d.created_at
  )

  let avg_resolution_time_hours: number | null = null
  if (resolvedWithTime && resolvedWithTime.length > 0) {
    const totalHours = resolvedWithTime.reduce((sum, dispute) => {
      const created = new Date(dispute.created_at).getTime()
      const resolved = new Date(dispute.resolved_at!).getTime()
      const hours = (resolved - created) / (1000 * 60 * 60)
      return sum + hours
    }, 0)
    avg_resolution_time_hours = totalHours / resolvedWithTime.length
  }

  return {
    total_disputes,
    open_disputes,
    resolved_disputes,
    escalated_disputes,
    avg_resolution_time_hours,
  }
}
