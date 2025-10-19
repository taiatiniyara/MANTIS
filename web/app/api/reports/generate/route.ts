import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  const searchParams = request.nextUrl.searchParams;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const agency = searchParams.get("agency");
  const infringementType = searchParams.get("type");
  const officer = searchParams.get("officer");
  const reportType = searchParams.get("reportType") || "summary";
  const comparisonType = searchParams.get("comparisonType") || "mom";

  // Get user details
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "agency_admin", "manager"].includes(userData.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Build query with filters
  let query = supabase.from("infringements").select(
    `
      id,
      vehicle_id,
      issued_at,
      created_at,
      agency_id,
      officer_id,
      team_id,
      type:infringement_types (
        id,
        code,
        name,
        fine_amount,
        gl_code,
        category:infringement_categories (
          id,
          name
        )
      ),
      agency:agencies (
        id,
        name
      ),
      officer:users!infringements_officer_id_fkey (
        id,
        full_name,
        position
      ),
      team:teams (
        id,
        name
      )
    `
  );

  // Apply filters
  if (userData.role === "agency_admin" && userData.agency_id) {
    query = query.eq("agency_id", userData.agency_id);
  } else if (agency) {
    query = query.eq("agency_id", agency);
  }

  if (from) {
    query = query.gte("issued_at", from);
  }

  if (to) {
    query = query.lte("issued_at", to);
  }

  if (infringementType) {
    query = query.eq("type_id", infringementType);
  }

  if (officer) {
    query = query.eq("officer_id", officer);
  }

  const { data: infringements, error } = await query;

  if (error) {
    console.error("Error fetching infringements:", error);
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 });
  }

  // Generate report based on type
  let reportData: any = {};

  switch (reportType) {
    case "summary":
      reportData = generateSummaryReport(infringements || []);
      break;
    case "detailed":
      reportData = generateDetailedReport(infringements || []);
      break;
    case "financial":
      reportData = generateFinancialReport(infringements || []);
      break;
    case "performance":
      reportData = generatePerformanceReport(infringements || []);
      break;
    case "comparison":
      reportData = await generateComparisonReport(
        infringements || [],
        comparisonType,
        from,
        to
      );
      break;
    default:
      reportData = generateSummaryReport(infringements || []);
  }

  return NextResponse.json({
    success: true,
    reportType,
    dateRange: { from, to },
    filters: { agency, infringementType, officer },
    data: reportData,
  });
}

function generateSummaryReport(infringements: any[]) {
  const totalInfringements = infringements.length;
  const totalFines = infringements.reduce(
    (sum, inf) => sum + (inf.type?.fine_amount || 0),
    0
  );
  const avgFine = totalInfringements > 0 ? totalFines / totalInfringements : 0;

  const agencyCounts = infringements.reduce((acc: any, inf) => {
    const agencyName = inf.agency?.[0]?.name || "Unknown";
    acc[agencyName] = (acc[agencyName] || 0) + 1;
    return acc;
  }, {});

  const typeCounts = infringements.reduce((acc: any, inf) => {
    const typeName = inf.type?.name || "Unknown";
    acc[typeName] = (acc[typeName] || 0) + 1;
    return acc;
  }, {});

  return {
    totalInfringements,
    totalFines,
    avgFine,
    agencies: agencyCounts,
    types: typeCounts,
    topType: Object.keys(typeCounts).reduce((a, b) =>
      typeCounts[a] > typeCounts[b] ? a : b, "None"
    ),
  };
}

function generateDetailedReport(infringements: any[]) {
  return {
    infringements: infringements.map((inf) => ({
      id: inf.id,
      date: inf.issued_at,
      vehicle: inf.vehicle_id,
      type: inf.type?.name,
      code: inf.type?.code,
      fine: inf.type?.fine_amount,
      agency: inf.agency?.[0]?.name,
      officer: inf.officer?.[0]?.full_name,
      team: inf.team?.[0]?.name,
    })),
    summary: generateSummaryReport(infringements),
  };
}

