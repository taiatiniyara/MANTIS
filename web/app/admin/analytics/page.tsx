import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { TrendingUp, Users, MapPin, DollarSign } from "lucide-react";

export default async function AnalyticsPage() {
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

  // Get infringements with types for analytics
  let infringementsQuery = supabase
    .from("infringements")
    .select(
      `
      *,
      type:infringement_types (
        id,
        code,
        name,
        fine_amount,
        category:infringement_categories (
          id,
          name
        )
      ),
      location:locations (
        id,
        name,
        type
      ),
      officer:users!officer_id (
        id,
        position
      )
    `
    )
    .order("issued_at", { ascending: false })
    .limit(1000);

  if (userData.role === "agency_admin" && userData.agency_id) {
    infringementsQuery = infringementsQuery.eq("agency_id", userData.agency_id);
  }

  const { data: infringements } = await infringementsQuery;

  // Get all infringements for this agency/all if super admin
  let allInfringementsQuery = supabase.from("infringements").select(`
    *,
    type:infringement_types (
      fine_amount,
      category:infringement_categories (
        name
      )
    )
  `);

  if (userData.role === "agency_admin" && userData.agency_id) {
    allInfringementsQuery = allInfringementsQuery.eq("agency_id", userData.agency_id);
  }

  const { data: allInfringements } = await allInfringementsQuery;

  // Calculate summary statistics
  const totalRevenue = (allInfringements || []).reduce(
    (sum: number, inf: any) => sum + (inf.type?.fine_amount || 0),
    0
  );

  const uniqueOfficers = new Set(
    (allInfringements || []).map((inf: any) => inf.officer_id)
  ).size;

  const uniqueLocations = new Set(
    (allInfringements || []).map((inf: any) => inf.location_id).filter(Boolean)
  ).size;

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const monthlyInfringements = (allInfringements || []).filter(
    (inf: any) => new Date(inf.issued_at) >= thisMonth
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive insights and trends for traffic infringements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R {totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {(allInfringements || []).length} infringements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyInfringements}</div>
            <p className="text-xs text-muted-foreground">
              Infringements recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Officers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueOfficers}</div>
            <p className="text-xs text-muted-foreground">
              Recording infringements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Locations Covered
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueLocations}</div>
            <p className="text-xs text-muted-foreground">
              Unique locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <AnalyticsCharts infringements={infringements || []} />
    </div>
  );
}
