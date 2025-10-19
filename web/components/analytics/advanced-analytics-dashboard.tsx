"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Download, Filter, TrendingUp, Users, MapPin, Calendar } from "lucide-react";

interface AdvancedAnalyticsDashboardProps {
  infringements: any[];
  agencies: Array<{ id: string; name: string }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export function AdvancedAnalyticsDashboard({
  infringements,
  agencies,
}: AdvancedAnalyticsDashboardProps) {
  const [selectedAgency, setSelectedAgency] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");

  // Filter infringements based on selections
  const filteredInfringements = useMemo(() => {
    let filtered = infringements;

    if (selectedAgency !== "all") {
      filtered = filtered.filter((inf) => inf.agency_id === selectedAgency);
    }

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
    filtered = filtered.filter(
      (inf) => new Date(inf.issued_at) >= daysAgo
    );

    return filtered;
  }, [infringements, selectedAgency, dateRange]);

  // Daily trend data
  const dailyTrendData = useMemo(() => {
    const days = parseInt(dateRange);
    const data: Record<string, { date: string; count: number; revenue: number }> = {};

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      data[dateStr] = { date: dateStr, count: 0, revenue: 0 };
    }

    filteredInfringements.forEach((inf) => {
      const dateStr = new Date(inf.issued_at).toISOString().split("T")[0];
      if (data[dateStr]) {
        data[dateStr].count++;
        data[dateStr].revenue += inf.type?.[0]?.fine_amount || 0;
      }
    });

    return Object.values(data);
  }, [filteredInfringements, dateRange]);

  // Category distribution
  const categoryData = useMemo(() => {
    const categories: Record<string, { name: string; value: number; revenue: number }> = {};

    filteredInfringements.forEach((inf) => {
      const categoryName = inf.type?.[0]?.category?.[0]?.name || "Unknown";
      if (!categories[categoryName]) {
        categories[categoryName] = { name: categoryName, value: 0, revenue: 0 };
      }
      categories[categoryName].value++;
      categories[categoryName].revenue += inf.type?.[0]?.fine_amount || 0;
    });

    return Object.values(categories).sort((a, b) => b.value - a.value);
  }, [filteredInfringements]);

  // Officer performance
  const officerPerformance = useMemo(() => {
    const officers: Record<string, { name: string; count: number; revenue: number }> = {};

    filteredInfringements.forEach((inf) => {
      const officerName = inf.officer?.[0]?.full_name || "Unknown";
      const officerId = inf.officer?.[0]?.id || "unknown";
      if (!officers[officerId]) {
        officers[officerId] = { name: officerName, count: 0, revenue: 0 };
      }
      officers[officerId].count++;
      officers[officerId].revenue += inf.type?.[0]?.fine_amount || 0;
    });

    return Object.values(officers)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredInfringements]);

  // Agency comparison
  const agencyData = useMemo(() => {
    const agencyStats: Record<string, { name: string; count: number; revenue: number }> = {};

    filteredInfringements.forEach((inf) => {
      const agencyName = inf.agency?.[0]?.name || "Unknown";
      const agencyId = inf.agency?.[0]?.id || "unknown";
      if (!agencyStats[agencyId]) {
        agencyStats[agencyId] = { name: agencyName, count: 0, revenue: 0 };
      }
      agencyStats[agencyId].count++;
      agencyStats[agencyId].revenue += inf.type?.[0]?.fine_amount || 0;
    });

    return Object.values(agencyStats);
  }, [filteredInfringements]);

  // Location hotspots
  const locationData = useMemo(() => {
    const locations: Record<string, { name: string; count: number }> = {};

    filteredInfringements.forEach((inf) => {
      const locationName = inf.location?.[0]?.name || "Unknown";
      const locationId = inf.location?.[0]?.id || "unknown";
      if (!locations[locationId]) {
        locations[locationId] = { name: locationName, count: 0 };
      }
      locations[locationId].count++;
    });

    return Object.values(locations)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredInfringements]);

  // Hour of day distribution
  const hourlyData = useMemo(() => {
    const hours: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hours[i] = 0;
    }

    filteredInfringements.forEach((inf) => {
      const hour = new Date(inf.issued_at).getHours();
      hours[hour]++;
    });

    return Object.entries(hours).map(([hour, count]) => ({
      hour: `${hour}:00`,
      count,
    }));
  }, [filteredInfringements]);

  const handleExportData = () => {
    const csv = [
      ["Date", "Type", "Category", "Fine", "Officer", "Agency", "Location"].join(","),
      ...filteredInfringements.map((inf) =>
        [
          new Date(inf.issued_at).toLocaleDateString(),
          inf.type?.[0]?.name || "",
          inf.type?.[0]?.category?.[0]?.name || "",
          inf.type?.[0]?.fine_amount || 0,
          inf.officer?.[0]?.full_name || "",
          inf.agency?.[0]?.name || "",
          inf.location?.[0]?.name || "",
        ]
          .map((v) => `"${v}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Controls
              </CardTitle>
              <CardDescription>
                Customize your analytics view
              </CardDescription>
            </div>
            <Button onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agency</label>
              <Select value={selectedAgency} onValueChange={setSelectedAgency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agencies</SelectItem>
                  {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="365">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Records</label>
              <div className="h-10 flex items-center">
                <span className="text-2xl font-bold">
                  {filteredInfringements.length}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  infringements
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="officers">Officers</TabsTrigger>
          <TabsTrigger value="agencies">Agencies</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Infringements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" name="Count" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" name="Revenue ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Hourly Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Infringements" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={categoryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Officers Tab */}
        <TabsContent value="officers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Performing Officers
              </CardTitle>
              <CardDescription>
                Officers ranked by number of infringements recorded
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={officerPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Infringements" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agencies Tab */}
        <TabsContent value="agencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agency Comparison</CardTitle>
              <CardDescription>
                Compare performance across agencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={agencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Infringements" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Hotspots
              </CardTitle>
              <CardDescription>
                Top 10 locations by infringement count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={locationData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Infringements" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
