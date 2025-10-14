import { supabase } from "@/lib/supabase"
import { format } from "date-fns"

// Types
export interface ReportFilters {
  agency_id?: string
  start_date?: string
  end_date?: string
  offence_category?: string
  status?: string
}

export interface InfringementStats {
  total_infringements: number
  total_revenue: number
  issued: number
  paid: number
  voided: number
  disputed: number
  payment_rate: number // percentage
  average_fine: number
}

export interface RevenueByPeriod {
  period: string // YYYY-MM-DD or YYYY-MM
  total_amount: number
  payment_count: number
  infringement_count: number
}

export interface OffenceBreakdown {
  offence_code: string
  offence_description: string
  category: string | null
  count: number
  total_revenue: number
  average_fine: number
  percentage: number
}

export interface AgencyPerformance {
  agency_id: string
  agency_name: string
  total_infringements: number
  total_revenue: number
  payment_rate: number
  avg_resolution_days: number | null
}

export interface GeographicData {
  location_description: string
  latitude: number
  longitude: number
  infringement_count: number
  total_revenue: number
}

export interface TemporalTrend {
  date: string
  infringements: number
  revenue: number
  payments: number
}

export interface OfficerPerformance {
  officer_id: string
  officer_name: string
  total_infringements: number
  total_revenue: number
  voided_count: number
  disputed_count: number
  accuracy_rate: number
}

/**
 * Get comprehensive infringement statistics
 */
export async function getInfringementStats(filters: ReportFilters): Promise<InfringementStats> {
  let query = supabase.from("infringements").select("id, status, fine_amount")

  // Apply filters
  if (filters.agency_id) {
    query = query.eq("agency_id", filters.agency_id)
  }

  if (filters.start_date) {
    query = query.gte("issued_at", filters.start_date)
  }

  if (filters.end_date) {
    query = query.lte("issued_at", filters.end_date)
  }

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching infringement stats:", error)
    throw new Error(`Failed to fetch statistics: ${error.message}`)
  }

  const infringements = data || []
  const total_infringements = infringements.length
  const issued = infringements.filter((i) => i.status === "issued").length
  const paid = infringements.filter((i) => i.status === "paid").length
  const voided = infringements.filter((i) => i.status === "voided").length
  const disputed = infringements.filter((i) => i.status === "disputed").length

  const total_revenue = infringements.reduce((sum, i) => sum + Number(i.fine_amount), 0)
  const payment_rate = total_infringements > 0 ? (paid / total_infringements) * 100 : 0
  const average_fine = total_infringements > 0 ? total_revenue / total_infringements : 0

  return {
    total_infringements,
    total_revenue,
    issued,
    paid,
    voided,
    disputed,
    payment_rate,
    average_fine,
  }
}

/**
 * Get revenue breakdown by time period
 */
