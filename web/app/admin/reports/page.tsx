import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Building2,
  AlertCircle,
} from "lucide-react";
import { FinanceReportsTable } from "@/components/admin/finance-reports-table";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { ReportsSearch } from "@/components/admin/reports-search";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: {
    agency?: string;
    from?: string;
    to?: string;
  };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user details
  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();

  if (!userData || !["super_admin", "agency_admin"].includes(userData.role)) {
    redirect("/protected");
  }

  // Build query with filters
  let query = supabase.from("infringements").select(
    `
      id,
      vehicle_id,
      issued_at,
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
      )
    `
  );

  // Apply agency filter
  if (userData.role === "agency_admin" && userData.agency_id) {
    query = query.eq("agency_id", userData.agency_id);
  } else if (searchParams.agency) {
    query = query.eq("agency_id", searchParams.agency);
  }

  // Apply date range filters
  if (searchParams.from) {
    query = query.gte("issued_at", searchParams.from);
  }

  if (searchParams.to) {
    query = query.lte("issued_at", searchParams.to);
  }

  const { data: infringements, error } = await query;

  if (error) {
    console.error("Error fetching infringements:", error);
  }

  // Fetch agencies for filter
  const { data: agencies } = await supabase
    .from("agencies")
    .select("id, name")
    .order("name");

  // Calculate statistics
  const stats = calculateStatistics(infringements as any);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Financial reports and infringement statistics
        </p>
      </div>

      <ReportsSearch agencies={agencies || []} userRole={userData.role} />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Infringements
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInfringements}</div>
            <p className="text-xs text-muted-foreground">{stats.dateRange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalFines.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all infringement types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agencyCount}</div>
            <p className="text-xs text-muted-foreground">
              Active enforcement agencies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fine</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.avgFine.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per infringement issued
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Finance Reports Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finance Reports</h2>
          <p className="text-muted-foreground">
            Infringements aggregated by GL Code for financial reporting
          </p>
        </div>

        <FinanceReportsTable
          infringements={(infringements as any) || []}
          userRole={userData.role}
        />
      </div>

      {/* Top Statistics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Infringement Types</CardTitle>
            <CardDescription>Most frequently issued violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topTypes.slice(0, 5).map((item: any, index: number) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.code}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {item.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.count}</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.totalFine.toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
              {stats.topTypes.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>No infringement data available</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Infringements by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topCategories
                .slice(0, 5)
                .map((item: any, index: number) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
                        {index + 1}
                      </div>
                      <p className="text-sm font-medium">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.count}</p>
                      <p className="text-xs text-muted-foreground">
                        ${item.totalFine.toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              {stats.topCategories.length === 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>No category data available</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Visual insights and trends across your infringement data
          </p>
        </div>

        <AnalyticsCharts infringements={(infringements as any) || []} />
      </div>
    </div>
  );
}

function calculateStatistics(infringements: any[]) {
  if (!infringements || infringements.length === 0) {
    return {
      totalInfringements: 0,
      totalFines: 0,
      agencyCount: 0,
      avgFine: 0,
      dateRange: "No data",
      topTypes: [],
      topCategories: [],
    };
  }

  const totalInfringements = infringements.length;
  const totalFines = infringements.reduce(
    (sum, inf) => sum + (inf.type?.fine_amount || 0),
    0
  );
  const agencyCount = new Set(
    infringements.map((inf) => inf.agency_id).filter(Boolean)
  ).size;
  const avgFine = totalInfringements > 0 ? totalFines / totalInfringements : 0;

  // Date range
  const dates = infringements
    .map((inf) => new Date(inf.issued_at))
    .filter((d) => !isNaN(d.getTime()));
  const minDate =
    dates.length > 0
      ? new Date(Math.min(...dates.map((d) => d.getTime())))
      : null;
  const maxDate =
    dates.length > 0
      ? new Date(Math.max(...dates.map((d) => d.getTime())))
      : null;
  const dateRange =
    minDate && maxDate
      ? `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`
      : "All time";

  // Top types
  const typeMap = new Map<string, any>();
  infringements.forEach((inf) => {
    if (inf.type) {
      const key = inf.type.code;
      if (!typeMap.has(key)) {
        typeMap.set(key, {
          code: inf.type.code,
          name: inf.type.name,
          count: 0,
          totalFine: 0,
        });
      }
      const entry = typeMap.get(key);
      entry.count++;
      entry.totalFine += inf.type.fine_amount || 0;
    }
  });
  const topTypes = Array.from(typeMap.values()).sort(
    (a, b) => b.count - a.count
  );

  // Top categories
  const categoryMap = new Map<string, any>();
  infringements.forEach((inf) => {
    if (inf.type?.category) {
      const key = inf.type.category.name;
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          name: inf.type.category.name,
          count: 0,
          totalFine: 0,
        });
      }
      const entry = categoryMap.get(key);
      entry.count++;
      entry.totalFine += inf.type.fine_amount || 0;
    }
  });
  const topCategories = Array.from(categoryMap.values()).sort(
    (a, b) => b.count - a.count
  );

  return {
    totalInfringements,
    totalFines,
    agencyCount,
    avgFine,
    dateRange,
    topTypes,
    topCategories,
  };
}
