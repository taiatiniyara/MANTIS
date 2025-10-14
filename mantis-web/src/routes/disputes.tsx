import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, TrendingUp, Clock, Search, Filter } from "lucide-react"

import { ProtectedRoute } from "@/components/protected-route"
import { DisputesTable } from "@/components/disputes-table"
import { DisputeDetailDialog } from "@/components/dispute-detail-dialog"
import { ResolveDisputeDialog } from "@/components/resolve-dispute-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getDisputes,
  getDisputeSummary,
  type Dispute,
  type DisputeStatus,
} from "@/lib/api/disputes"
import { usePermissions } from "@/hooks/use-permissions"

export const Route = createFileRoute("/disputes")({
  component: DisputesPage,
})

function DisputesPage() {
  return (
    <ProtectedRoute requiredRoles={["officer", "agency_admin", "central_admin"]}>
      <DisputesContent />
    </ProtectedRoute>
  )
}

function DisputesContent() {
  const { agencyId } = usePermissions()
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch disputes
  const { data, isLoading } = useQuery({
    queryKey: [
      "disputes",
      {
        status: statusFilter !== "all" ? statusFilter : undefined,
        agency_id: agencyId || undefined,
      },
    ],
    queryFn: () =>
      getDisputes({
        status: statusFilter !== "all" ? statusFilter : undefined,
        agency_id: agencyId || undefined,
      }),
  })

  // Fetch dispute summary
  const { data: summary } = useQuery({
    queryKey: ["dispute-summary", { agency_id: agencyId || undefined }],
    queryFn: () => getDisputeSummary({ agency_id: agencyId || undefined }),
  })

  const handleViewDetails = (dispute: Dispute) => {
    setSelectedDispute(dispute)
    setIsDetailDialogOpen(true)
  }

  const handleResolve = (dispute: Dispute) => {
    setSelectedDispute(dispute)
    setIsResolveDialogOpen(true)
  }

  // Filter disputes by search term
  const filteredDisputes = searchTerm
    ? data?.disputes.filter(
        (d) =>
          d.infringement?.infringement_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          d.infringement?.vehicle?.reg_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          d.citizen?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.reason.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data?.disputes

  return (
    <>
      <DisputeDetailDialog
        dispute={selectedDispute}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />

      <ResolveDisputeDialog
        dispute={selectedDispute}
        open={isResolveDialogOpen}
        onOpenChange={setIsResolveDialogOpen}
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Disputes
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Review and resolve citizen disputes
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
                <AlertCircle className="size-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {summary.total_disputes}
                </div>
                <p className="text-xs text-slate-500 mt-1">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open</CardTitle>
                <Clock className="size-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {summary.open_disputes}
                </div>
                <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                <TrendingUp className="size-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {summary.resolved_disputes}
                </div>
                <p className="text-xs text-slate-500 mt-1">Completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                <Clock className="size-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {summary.avg_resolution_time_hours
                    ? `${Math.round(summary.avg_resolution_time_hours)}h`
                    : "N/A"}
                </div>
                <p className="text-xs text-slate-500 mt-1">Time to resolve</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by infringement, vehicle, citizen..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as DisputeStatus | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <Filter className="size-4" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Dispute Queue</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading..."
                : `${filteredDisputes?.length || 0} of ${data?.total || 0} disputes`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : filteredDisputes && filteredDisputes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <AlertCircle className="size-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-900 dark:text-slate-50">
                  No disputes found
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {statusFilter !== "all"
                    ? "Try changing your filters"
                    : "No disputes have been filed"}
                </p>
              </div>
            ) : (
              <DisputesTable
                disputes={filteredDisputes || []}
                onViewDetails={handleViewDetails}
                onResolve={handleResolve}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
