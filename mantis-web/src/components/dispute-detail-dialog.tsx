import { format } from "date-fns"
import {
  AlertCircle,
  Calendar,
  Car,
  FileText,
  User,
  Building2,
  CreditCard,
  MapPin,
  CheckCircle,
  ArrowUpCircle,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { type Dispute } from "@/lib/api/disputes"

interface DisputeDetailDialogProps {
  dispute: Dispute | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig = {
  open: {
    icon: AlertCircle,
    label: "Open",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  },
  resolved: {
    icon: CheckCircle,
    label: "Resolved",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  escalated: {
    icon: ArrowUpCircle,
    label: "Escalated",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  },
}

export function DisputeDetailDialog({ dispute, open, onOpenChange }: DisputeDetailDialogProps) {
  if (!dispute) return null

  const StatusIcon = statusConfig[dispute.status].icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">Dispute Details</DialogTitle>
              <DialogDescription className="mt-2">
                Filed {format(new Date(dispute.created_at), "MMMM dd, yyyy 'at' hh:mm a")}
              </DialogDescription>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig[dispute.status].className}`}
            >
              <StatusIcon className="size-3" />
              {statusConfig[dispute.status].label}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Dispute Information */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
              Dispute Reason
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {dispute.reason}
            </p>
          </div>

          {/* Citizen Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-start gap-3">
                <User className="mt-1 size-5 text-slate-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-500">Submitted By</p>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                    {dispute.citizen?.display_name || "Unknown"}
                  </p>
                  {dispute.citizen?.email && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {dispute.citizen.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {dispute.resolved_by && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Resolved By</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      {dispute.resolved_by.display_name}
                    </p>
                    {dispute.resolved_at && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {format(new Date(dispute.resolved_at), "MMM dd, yyyy 'at' hh:mm a")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resolution Notes */}
          {dispute.resolution_notes && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
                Resolution Notes
              </h3>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {dispute.resolution_notes}
              </p>
            </div>
          )}

          {/* Related Infringement */}
          {dispute.infringement && (
            <div className="rounded-lg border-2 border-orange-200 dark:border-orange-900/30 bg-orange-50/50 dark:bg-orange-950/10 p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4 flex items-center gap-2">
                <FileText className="size-4" />
                Related Infringement
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-1 size-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500">Infringement Number</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {dispute.infringement.infringement_number}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Status: {dispute.infringement.status}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Car className="mt-1 size-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500">Vehicle</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {dispute.infringement.vehicle?.reg_number}
                      </p>
                      {(dispute.infringement.vehicle?.make ||
                        dispute.infringement.vehicle?.model) && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {dispute.infringement.vehicle.make} {dispute.infringement.vehicle.model}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="mt-1 size-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500">Agency</p>
                      <p className="text-sm text-slate-900 dark:text-slate-50">
                        {dispute.infringement.agency?.name}
                      </p>
                      {dispute.infringement.officer && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Officer: {dispute.infringement.officer.display_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-1 size-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500">Offence</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {dispute.infringement.offence?.code}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {dispute.infringement.offence?.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="mt-1 size-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500">Fine Amount</p>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        ${dispute.infringement.fine_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 size-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500">Issued Date</p>
                      <p className="text-sm text-slate-900 dark:text-slate-50">
                        {format(new Date(dispute.infringement.issued_at), "MMM dd, yyyy")}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {format(new Date(dispute.infringement.issued_at), "hh:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {dispute.infringement.location_description && (
                <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-900/30">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-1 size-4 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-500">Location</p>
                      <p className="text-sm text-slate-900 dark:text-slate-50">
                        {dispute.infringement.location_description}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 size-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    Dispute Filed
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {format(new Date(dispute.created_at), "MMMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>
              {dispute.resolved_at && (
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-2 rounded-full bg-green-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      Dispute {dispute.status === "resolved" ? "Resolved" : "Escalated"}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {format(new Date(dispute.resolved_at), "MMMM dd, yyyy 'at' hh:mm a")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
