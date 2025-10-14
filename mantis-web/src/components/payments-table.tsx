import { format } from "date-fns"
import { CheckCircle, XCircle, Clock, Eye, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Payment } from "@/lib/api/payments"

interface PaymentsTableProps {
  payments: Payment[]
  onViewDetails?: (payment: Payment) => void
  onRetry?: (payment: Payment) => void
}

const statusConfig = {
  success: {
    label: "Success",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    icon: CheckCircle,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    icon: Clock,
  },
  failed: {
    label: "Failed",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    icon: XCircle,
  },
}

const methodLabels = {
  card: "Card",
  mpaisa: "M-Paisa",
  mycash: "MyCash",
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function PaymentsTable({ payments, onViewDetails, onRetry }: PaymentsTableProps) {
  if (payments.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Receipt #
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Infringement
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Vehicle
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Method
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Date
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-900 dark:text-slate-50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => {
            const statusInfo = statusConfig[payment.status]
            const StatusIcon = statusInfo.icon

            return (
              <tr
                key={payment.id}
                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-50">
                  {payment.receipt_number || "-"}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    {payment.infringement?.infringement_number}
                  </div>
                  <div className="text-xs text-slate-500">
                    {payment.infringement?.offence?.code}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-50">
                  {payment.infringement?.vehicle?.reg_number || "-"}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {methodLabels[payment.method]}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}
                  >
                    <StatusIcon className="size-3" />
                    {statusInfo.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {format(new Date(payment.created_at), "MMM dd, yyyy")}
                  <div className="text-xs text-slate-500">
                    {format(new Date(payment.created_at), "hh:mm a")}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails?.(payment)}
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/20"
                    >
                      <Eye className="size-4" />
                    </Button>
                    {payment.status === "failed" && onRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRetry(payment)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/20"
                      >
                        <RefreshCw className="size-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
