import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DollarSign, TrendingUp, Search, Filter } from "lucide-react"

import { ProtectedRoute } from "@/components/protected-route"
import { PaymentsTable } from "@/components/payments-table"
import { PaymentDetailDialog } from "@/components/payment-detail-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getPayments,
  getPaymentSummary,
  retryPayment,
  type Payment,
  type PaymentStatus,
  type PaymentMethod,
} from "@/lib/api/payments"
import { toast } from "sonner"

export const Route = createFileRoute("/payments")({
  component: PaymentsPage,
})

function PaymentsPage() {
  return (
    <ProtectedRoute requiredRoles={["officer", "agency_admin", "central_admin"]}>
      <PaymentsContent />
    </ProtectedRoute>
  )
}

function PaymentsContent() {
  const queryClient = useQueryClient()
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all")
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch payments
  const { data, isLoading } = useQuery({
    queryKey: [
      "payments",
      {
        status: statusFilter !== "all" ? statusFilter : undefined,
        method: methodFilter !== "all" ? methodFilter : undefined,
      },
    ],
    queryFn: () =>
      getPayments({
        status: statusFilter !== "all" ? statusFilter : undefined,
        method: methodFilter !== "all" ? methodFilter : undefined,
      }),
  })

  // Fetch payment summary
  const { data: summary } = useQuery({
    queryKey: ["payment-summary"],
    queryFn: () => getPaymentSummary(),
  })

  // Retry payment mutation
  const retryMutation = useMutation({
    mutationFn: retryPayment,
    onSuccess: (data) => {
      if (data.status === "success") {
        toast.success("Payment retry successful!", {
          description: `Receipt: ${data.receipt_number}`,
        })
      } else {
        toast.error("Payment retry failed", {
          description: "Please try again or use a different payment method.",
        })
      }
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["payment-summary"] })
    },
    onError: (error: Error) => {
      toast.error("Retry failed", {
        description: error.message,
      })
    },
  })

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsDetailDialogOpen(true)
  }

  const handleRetry = (payment: Payment) => {
    retryMutation.mutate(payment.id)
  }

  // Filter payments by search term (client-side for now)
  const filteredPayments = searchTerm
    ? data?.payments.filter(
        (p) =>
          p.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.infringement?.infringement_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          p.infringement?.vehicle?.reg_number
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : data?.payments

  return (
    <>
      <PaymentDetailDialog
        payment={selectedPayment}
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
      />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Payments
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Track and manage payment transactions
          </p>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="size-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${summary.total_amount.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  From {summary.successful_payments} payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Successful</CardTitle>
                <TrendingUp className="size-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {summary.successful_payments}
                </div>
                <p className="text-xs text-slate-500 mt-1">Completed transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <DollarSign className="size-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {summary.pending_payments}
                </div>
                <p className="text-xs text-slate-500 mt-1">Processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <DollarSign className="size-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {summary.failed_payments}
                </div>
                <p className="text-xs text-slate-500 mt-1">Need attention</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search by receipt, vehicle..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as PaymentStatus | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={methodFilter}
                onValueChange={(value) => setMethodFilter(value as PaymentMethod | "all")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mpaisa">M-Paisa</SelectItem>
                  <SelectItem value="mycash">MyCash</SelectItem>
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
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading..."
                : `${filteredPayments?.length || 0} of ${data?.total || 0} payments`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : filteredPayments && filteredPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                  <DollarSign className="size-8 text-slate-400" />
                </div>
                <p className="text-lg font-medium text-slate-900 dark:text-slate-50">
                  No payments found
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  No payment transactions match your filters
                </p>
              </div>
            ) : (
              <PaymentsTable
                payments={filteredPayments || []}
                onViewDetails={handleViewDetails}
                onRetry={handleRetry}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
