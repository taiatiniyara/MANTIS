"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Users, MapPin } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Infringement {
  id: string;
  vehicle_id: string;
  issued_at: string;
  agency_id: string | null;
  type: {
    id: string;
    code: string;
    name: string;
    fine_amount: number | null;
    category: {
      id: string;
      name: string;
    };
  } | null;
  location: {
    id: string;
    name: string;
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
}

interface AnalyticsChartsProps {
  infringements: Infringement[];
}

interface MonthlyData {
  month: string;
  count: number;
  amount: number;
}

interface TeamData {
  name: string;
  count: number;
  percentage: number;
}

interface LocationData {
  name: string;
  count: number;
  percentage: number;
}

export function AnalyticsCharts({ infringements }: AnalyticsChartsProps) {
  // Monthly Trend
  const monthlyData = (() => {
    const map = new Map<string, { count: number; amount: number }>();

    infringements.forEach((inf) => {
      const date = new Date(inf.issued_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!map.has(monthKey)) {
        map.set(monthKey, { count: 0, amount: 0 });
      }

      const entry = map.get(monthKey)!;
      entry.count++;
      entry.amount += inf.type?.fine_amount || 0;
    });

    const sorted = Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        count: data.count,
        amount: data.amount,
      }));

    return sorted.slice(-6); // Last 6 months
  })();

  const maxCount = Math.max(...monthlyData.map((d) => d.count), 1);

  // Team Performance
  const teamData = (() => {
    const map = new Map<string, number>();

    infringements.forEach((inf) => {
      if (inf.team) {
        map.set(inf.team.name, (map.get(inf.team.name) || 0) + 1);
      }
    });

    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / infringements.length) * 100,
      }));

    return sorted;
  })();

  const maxTeamCount = Math.max(...teamData.map((d) => d.count), 1);

  // Location Hotspots
  const locationData = (() => {
    const map = new Map<string, number>();

    infringements.forEach((inf) => {
      if (inf.location) {
        map.set(inf.location.name, (map.get(inf.location.name) || 0) + 1);
      }
    });

    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: (count / infringements.length) * 100,
      }));

    return sorted;
  })();

  const maxLocationCount = Math.max(...locationData.map((d) => d.count), 1);

  function formatMonth(monthKey: string) {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Monthly Trend Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Trend
              </CardTitle>
              <CardDescription>
                Infringement count and fine amounts over the last 6 months
              </CardDescription>
            </div>
            <Badge variant="outline">Last 6 Months</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No data available
            </div>
          ) : (
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{formatMonth(data.month)}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {data.count} infringement{data.count === 1 ? "" : "s"}
                      </span>
                      <span className="font-medium">${data.amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-8 w-full rounded-lg bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{
                        width: `${(data.count / maxCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Performance
          </CardTitle>
          <CardDescription>Top 5 teams by infringement count</CardDescription>
        </CardHeader>
        <CardContent>
          {teamData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No team data available
            </div>
          ) : (
            <div className="space-y-4">
              {teamData.map((team, index) => (
                <div key={team.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-8 justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{team.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({team.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                      style={{
                        width: `${(team.count / maxTeamCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Hotspots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Hotspots
          </CardTitle>
          <CardDescription>Top 5 locations by infringement count</CardDescription>
        </CardHeader>
        <CardContent>
          {locationData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              No location data available
            </div>
          ) : (
            <div className="space-y-4">
              {locationData.map((location, index) => (
                <div key={location.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-8 justify-center">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{location.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{location.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({location.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all"
                      style={{
                        width: `${(location.count / maxLocationCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Distribution Pie Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Category Distribution
          </CardTitle>
          <CardDescription>Infringement breakdown by category</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            // Calculate category distribution
            const categoryMap = new Map<string, number>();
            infringements.forEach((inf) => {
              if (inf.type?.category) {
                const name = inf.type.category.name;
                categoryMap.set(name, (categoryMap.get(name) || 0) + 1);
              }
            });

            const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
              name,
              value,
            }));

            const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"];

            return categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                No category data available
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Daily Trend Line Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Daily Trend (Last 30 Days)</CardTitle>
          <CardDescription>Infringement count per day</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const last30Days = Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (29 - i));
              date.setHours(0, 0, 0, 0);
              return date;
            });

            const dailyData = last30Days.map((date) => {
              const nextDay = new Date(date);
              nextDay.setDate(nextDay.getDate() + 1);

              const count = infringements.filter((inf) => {
                const infDate = new Date(inf.issued_at);
                return infDate >= date && infDate < nextDay;
              }).length;

              return {
                date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                count,
              };
            });

            return (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Infringements"
                  />
                </LineChart>
              </ResponsiveContainer>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
