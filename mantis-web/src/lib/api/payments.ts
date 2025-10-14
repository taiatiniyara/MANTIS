import { supabase } from "@/lib/supabase"

export type PaymentMethod = "card" | "mpaisa" | "mycash"
export type PaymentStatus = "pending" | "success" | "failed"

export interface Payment {
  id: string
  infringement_id: string
  amount: number
  method: PaymentMethod
  provider_ref: string | null
  status: PaymentStatus
  receipt_number: string | null
  paid_by_user_id: string | null
  paid_at: string | null
  created_at: string
  updated_at: string
  // Joined data
  infringement?: {
    infringement_number: string
    fine_amount: number
    status: string
    issued_at: string
    vehicle?: {
      reg_number: string
    }
    offence?: {
      code: string
      description: string
    }
    agency?: {
      name: string
    }
  }
  paid_by?: {
    display_name: string
  }
}

export interface CreatePaymentData {
  infringement_id: string
  amount: number
  method: PaymentMethod
  provider_ref?: string
}

export interface PaymentSummary {
  total_payments: number
  total_amount: number
  successful_payments: number
  pending_payments: number
  failed_payments: number
}

/**
 * Get all payments with optional filters
 */
export async function getPayments(filters?: {
  status?: PaymentStatus
  method?: PaymentMethod
  infringement_id?: string
  limit?: number
  offset?: number
}): Promise<{ payments: Payment[]; total: number }> {
  let query = supabase
    .from("payments")
    .select(
      `
      *,
      infringement:infringements(
        infringement_number,
        fine_amount,
        status,
        issued_at,
        vehicle:vehicles(reg_number),
        offence:offences(code, description),
        agency:agencies(name)
      ),
      paid_by:users(display_name)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })

  // Apply filters
  if (filters?.status) {
    query = query.eq("status", filters.status)
  }

  if (filters?.method) {
    query = query.eq("method", filters.method)
  }

  if (filters?.infringement_id) {
    query = query.eq("infringement_id", filters.infringement_id)
  }

  // Pagination
  const limit = filters?.limit || 50
  const offset = filters?.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`)
  }

  return {
    payments: data || [],
    total: count || 0,
  }
}

/**
 * Get a single payment by ID
 */
export async function getPayment(id: string): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      infringement:infringements(
        infringement_number,
        fine_amount,
        status,
        issued_at,
        vehicle:vehicles(reg_number),
        offence:offences(code, description),
        agency:agencies(name)
      ),
      paid_by:users(display_name)
    `
    )
    .eq("id", id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch payment: ${error.message}`)
  }

  return data
}

/**
 * Get payments for a specific infringement
 */
export async function getPaymentsByInfringement(
  infringement_id: string
): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      paid_by:users(display_name)
    `
    )
    .eq("infringement_id", infringement_id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch payments: ${error.message}`)
  }

  return data || []
}

/**
 * Create a new payment
 */
export async function createPayment(data: CreatePaymentData): Promise<Payment> {
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Generate receipt number (format: RCP-YYYY-NNNNNN)
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")
  const receipt_number = `RCP-${year}-${random}`

  // Create payment
  const paymentData: any = {
    infringement_id: data.infringement_id,
    amount: data.amount,
    method: data.method,
    provider_ref: data.provider_ref || null,
    status: "pending", // Will be updated by payment processor
    receipt_number,
    paid_by_user_id: user.id,
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert(paymentData)
    .select(
      `
      *,
      infringement:infringements(
        infringement_number,
        fine_amount,
        status,
        issued_at,
        vehicle:vehicles(reg_number),
        offence:offences(code, description),
        agency:agencies(name)
      ),
      paid_by:users(display_name)
    `
    )
    .single()

  if (error) {
    throw new Error(`Failed to create payment: ${error.message}`)
  }

  return payment
}

/**
 * Process a payment (simulated gateway integration)
 */
export async function processPayment(
  payment_id: string,
  method: PaymentMethod
): Promise<Payment> {
  // In production, this would integrate with:
  // - Card: Stripe, PayPal, etc.
  // - M-Paisa: Vodafone API
  // - MyCash: Digicel API

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05

  const updateData: any = {
    status: isSuccess ? "success" : "failed",
    updated_at: new Date().toISOString(),
  }

  if (isSuccess) {
    updateData.paid_at = new Date().toISOString()
    updateData.provider_ref = `${method.toUpperCase()}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}`
  }

  const { data, error } = await supabase
    .from("payments")
    .update(updateData)
    .eq("id", payment_id)
    .select(
      `
      *,
      infringement:infringements(
        infringement_number,
        fine_amount,
        status,
        issued_at,
        vehicle:vehicles(reg_number),
        offence:offences(code, description),
        agency:agencies(name)
      ),
      paid_by:users(display_name)
    `
    )
    .single()

  if (error) {
    throw new Error(`Failed to process payment: ${error.message}`)
  }

  // If payment successful, update infringement status
  if (isSuccess && data.infringement_id) {
    await supabase
      .from("infringements")
      .update({ status: "paid", updated_at: new Date().toISOString() })
      .eq("id", data.infringement_id)
  }

  return data
}

/**
 * Get payment summary statistics
 */
export async function getPaymentSummary(filters?: {
  agency_id?: string
  start_date?: string
  end_date?: string
}): Promise<PaymentSummary> {
  let query = supabase.from("payments").select("amount, status")

  // Apply filters
  if (filters?.start_date) {
    query = query.gte("created_at", filters.start_date)
  }

  if (filters?.end_date) {
    query = query.lte("created_at", filters.end_date)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch payment summary: ${error.message}`)
  }

  const payments = data || []

  return {
    total_payments: payments.length,
    total_amount: payments
      .filter((p) => p.status === "success")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    successful_payments: payments.filter((p) => p.status === "success").length,
    pending_payments: payments.filter((p) => p.status === "pending").length,
    failed_payments: payments.filter((p) => p.status === "failed").length,
  }
}

/**
 * Retry a failed payment
 */
export async function retryPayment(payment_id: string): Promise<Payment> {
  // Reset status to pending
  const { data, error } = await supabase
    .from("payments")
    .update({
      status: "pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment_id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to retry payment: ${error.message}`)
  }

  // Process the payment
  return processPayment(payment_id, data.method)
}