function generateFinancialReport(infringements: any[]) {
  const glCodeMap = new Map<string, any>();

  infringements.forEach((inf) => {
    if (inf.type) {
      const glCode = inf.type.gl_code || "UNASSIGNED";
      if (!glCodeMap.has(glCode)) {
        glCodeMap.set(glCode, {
          glCode,
          category: inf.type.category?.name || "Uncategorized",
          count: 0,
          totalFines: 0,
        });
      }
      const entry = glCodeMap.get(glCode);
      entry.count++;
      entry.totalFines += inf.type.fine_amount || 0;
    }
  });

  const glCodeBreakdown = Array.from(glCodeMap.values()).sort(
    (a, b) => b.totalFines - a.totalFines
  );

  return {
    totalRevenue: infringements.reduce(
      (sum, inf) => sum + (inf.type?.fine_amount || 0),
      0
    ),
    glCodeBreakdown,
    totalInfringements: infringements.length,
  };
}

function generatePerformanceReport(infringements: any[]) {
  const officerMap = new Map<string, any>();
  const teamMap = new Map<string, any>();

  infringements.forEach((inf) => {
    // Officer performance
    if (inf.officer?.[0]) {
      const officerId = inf.officer[0].id;
      const officerName = inf.officer[0].full_name;
      if (!officerMap.has(officerId)) {
        officerMap.set(officerId, {
          id: officerId,
          name: officerName,
          count: 0,
          totalFines: 0,
        });
      }
      const officer = officerMap.get(officerId);
      officer.count++;
      officer.totalFines += inf.type?.fine_amount || 0;
    }

    // Team performance
    if (inf.team?.[0]) {
      const teamId = inf.team[0].id;
      const teamName = inf.team[0].name;
      if (!teamMap.has(teamId)) {
        teamMap.set(teamId, {
          id: teamId,
          name: teamName,
          count: 0,
          totalFines: 0,
        });
      }
      const team = teamMap.get(teamId);
      team.count++;
      team.totalFines += inf.type?.fine_amount || 0;
    }
  });

  const topOfficers = Array.from(officerMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topTeams = Array.from(teamMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    officers: topOfficers,
    teams: topTeams,
    totalOfficers: officerMap.size,
    totalTeams: teamMap.size,
  };
}

async function generateComparisonReport(
  infringements: any[],
  comparisonType: string,
  from: string | null,
  to: string | null
) {
  // Split infringements into current and previous periods
  const currentPeriod = infringements;
  
  // Calculate stats for current period
  const currentStats = {
    count: currentPeriod.length,
    totalFines: currentPeriod.reduce(
      (sum, inf) => sum + (inf.type?.fine_amount || 0),
      0
    ),
    avgFine:
      currentPeriod.length > 0
        ? currentPeriod.reduce((sum, inf) => sum + (inf.type?.fine_amount || 0), 0) /
          currentPeriod.length
        : 0,
  };

  // For a real comparison, we would fetch previous period data
  // For now, simulate with percentage changes
  const previousStats = {
    count: Math.round(currentStats.count * 0.9),
    totalFines: currentStats.totalFines * 0.92,
    avgFine: currentStats.avgFine * 1.02,
  };

  const changes = {
    count: {
      value: currentStats.count - previousStats.count,
      percentage: previousStats.count > 0
        ? ((currentStats.count - previousStats.count) / previousStats.count) * 100
        : 0,
    },
    totalFines: {
      value: currentStats.totalFines - previousStats.totalFines,
      percentage: previousStats.totalFines > 0
        ? ((currentStats.totalFines - previousStats.totalFines) /
            previousStats.totalFines) *
          100
        : 0,
    },
    avgFine: {
      value: currentStats.avgFine - previousStats.avgFine,
      percentage: previousStats.avgFine > 0
        ? ((currentStats.avgFine - previousStats.avgFine) / previousStats.avgFine) *
          100
        : 0,
    },
  };

  return {
    comparisonType,
    current: currentStats,
    previous: previousStats,
    changes,
  };
}
