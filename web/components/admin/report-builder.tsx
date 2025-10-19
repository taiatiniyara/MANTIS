"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Download,
  TrendingUp,
  FileText,
  BarChart3,
  Filter,
  ArrowUpDown,
  Clock,
} from "lucide-react";

interface ReportBuilderProps {
  agencies: Array<{ id: string; name: string }>;
  infringementTypes: Array<{ id: string; code: string; name: string }>;
  users: Array<{ id: string; full_name: string; role: string }>;
}

export function ReportBuilder({
  agencies,
  infringementTypes,
  users,
}: ReportBuilderProps) {
  const [reportType, setReportType] = useState<string>("summary");
  const [comparisonType, setComparisonType] = useState<string>("mom");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [filters, setFilters] = useState({
    agency: "",
    infringementType: "",
    officer: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);

    // Build query parameters
    const params = new URLSearchParams();
    if (dateRange.from) params.append("from", dateRange.from);
    if (dateRange.to) params.append("to", dateRange.to);
    if (filters.agency) params.append("agency", filters.agency);
    if (filters.infringementType)
      params.append("type", filters.infringementType);
    if (filters.officer) params.append("officer", filters.officer);
    params.append("reportType", reportType);
    params.append("comparisonType", comparisonType);

    // Call API to generate report
    try {
      const response = await fetch(
        `/api/reports/generate?${params.toString()}`
      );
      const data = await response.json();

      // Handle report download or display
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: string) => {
    const params = new URLSearchParams();
    if (dateRange.from) params.append("from", dateRange.from);
    if (dateRange.to) params.append("to", dateRange.to);
    if (filters.agency) params.append("agency", filters.agency);
    params.append("format", format);

    const response = await fetch(`/api/reports/export?${params.toString()}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Report Configuration */}
      <div className="lg:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Report Configuration
            </CardTitle>
            <CardDescription>Customize your report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="financial">Financial Report</SelectItem>
                  <SelectItem value="performance">
                    Performance Report
                  </SelectItem>
                  <SelectItem value="comparison">Comparison Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, from: e.target.value })
                    }
                    placeholder="From"
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, to: e.target.value })
                    }
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            {/* Quick Date Ranges */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today);
                  lastWeek.setDate(today.getDate() - 7);
                  setDateRange({
                    from: lastWeek.toISOString().split("T")[0],
                    to: today.toISOString().split("T")[0],
                  });
                }}
              >
                Last 7 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today);
                  lastMonth.setDate(today.getDate() - 30);
                  setDateRange({
                    from: lastMonth.toISOString().split("T")[0],
                    to: today.toISOString().split("T")[0],
                  });
                }}
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const startOfMonth = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                  );
                  setDateRange({
                    from: startOfMonth.toISOString().split("T")[0],
                    to: today.toISOString().split("T")[0],
                  });
                }}
              >
                This Month
              </Button>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <Label>Agency</Label>
              <Select
                value={filters.agency}
                onValueChange={(value) =>
                  setFilters({ ...filters, agency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All agencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All agencies</SelectItem>
                  {agencies.map((agency) => (
                    <SelectItem key={agency.id} value={agency.id}>
                      {agency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Infringement Type</Label>
              <Select
                value={filters.infringementType}
                onValueChange={(value) =>
                  setFilters({ ...filters, infringementType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {infringementTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.code} - {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Officer</Label>
              <Select
                value={filters.officer}
                onValueChange={(value) =>
                  setFilters({ ...filters, officer: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All officers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All officers</SelectItem>
                  {users
                    .filter((u) => u.role === "officer")
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Comparison Options (only for comparison report) */}
            {reportType === "comparison" && (
              <div className="space-y-2">
                <Label>Comparison Type</Label>
                <Select
                  value={comparisonType}
                  onValueChange={setComparisonType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mom">Month over Month</SelectItem>
                    <SelectItem value="yoy">Year over Year</SelectItem>
                    <SelectItem value="qoq">Quarter over Quarter</SelectItem>
                    <SelectItem value="wow">Week over Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-4">
              <Button
                className="w-full"
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  "Generating..."
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("csv")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("pdf")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("xlsx")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduled Reports
            </CardTitle>
            <CardDescription>Automate report generation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Schedule Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview/Templates */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>
              Choose from pre-configured report templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="saved">Saved Reports</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <FileText className="h-8 w-8 text-primary" />
                        <Badge>Popular</Badge>
                      </div>
                      <CardTitle className="text-lg">Monthly Summary</CardTitle>
                      <CardDescription>
                        Complete overview of monthly infringement activity
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        <Badge variant="outline">New</Badge>
                      </div>
                      <CardTitle className="text-lg">
                        Performance Analysis
                      </CardTitle>
                      <CardDescription>
                        Officer and team performance metrics
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardHeader>
                      <FileText className="h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">
                        Financial Report
                      </CardTitle>
                      <CardDescription>
                        Revenue breakdown by GL code and category
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardHeader>
                      <ArrowUpDown className="h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">Trend Analysis</CardTitle>
                      <CardDescription>
                        Historical trends and comparisons
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardHeader>
                      <BarChart3 className="h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">
                        Category Breakdown
                      </CardTitle>
                      <CardDescription>
                        Detailed analysis by infringement category
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent transition-colors">
                    <CardHeader>
                      <Calendar className="h-8 w-8 text-primary" />
                      <CardTitle className="text-lg">
                        Custom Date Range
                      </CardTitle>
                      <CardDescription>
                        Build your own custom report
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="saved" className="mt-4">
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No saved reports yet</p>
                  <p className="text-sm">
                    Generate a report and save it for quick access
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="scheduled" className="mt-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            Weekly Summary
                          </CardTitle>
                          <CardDescription>
                            Every Monday at 9:00 AM
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            Monthly Financial
                          </CardTitle>
                          <CardDescription>
                            1st of each month at 8:00 AM
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
