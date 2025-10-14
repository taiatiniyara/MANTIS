import { format } from "date-fns"
import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Hash,
  User,
  XCircle,
  Car,
  Building2,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Payment } from "@/lib/api/payments"

interface PaymentDetailDialogProps {
  payment: Payment | null
  open: boolean
  onOpenChange: (open: boolean) => void
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
  card: "Credit/Debit Card",
  mpaisa: "M-Paisa (Vodafone)",
  mycash: "MyCash (Digicel)",
}

export function PaymentDetailDialog({
  payment,
  open,
  onOpenChange,
}: PaymentDetailDialogProps) {
  if (!payment) return null

  const statusInfo = statusConfig[payment.status]
  const StatusIcon = statusInfo.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Details</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
            >
              <StatusIcon className="size-4" />
              {statusInfo.label}
            </span>
          </DialogTitle>
          <DialogDescription>
            {payment.receipt_number ? `Receipt #${payment.receipt_number}` : "Payment Record"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Information */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">
              Payment Information
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Hash className="mt-1 size-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Receipt Number</p>
                  <p className="text-base font-mono text-slate-900 dark:text-slate-50">
                    {payment.receipt_number || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CreditCard className="mt-1 size-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Payment Method</p>
                  <p className="text-base text-slate-900 dark:text-slate-50">
                    {methodLabels[payment.method]}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="mt-1 size-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Amount Paid</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    ${payment.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {payment.provider_ref && (
                <div className="flex items-start gap-3">
                  <Hash className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Provider Reference</p>
                    <p className="text-xs font-mono text-slate-900 dark:text-slate-50 break-all">
                      {payment.provider_ref}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="mt-1 size-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Payment Date</p>
                  <p className="text-base text-slate-900 dark:text-slate-50">
                    {payment.paid_at
                      ? format(new Date(payment.paid_at), "MMMM dd, yyyy")
                      : "Not completed"}
                  </p>
                  {payment.paid_at && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {format(new Date(payment.paid_at), "hh:mm a")}
                    </p>
                  )}
                </div>
              </div>

              {payment.paid_by?.display_name && (
                <div className="flex items-start gap-3">
                  <User className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Paid By</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">
                      {payment.paid_by.display_name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Infringement Details */}
          {payment.infringement && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Related Infringement
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Infringement Number</p>
                    <p className="text-base font-medium text-slate-900 dark:text-slate-50">
                      {payment.infringement.infringement_number}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Vehicle</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">
                      {payment.infringement.vehicle?.reg_number || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Offence</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      {payment.infringement.offence?.code}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {payment.infringement.offence?.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Issuing Agency</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">
                      {payment.infringement.agency?.name || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Issued Date</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">
                      {format(new Date(payment.infringement.issued_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Fine Amount</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-slate-50">
                      ${payment.infringement.fine_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Message */}
          {payment.status === "failed" && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
              <div className="flex gap-3">
                <XCircle className="size-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900 dark:text-red-100">
                    Payment Failed
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    This payment could not be processed. Please try again or contact support
                    if the issue persists.
                  </p>
                </div>
              </div>
            </div>
          )}

          {payment.status === "pending" && (
            <div className="rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 p-4">
              <div className="flex gap-3">
                <Clock className="size-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Payment Pending
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This payment is being processed. Please check back later.
                  </p>
                </div>
              </div>
            </div>
          )}

          {payment.status === "success" && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20 p-4">
              <div className="flex gap-3">
                <CheckCircle className="size-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Payment Successful
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    This payment has been successfully processed and the infringement has been
                    marked as paid.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
            {payment.status === "success" && (
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                onClick={() => {
                  // TODO: Implement receipt download/print
                  alert("Receipt download coming soon!")
                }}
              >
                Download Receipt
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
