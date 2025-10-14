import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import {
  FileText,
  DollarSign,
  TrendingUp,
  Users,
  Download,
  BarChart3,
  PieChart,
  MapPin,
} from "lucide-react"

import { ProtectedRoute } from "@/components/protected-route"
import { StatisticsCard } from "@/components/statistics-card"
import { DateRangeFilter } from "@/components/date-range-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getInfringementStats,
  getOffenceBreakdown,
  getAgencyPerformance,
  getOfficerPerformance,
  getGeographicData,
  exportToCSV,
  type ReportFilters,
} from "@/lib/api/reports"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"
import { format } from "date-fns"

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
})

function ReportsPage() {
  return (
    <ProtectedRoute requiredRoles={["agency_admin", "central_admin"]}>
      <ReportsContent />
    </ProtectedRoute>
  )
}

function ReportsContent() {
  const { agencyId, isCentralAdmin } = usePermissions()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedAgency, setSelectedAgency] = useState<string>("all")

  // Build filters
  const filters: ReportFilters = {
    agency_id:
      isCentralAdmin && selectedAgency !== "all"
        ? selectedAgency
        : agencyId || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
  }

  // Fetch data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["infringement-stats", filters],
    queryFn: () => getInfringementStats(filters),
  })

  const { data: offenceData } = useQuery({
    queryKey: ["offence-breakdown", filters],
    queryFn: () => getOffenceBreakdown(filters),
  })

  const { data: agencyData } = useQuery({
    queryKey: ["agency-performance", filters],
    queryFn: () => getAgencyPerformance(filters),
    enabled: isCentralAdmin,
  })

  const { data: officerData } = useQuery({
    queryKey: ["officer-performance", filters],
    queryFn: () => getOfficerPerformance(filters),
  })

  const { data: geoData } = useQuery({
    queryKey: ["geographic-data", filters],
    queryFn: () => getGeographicData(filters),
  })

  // Export handlers
  const handleExportStats = () => {
    if (!stats) return
    exportToCSV([stats], "infringement_statistics")
    toast.success("Statistics exported", {
      description: "CSV file has been downloaded",
    })
  }

  const handleExportOffences = () => {
    if (!offenceData) return
    exportToCSV(offenceData, "offence_breakdown")
    toast.success("Offence data exported", {
      description: "CSV file has been downloaded",
    })
  }

  const handleExportOfficers = () => {
    if (!officerData) return
    exportToCSV(officerData, "officer_performance")
    toast.success("Officer data exported", {
      description: "CSV file has been downloaded",
    })
  }

  const handleExportAgencies = () => {
    if (!agencyData) return
    exportToCSV(agencyData, "agency_performance")
    toast.success("Agency data exported", {
      description: "CSV file has been downloaded",
    })
  }

  const handleClearDateRange = () => {
    setStartDate("")
    setEndDate("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Reports & Analytics
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Comprehensive reporting and performance analytics
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-start gap-4">
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onClear={handleClearDateRange}
        />

        {isCentralAdmin && (
          <Select value={selectedAgency} onValueChange={setSelectedAgency}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Agencies" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agencies</SelectItem>
              {/* Agency options would be loaded from API */}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Key Statistics */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatisticsCard
            title="Total Infringements"
            value={stats.total_infringements.toLocaleString()}
            subtitle={
              startDate && endDate
                ? `${format(new Date(startDate), "MMM dd")} - ${format(new Date(endDate), "MMM dd")}`
                : "All time"
            }
            icon={FileText}
            iconColor="text-blue-500"
          />
          <StatisticsCard
            title="Total Revenue"
            value={`$${stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            subtitle={`Avg: $${stats.average_fine.toFixed(2)} per fine`}
            icon={DollarSign}
            iconColor="text-green-500"
          />
          <StatisticsCard
            title="Payment Rate"
            value={`${stats.payment_rate.toFixed(1)}%`}
            subtitle={`${stats.paid} of ${stats.total_infringements} paid`}
            icon={TrendingUp}
            iconColor="text-orange-500"
          />
          <StatisticsCard
            title="Status Breakdown"
            value={`${stats.issued} Issued`}
            subtitle={`${stats.voided} voided, ${stats.disputed} disputed`}
            icon={BarChart3}
            iconColor="text-purple-500"
          />
        </div>
      ) : null}

      {/* Offence Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Offence Breakdown</CardTitle>
            <CardDescription>Most common offences by volume and revenue</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportOffences}
            disabled={!offenceData || offenceData.length === 0}
            className="gap-2"
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {offenceData && offenceData.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Offence Code
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Count
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Total Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Avg Fine
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      % of Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {offenceData.slice(0, 10).map((offence) => (
                    <tr
                      key={offence.offence_code}
                      className="bg-white border-b dark:bg-slate-950 dark:border-slate-800"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">
                        {offence.offence_code}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {offence.offence_description}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {offence.category || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-slate-50">
                        {offence.count}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-medium">
                        ${offence.total_revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">
                        ${offence.average_fine.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600 dark:text-slate-400">
                        {offence.percentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {offenceData.length > 10 && (
                <div className="text-sm text-slate-500 text-center py-4">
                  Showing top 10 of {offenceData.length} offences
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PieChart className="size-12 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">No offence data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Officer Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Officer Performance</CardTitle>
            <CardDescription>Individual officer statistics and accuracy</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportOfficers}
            disabled={!officerData || officerData.length === 0}
            className="gap-2"
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {officerData && officerData.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Officer
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Voided
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Disputed
                    </th>
                    <th scope="col" className="px-6 py-3 text-right">
                      Accuracy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {officerData.slice(0, 10).map((officer) => (
                    <tr
                      key={officer.officer_id}
                      className="bg-white border-b dark:bg-slate-950 dark:border-slate-800"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">
                        {officer.officer_name}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">
                        {officer.total_infringements}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-medium">
                        ${officer.total_revenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-red-600 dark:text-red-400">
                        {officer.voided_count}
                      </td>
                      <td className="px-6 py-4 text-right text-yellow-600 dark:text-yellow-400">
                        {officer.disputed_count}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        <span
                          className={
                            officer.accuracy_rate >= 90
                              ? "text-green-600 dark:text-green-400"
                              : officer.accuracy_rate >= 75
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                          }
                        >
                          {officer.accuracy_rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="size-12 text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm text-slate-500">No officer data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agency Performance (Central Admin Only) */}
      {isCentralAdmin && agencyData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Agency Performance</CardTitle>
              <CardDescription>Comparison across agencies</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAgencies}
              disabled={!agencyData || agencyData.length === 0}
              className="gap-2"
            >
              <Download className="size-4" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            {agencyData.length > 0 ? (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Agency
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Infringements
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Revenue
                      </th>
                      <th scope="col" className="px-6 py-3 text-right">
                        Payment Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {agencyData.map((agency) => (
                      <tr
                        key={agency.agency_id}
                        className="bg-white border-b dark:bg-slate-950 dark:border-slate-800"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">
                          {agency.agency_name}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">
                          {agency.total_infringements}
                        </td>
                        <td className="px-6 py-4 text-right text-green-600 dark:text-green-400 font-medium">
                          ${agency.total_revenue.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          <span
                            className={
                              agency.payment_rate >= 70
                                ? "text-green-600 dark:text-green-400"
                                : agency.payment_rate >= 50
                                  ? "text-yellow-600 dark:text-yellow-400"
                                  : "text-red-600 dark:text-red-400"
                            }
                          >
                            {agency.payment_rate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BarChart3 className="size-12 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm text-slate-500">No agency data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Geographic Heatmap Data */}
      {geoData && geoData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-5" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>
              {geoData.length} locations with infringement activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <p className="mb-2">Top 5 hotspots:</p>
              <ul className="space-y-2">
                {geoData.slice(0, 5).map((location, index) => (
                  <li key={index} className="flex justify-between">
                    <span>
                      {location.location_description} ({location.infringement_count} infringements)
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      ${location.total_revenue.toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                Note: Interactive heatmap visualization coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export All Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Export All Reports
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Download comprehensive data package
              </p>
            </div>
            <Button
              onClick={handleExportStats}
              disabled={!stats}
              className="gap-2"
            >
              <Download className="size-4" />
              Export Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
