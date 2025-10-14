import { supabase } from "@/lib/supabase"

export type DashboardSummary = {
  outstandingTotal: number
  outstandingCount: number
  paymentsTotal: number
  paymentsCount: number
  openDisputes: number
  activeAgencies: number
}

export type DashboardData = {
  summary: DashboardSummary
  outstanding: Array<{
    id: string
    reg: string
    offence: string
    agency: string
    amount: number
    status: string
    issuedAt: string | null
  }>
  recentActivity: Array<{
    id: number | string
    title: string
    detail: string
    timestamp: string
  }>
  reconciliationTasks: Array<{
    label: string
    owner: string
    priority: "High" | "Medium" | "Low"
    count: number
  }>
  agencyPerformance: Array<{
    agency: string
    issued: number
    paid: number
    disputes: number
    collectionRate: number
  }>
  citizenExperience: {
    portalLogins24h: number
    paymentSuccessRate: number
    openDisputes: number
    overdueDisputes: number
  }
}

export const fetchDashboardData = async (): Promise<DashboardData> => {
  // Fetch summary statistics
  const [
    { data: outstandingInfringements, error: outstandingError },
    { data: successfulPayments, error: paymentsError },
    { count: summaryOpenDisputesCount, error: disputesError },
    { count: summaryActiveAgenciesCount, error: agenciesError },
  ] = await Promise.all([
    // Outstanding infringements (issued or disputed)
    supabase
      .from("infringements")
      .select("fine_amount", { count: "exact" })
      .in("status", ["issued", "disputed"]),
    
    // Successful payments
    supabase
      .from("payments")
      .select("amount", { count: "exact" })
      .eq("status", "success"),
    
    // Open disputes
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    
    // Active agencies
    supabase
      .from("agencies")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
  ])

  if (outstandingError) throw outstandingError
  if (paymentsError) throw paymentsError
  if (disputesError) throw disputesError
  if (agenciesError) throw agenciesError

  const outstandingTotal = (outstandingInfringements || []).reduce((sum, inf) => sum + Number(inf.fine_amount), 0)
  const paymentsTotal = (successfulPayments || []).reduce((sum, pmt) => sum + Number(pmt.amount), 0)

  // Fetch outstanding infringements with details
  const { data: outstandingDetails, error: outstandingDetailsError } = await supabase
    .from("infringements")
    .select(`
      id,
      infringement_number,
      fine_amount,
      status,
      issued_at,
      vehicles!inner(reg_number),
      offences!inner(description),
      agencies!inner(name)
    `)
    .in("status", ["issued", "disputed"])
    .order("issued_at", { ascending: false })
    .limit(10)

  if (outstandingDetailsError) throw outstandingDetailsError

  // Fetch recent activity from audit logs
  const { data: auditLogs, error: auditLogsError } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, created_at, new_data")
    .order("created_at", { ascending: false })
    .limit(10)

  if (auditLogsError) throw auditLogsError

  // Fetch agency performance
  const { data: agencies, error: agenciesPerformanceError } = await supabase
    .from("agencies")
    .select(`
      name,
      infringements!issuing_agency_id(status)
    `)
    .eq("active", true)

  if (agenciesPerformanceError) throw agenciesPerformanceError

  // Calculate agency performance metrics
  const agencyPerformance = (agencies || []).map((agency: any) => {
    const infringements = agency.infringements || []
    const issued = infringements.length
    const paid = infringements.filter((i: any) => i.status === "paid").length
    const disputes = infringements.filter((i: any) => i.status === "disputed").length
    const collectionRate = issued > 0 ? paid / issued : 0

    return {
      agency: agency.name,
      issued,
      paid,
      disputes,
      collectionRate,
    }
  })

  // Fetch citizen experience metrics
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  
  const [
    { count: recentLogins },
    { data: recentPayments },
    { count: openDisputesCount },
  ] = await Promise.all([
    supabase
      .from("audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("action", "LOGIN")
      .gte("created_at", twentyFourHoursAgo),
    
    supabase
      .from("payments")
      .select("status")
      .gte("created_at", twentyFourHoursAgo),
    
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ])

  const paymentSuccessRate = recentPayments && recentPayments.length > 0
    ? recentPayments.filter(p => p.status === "success").length / recentPayments.length
    : 0

  // Fetch escalated disputes count (overdue is approximated as escalated)
  const { count: escalatedDisputesCount } = await supabase
    .from("disputes")
    .select("id", { count: "exact", head: true })
    .eq("status", "escalated")

  // Fetch reconciliation tasks
  const [
    { count: pendingPaymentsCount },
    { count: escalatedCount },
  ] = await Promise.all([
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    
    supabase
      .from("disputes")
      .select("id", { count: "exact", head: true })
      .eq("status", "escalated"),
  ])

  return {
    summary: {
      outstandingTotal,
      outstandingCount: outstandingInfringements?.length || 0,
      paymentsTotal,
      paymentsCount: successfulPayments?.length || 0,
      openDisputes: summaryOpenDisputesCount || 0,
      activeAgencies: summaryActiveAgenciesCount || 0,
    },
    outstanding: (outstandingDetails || []).map((inf: any) => ({
      id: inf.infringement_number,
      reg: inf.vehicles.reg_number,
      offence: inf.offences.description,
      agency: inf.agencies.name,
      amount: Number(inf.fine_amount),
      status: inf.status,
      issuedAt: inf.issued_at,
    })),
    recentActivity: (auditLogs || []).map((log: any) => ({
      id: log.id,
      title: formatAuditAction(log.action, log.entity_type),
      detail: formatAuditDetail(log.action, log.entity_type, log.entity_id, log.new_data),
      timestamp: log.created_at,
    })),
    reconciliationTasks: [
      {
        label: "Approve pending payments",
        owner: "Finance Desk",
        priority: "High" as const,
        count: pendingPaymentsCount || 0,
      },
      {
        label: "Review escalated disputes",
        owner: "Agency Admin",
        priority: "Medium" as const,
        count: escalatedCount || 0,
      },
      {
        label: "Audit offline sync backlog",
        owner: "Central Ops",
        priority: "Low" as const,
        count: 0, // Not tracked in DB yet
      },
    ],
    agencyPerformance,
    citizenExperience: {
      portalLogins24h: recentLogins || 0,
      paymentSuccessRate,
      openDisputes: openDisputesCount || 0,
      overdueDisputes: escalatedDisputesCount || 0,
    },
  }
}

// Helper functions to format audit log messages
function formatAuditAction(action: string, entityType: string): string {
  const actionMap: Record<string, string> = {
    INSERT: "New",
    UPDATE: "Updated",
    DELETE: "Deleted",
    LOGIN: "User login",
  }
  
  const prefix = actionMap[action] || action
  const entity = entityType.toLowerCase().replace("_", " ")
  
  if (action === "LOGIN") return prefix
  return `${prefix} ${entity}`
}

function formatAuditDetail(action: string, entityType: string, entityId: string, newData: any): string {
  if (action === "LOGIN" && newData?.display_name) {
    return `${newData.display_name} logged in`
  }
  
  if (entityType === "payment" && newData?.receipt_number) {
    return `Receipt ${newData.receipt_number}`
  }
  
  if (entityType === "dispute" && action === "INSERT") {
    return `Dispute raised for review`
  }
  
  if (entityType === "infringement" && action === "INSERT") {
    return `New infringement recorded`
  }
  
  return `Entity ID: ${entityId.substring(0, 8)}`
}
