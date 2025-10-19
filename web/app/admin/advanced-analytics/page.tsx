import { createClient } from "@/lib/supabase/server";
import { AdvancedAnalyticsDashboard } from "@/components/analytics/advanced-analytics-dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, PieChart, LineChart } from "lucide-react";

export default async function AdvancedAnalyticsPage() {
  const supabase = await createClient();

  // Get comprehensive data for analytics
  const { data: infringements } = await supabase
    .from("infringements")
    .select(`
      id,
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
      ),
      location:locations (
        id,
        name,
        type
      )
    `)
    .order("issued_at", { ascending: false });

  // Get agencies for filtering
  const { data: agencies } = await supabase
    .from("agencies")
    .select("id, name")
    .eq("is_active", true);

  // Get time-based statistics
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const { count: thisMonthCount } = await supabase
    .from("infringements")
    .select("*", { count: "exact", head: true })
    .gte("issued_at", startOfMonth.toISOString());

  const { count: lastMonthCount } = await supabase
    .from("infringements")
    .select("*", { count: "exact", head: true })
    .gte("issued_at", startOfLastMonth.toISOString())
    .lte("issued_at", endOfLastMonth.toISOString());

  const monthOverMonthChange = lastMonthCount
    ? ((thisMonthCount! - lastMonthCount) / lastMonthCount) * 100
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Deep insights and predictive analytics for your infringement data
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthCount || 0}</div>
            <p className={`text-xs ${monthOverMonthChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthOverMonthChange >= 0 ? '+' : ''}{monthOverMonthChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${infringements
                ?.reduce((sum, inf) => {
                  const fineAmount = inf.type?.[0]?.fine_amount || 0;
                  return sum + fineAmount;
                }, 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all infringements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Fine Amount
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${infringements && infringements.length > 0
                ? (
                    infringements.reduce((sum, inf) => {
                      const fineAmount = inf.type?.[0]?.fine_amount || 0;
                      return sum + fineAmount;
                    }, 0) / infringements.length
                  ).toFixed(2)
                : '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per infringement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Officers
            </CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(infringements?.map(i => i.officer_id).filter(Boolean)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Recording infringements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Dashboard */}
      <AdvancedAnalyticsDashboard
        infringements={infringements || []}
        agencies={agencies || []}
      />
    </div>
  );
}