export async function getRevenueByPeriod(
  filters: ReportFilters,
  groupBy: "day" | "week" | "month" = "day"
): Promise<RevenueByPeriod[]> {
  let query = supabase.from("payments").select(
    `
    id,
    amount,
    status,
    created_at,
    infringement:infringements!inner (
      agency_id
    )
  `
  )

  // Apply filters
  if (filters.agency_id) {
    query = query.eq("infringement.agency_id", filters.agency_id)
  }

  if (filters.start_date) {
    query = query.gte("created_at", filters.start_date)
  }

  if (filters.end_date) {
    query = query.lte("created_at", filters.end_date)
  }

  query = query.eq("status", "success")

  const { data, error } = await query

  if (error) {
    console.error("Error fetching revenue by period:", error)
    throw new Error(`Failed to fetch revenue data: ${error.message}`)
  }

  // Group by period
  const grouped = new Map<string, { amount: number; payments: number; infringements: Set<string> }>()

  data?.forEach((payment) => {
    const date = new Date(payment.created_at)
    let periodKey: string

    if (groupBy === "month") {
      periodKey = format(date, "yyyy-MM")
    } else if (groupBy === "week") {
      periodKey = format(date, "yyyy-'W'II") // ISO week
    } else {
      periodKey = format(date, "yyyy-MM-dd")
    }

    if (!grouped.has(periodKey)) {
      grouped.set(periodKey, { amount: 0, payments: 0, infringements: new Set() })
    }

    const entry = grouped.get(periodKey)!
    entry.amount += Number(payment.amount)
    entry.payments += 1
  })

  return Array.from(grouped.entries())
    .map(([period, data]) => ({
      period,
      total_amount: data.amount,
      payment_count: data.payments,
      infringement_count: data.infringements.size,
    }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

/**
 * Get offence breakdown statistics
 */
export async function getOffenceBreakdown(filters: ReportFilters): Promise<OffenceBreakdown[]> {
  let query = supabase.from("infringements").select(
    `
    id,
    fine_amount,
    offence:offences (
      code,
      description,
      category
    )
  `
  )

  // Apply filters
  if (filters.agency_id) {
    query = query.eq("agency_id", filters.agency_id)
  }

  if (filters.start_date) {
    query = query.gte("issued_at", filters.start_date)
  }

  if (filters.end_date) {
    query = query.lte("issued_at", filters.end_date)
  }

  if (filters.offence_category) {
    query = query.eq("offence.category", filters.offence_category)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching offence breakdown:", error)
    throw new Error(`Failed to fetch offence data: ${error.message}`)
  }

  // Group by offence
  const grouped = new Map<
    string,
    { description: string; category: string | null; count: number; revenue: number }
  >()

  data?.forEach((infringement) => {
    const offence = infringement.offence as any
    if (!offence) return

    const code = offence.code
    if (!grouped.has(code)) {
      grouped.set(code, {
        description: offence.description,
        category: offence.category,
        count: 0,
        revenue: 0,
      })
    }

    const entry = grouped.get(code)!
    entry.count += 1
    entry.revenue += Number(infringement.fine_amount)
  })

  const total = Array.from(grouped.values()).reduce((sum, entry) => sum + entry.count, 0)

  return Array.from(grouped.entries())
    .map(([code, data]) => ({
      offence_code: code,
      offence_description: data.description,
      category: data.category,
      count: data.count,
      total_revenue: data.revenue,
      average_fine: data.count > 0 ? data.revenue / data.count : 0,
      percentage: total > 0 ? (data.count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get agency performance comparison
 */
export async function getAgencyPerformance(filters: ReportFilters): Promise<AgencyPerformance[]> {
  let query = supabase.from("infringements").select(
    `
    id,
    fine_amount,
    status,
    issued_at,
    agency:agencies (
      id,
      name
    )
  `
  )

  // Apply date filters
  if (filters.start_date) {
    query = query.gte("issued_at", filters.start_date)
  }

  if (filters.end_date) {
    query = query.lte("issued_at", filters.end_date)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching agency performance:", error)
    throw new Error(`Failed to fetch agency data: ${error.message}`)
  }

  // Group by agency
  const grouped = new Map<
    string,
    {
      name: string
      total: number
      paid: number
      revenue: number
      resolutionTimes: number[]
    }
  >()

  data?.forEach((infringement) => {
    const agency = infringement.agency as any
    if (!agency) return

    const agencyId = agency.id
    if (!grouped.has(agencyId)) {
      grouped.set(agencyId, {
        name: agency.name,
        total: 0,
        paid: 0,
        revenue: 0,
        resolutionTimes: [],
      })
    }

    const entry = grouped.get(agencyId)!
    entry.total += 1
    if (infringement.status === "paid") {
      entry.paid += 1
      entry.revenue += Number(infringement.fine_amount)
    }
  })

  return Array.from(grouped.entries())
    .map(([agencyId, data]) => ({
      agency_id: agencyId,
      agency_name: data.name,
      total_infringements: data.total,
      total_revenue: data.revenue,
      payment_rate: data.total > 0 ? (data.paid / data.total) * 100 : 0,
      avg_resolution_days:
        data.resolutionTimes.length > 0
          ? data.resolutionTimes.reduce((a, b) => a + b, 0) / data.resolutionTimes.length
          : null,
    }))
    .sort((a, b) => b.total_infringements - a.total_infringements)
}

/**
 * Get geographic data for heatmap visualization
 */
export async function getGeographicData(filters: ReportFilters): Promise<GeographicData[]> {
  let query = supabase.from("infringements").select(
    `
    id,
    fine_amount,
    location_description,
    location_lat,
    location_lng
  `
  )

  // Apply filters
  if (filters.agency_id) {
    query = query.eq("agency_id", filters.agency_id)
  }

  if (filters.start_date) {
    query = query.gte("issued_at", filters.start_date)
  }

  if (filters.end_date) {
    query = query.lte("issued_at", filters.end_date)
  }

  // Only get infringements with location data
  query = query.not("location_lat", "is", null).not("location_lng", "is", null)

  const { data, error } = await query

  if (error) {
    console.error("Error fetching geographic data:", error)
    throw new Error(`Failed to fetch geographic data: ${error.message}`)
  }

  // Group by location (rounded coordinates for clustering)
  const grouped = new Map<string, { lat: number; lng: number; count: number; revenue: number }>()

  data?.forEach((infringement) => {
    // Round to 4 decimal places for clustering (~11m precision)
    const lat = Math.round(infringement.location_lat * 10000) / 10000
    const lng = Math.round(infringement.location_lng * 10000) / 10000
    const key = `${lat},${lng}`

    if (!grouped.has(key)) {
      grouped.set(key, { lat, lng, count: 0, revenue: 0 })
    }

    const entry = grouped.get(key)!
    entry.count += 1
    entry.revenue += Number(infringement.fine_amount)
  })

  return Array.from(grouped.entries()).map(([_key, data]) => ({
    location_description: `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
    latitude: data.lat,
    longitude: data.lng,
    infringement_count: data.count,
    total_revenue: data.revenue,
  }))
}

/**
 * Get temporal trends (time series data)
 */
export async function getTemporalTrends(
  filters: ReportFilters,
  groupBy: "day" | "week" | "month" = "day"
): Promise<TemporalTrend[]> {
  let infringementQuery = supabase.from("infringements").select("id, issued_at, fine_amount")

  let paymentQuery = supabase.from("payments").select(
    `
    id,
    amount,
    created_at,
    status,
    infringement:infringements!inner (
      agency_id
    )
  `
  )

  // Apply filters to both queries
  if (filters.agency_id) {
    infringementQuery = infringementQuery.eq("agency_id", filters.agency_id)
    paymentQuery = paymentQuery.eq("infringement.agency_id", filters.agency_id)
  }

  if (filters.start_date) {
    infringementQuery = infringementQuery.gte("issued_at", filters.start_date)
    paymentQuery = paymentQuery.gte("created_at", filters.start_date)
  }

  if (filters.end_date) {
    infringementQuery = infringementQuery.lte("issued_at", filters.end_date)
    paymentQuery = paymentQuery.lte("created_at", filters.end_date)
  }

  const [{ data: infringements, error: infError }, { data: payments, error: payError }] =
    await Promise.all([infringementQuery, paymentQuery.eq("status", "success")])

  if (infError || payError) {
    console.error("Error fetching temporal data:", infError || payError)
    throw new Error("Failed to fetch temporal data")
  }

  // Combine into timeline
  const timeline = new Map<string, { infringements: number; revenue: number; payments: number }>()

  // Process infringements
  infringements?.forEach((inf) => {
    const date = new Date(inf.issued_at)
    let periodKey: string

    if (groupBy === "month") {
      periodKey = format(date, "yyyy-MM")
    } else if (groupBy === "week") {
      periodKey = format(date, "yyyy-'W'II")
    } else {
      periodKey = format(date, "yyyy-MM-dd")
    }

    if (!timeline.has(periodKey)) {
      timeline.set(periodKey, { infringements: 0, revenue: 0, payments: 0 })
    }

    timeline.get(periodKey)!.infringements += 1
  })

  // Process payments
  payments?.forEach((payment) => {
    const date = new Date(payment.created_at)
    let periodKey: string

    if (groupBy === "month") {
      periodKey = format(date, "yyyy-MM")
    } else if (groupBy === "week") {
      periodKey = format(date, "yyyy-'W'II")
    } else {
      periodKey = format(date, "yyyy-MM-dd")
    }

    if (!timeline.has(periodKey)) {
      timeline.set(periodKey, { infringements: 0, revenue: 0, payments: 0 })
    }

    const entry = timeline.get(periodKey)!
    entry.revenue += Number(payment.amount)
    entry.payments += 1
  })

  return Array.from(timeline.entries())
    .map(([date, data]) => ({
      date,
      infringements: data.infringements,
      revenue: data.revenue,
      payments: data.payments,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get officer performance statistics
 */
export async function getOfficerPerformance(filters: ReportFilters): Promise<OfficerPerformance[]> {
  let query = supabase.from("infringements").select(
    `
    id,
    fine_amount,
    status,
    officer:users!infringements_issued_by_user_id_fkey (
      id,
      display_name
    )
  `
  )

  // Apply filters
  if (filters.agency_id) {
    query = query.eq("agency_id", filters.agency_id)
  }

  if (filters.start_date) {
    query = query.gte("issued_at", filters.start_date)
  }

  if (filters.end_date) {
    query = query.lte("issued_at", filters.end_date)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching officer performance:", error)
    throw new Error(`Failed to fetch officer data: ${error.message}`)
  }

  // Group by officer
  const grouped = new Map<
    string,
    {
      name: string
      total: number
      voided: number
      disputed: number
      revenue: number
    }
  >()

  data?.forEach((infringement) => {
    const officer = infringement.officer as any
    if (!officer) return

    const officerId = officer.id
    if (!grouped.has(officerId)) {
      grouped.set(officerId, {
        name: officer.display_name,
        total: 0,
        voided: 0,
        disputed: 0,
        revenue: 0,
      })
    }

    const entry = grouped.get(officerId)!
    entry.total += 1
    if (infringement.status === "voided") entry.voided += 1
    if (infringement.status === "disputed") entry.disputed += 1
    if (infringement.status === "paid") entry.revenue += Number(infringement.fine_amount)
  })

  return Array.from(grouped.entries())
    .map(([officerId, data]) => ({
      officer_id: officerId,
      officer_name: data.name,
      total_infringements: data.total,
      total_revenue: data.revenue,
      voided_count: data.voided,
      disputed_count: data.disputed,
      accuracy_rate:
        data.total > 0 ? ((data.total - data.voided - data.disputed) / data.total) * 100 : 0,
    }))
    .sort((a, b) => b.total_infringements - a.total_infringements)
}

/**
 * Export data to CSV format
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data || data.length === 0) {
    throw new Error("No data to export")
  }

  // Get headers from first object
  const headers = Object.keys(data[0])

  // Create CSV content
  const csvContent = [
    headers.join(","), // Header row
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header]
          // Handle null/undefined
          if (value === null || value === undefined) return ""
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value)
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        .join(",")
    ),
  ].join("\n")

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}_${format(new Date(), "yyyy-MM-dd")}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
