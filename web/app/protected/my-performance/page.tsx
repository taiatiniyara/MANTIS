import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, FileText, CheckCircle, XCircle, Award } from "lucide-react";

export default async function MyPerformancePage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get current user's role
  const { data: currentUser } = await supabase
    .from("users")
    .select("role, agency_id, position, full_name")
    .eq("id", user.id)
    .single();

  if (!currentUser) {
    redirect("/protected");
  }

  // Check permissions - only officers can access
  if (currentUser.role !== "officer") {
    redirect("/protected");
  }

  // Get performance statistics
  const [
    totalInfringements,
    approvedInfringements,
    rejectedInfringements,
    thisMonthInfringements,
  ] = await Promise.all([
    // Total infringements
    supabase
      .from("infringements")
      .select("id", { count: "exact", head: true })
      .eq("officer_id", user.id),
    // Approved infringements
    supabase
      .from("infringements")
      .select("id", { count: "exact", head: true })
      .eq("officer_id", user.id)
      .eq("status", "approved"),
    // Rejected infringements
    supabase
      .from("infringements")
      .select("id", { count: "exact", head: true })
      .eq("officer_id", user.id)
      .eq("status", "rejected"),
    // This month's infringements
    supabase
      .from("infringements")
      .select("id", { count: "exact", head: true })
      .eq("officer_id", user.id)
      .gte("issued_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  // Calculate approval rate
  const totalProcessed = (approvedInfringements.count || 0) + (rejectedInfringements.count || 0);
  const approvalRate = totalProcessed > 0
    ? Math.round(((approvedInfringements.count || 0) / totalProcessed) * 100)
    : 0;

  // Get category breakdown
  const { data: categoryBreakdown } = await supabase
    .from("infringements")
    .select(`
      type:infringement_types (
        category:infringement_categories (
          name
        )
      )
    `)
    .eq("officer_id", user.id);

  // Count categories
  const categoryCounts = categoryBreakdown?.reduce((acc: Record<string, number>, inf: any) => {
    const categoryName = inf.type?.category?.name || "Unknown";
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCounts || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  // Get team average for comparison
  const { data: teamMembership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  let teamAverage = 0;
  let agencyAverage = 0;
  let officerRank = null;

  if (teamMembership) {
    // Get team members
    const { data: teamMembers } = await supabase
      .from("team_members")
      .select("user_id")
      .eq("team_id", teamMembership.team_id);

    if (teamMembers && teamMembers.length > 0) {
      // Get infringement counts for all team members
      const { data: teamInfringements } = await supabase
        .from("infringements")
        .select("officer_id")
        .in("officer_id", teamMembers.map(m => m.user_id));

      teamAverage = Math.round((teamInfringements?.length || 0) / teamMembers.length);

      // Calculate rank
      const memberCounts = teamMembers.map(member => {
        const count = teamInfringements?.filter(i => i.officer_id === member.user_id).length || 0;
        return { userId: member.user_id, count };
      });

      memberCounts.sort((a, b) => b.count - a.count);
      const rank = memberCounts.findIndex(m => m.userId === user.id) + 1;
      officerRank = `#${rank} of ${teamMembers.length}`;
    }
  }

  // Get agency average
  const { data: agencyOfficers } = await supabase
    .from("users")
    .select("id")
    .eq("agency_id", currentUser.agency_id)
    .eq("role", "officer");

  if (agencyOfficers && agencyOfficers.length > 0) {
    const agencyInfringementsResult = await supabase
      .from("infringements")
      .select("id", { count: "exact", head: true })
      .eq("agency_id", currentUser.agency_id);

    agencyAverage = Math.round((agencyInfringementsResult.count || 0) / agencyOfficers.length);
  }

  // Get recent performance (last 30 days breakdown)
  const { data: recentInfringements } = await supabase
    .from("infringements")
    .select("issued_at, status")
    .eq("officer_id", user.id)
    .gte("issued_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("issued_at", { ascending: true });

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Performance</h1>
        <p className="text-muted-foreground mt-1">
          Track your performance and compare with your team
        </p>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Infringements</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInfringements.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthInfringements.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Current month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {approvedInfringements.count} approved, {rejectedInfringements.count} rejected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Rank</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officerRank || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              Within your team
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison with Team and Agency */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Comparison</CardTitle>
            <CardDescription>
              How you compare to your team average
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your Total</span>
                <span className="text-2xl font-bold">{totalInfringements.count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Average</span>
                <span className="text-2xl font-bold">{teamAverage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Difference</span>
                <span className={`text-lg font-bold ${
                  (totalInfringements.count || 0) >= teamAverage ? "text-green-600" : "text-red-600"
                }`}>
                  {(totalInfringements.count || 0) >= teamAverage ? "+" : ""}
                  {(totalInfringements.count || 0) - teamAverage}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agency Comparison</CardTitle>
            <CardDescription>
              How you compare to agency average
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your Total</span>
                <span className="text-2xl font-bold">{totalInfringements.count || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Agency Average</span>
                <span className="text-2xl font-bold">{agencyAverage}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Difference</span>
                <span className={`text-lg font-bold ${
                  (totalInfringements.count || 0) >= agencyAverage ? "text-green-600" : "text-red-600"
                }`}>
                  {(totalInfringements.count || 0) >= agencyAverage ? "+" : ""}
                  {(totalInfringements.count || 0) - agencyAverage}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Top Categories</CardTitle>
          <CardDescription>
            Your most frequent infringement categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(([category, count]) => {
                const percentage = Math.round(((count as number) / (totalInfringements.count || 1)) * 100);
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{category}</span>
                      <span className="text-muted-foreground">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                No infringement data available yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Last 30 Days Activity</CardTitle>
          <CardDescription>
            Your recent infringement recording activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentInfringements && recentInfringements.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{recentInfringements.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {recentInfringements.filter(i => i.status === 'approved').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {recentInfringements.filter(i => i.status === 'pending').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                No activity in the last 30 days
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
