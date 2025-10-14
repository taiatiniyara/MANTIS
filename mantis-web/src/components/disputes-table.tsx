import { format } from "date-fns"
import { AlertCircle, CheckCircle, ArrowUpCircle, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type Dispute } from "@/lib/api/disputes"

interface DisputesTableProps {
  disputes: Dispute[]
  onViewDetails: (dispute: Dispute) => void
  onResolve: (dispute: Dispute) => void
}

const statusConfig = {
  open: {
    icon: AlertCircle,
    label: "Open",
    className: "text-yellow-600 dark:text-yellow-400",
  },
  resolved: {
    icon: CheckCircle,
    label: "Resolved",
    className: "text-green-600 dark:text-green-400",
  },
  escalated: {
    icon: ArrowUpCircle,
    label: "Escalated",
    className: "text-red-600 dark:text-red-400",
  },
}

export function DisputesTable({ disputes, onViewDetails, onResolve }: DisputesTableProps) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
          <tr>
            <th scope="col" className="px-6 py-3">
              Infringement
            </th>
            <th scope="col" className="px-6 py-3">
              Vehicle
            </th>
            <th scope="col" className="px-6 py-3">
              Citizen
            </th>
            <th scope="col" className="px-6 py-3">
              Reason
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
            <th scope="col" className="px-6 py-3">
              Created
            </th>
            <th scope="col" className="px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {disputes.map((dispute) => {
            const StatusIcon = statusConfig[dispute.status].icon
            return (
              <tr
                key={dispute.id}
                className="bg-white border-b dark:bg-slate-950 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
              >
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">
                  {dispute.infringement?.infringement_number || "N/A"}
                  <div className="text-xs text-slate-500 mt-0.5">
                    ${dispute.infringement?.fine_amount.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900 dark:text-slate-50">
                    {dispute.infringement?.vehicle?.reg_number || "N/A"}
                  </div>
                  {(dispute.infringement?.vehicle?.make ||
                    dispute.infringement?.vehicle?.model) && (
                    <div className="text-xs text-slate-500">
                      {dispute.infringement.vehicle.make} {dispute.infringement.vehicle.model}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-900 dark:text-slate-50">
                    {dispute.citizen?.display_name || "Unknown"}
                  </div>
                  {dispute.citizen?.email && (
                    <div className="text-xs text-slate-500">{dispute.citizen.email}</div>
                  )}
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <div className="truncate text-slate-700 dark:text-slate-300">
                    {dispute.reason}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`size-4 ${statusConfig[dispute.status].className}`} />
                    <span className={statusConfig[dispute.status].className}>
                      {statusConfig[dispute.status].label}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  <div>{format(new Date(dispute.created_at), "MMM dd, yyyy")}</div>
                  <div className="text-xs">{format(new Date(dispute.created_at), "hh:mm a")}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(dispute)}
                      className="h-8 px-3"
                    >
                      <Eye className="size-4 mr-1" />
                      View
                    </Button>
                    {dispute.status === "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onResolve(dispute)}
                        className="h-8 px-3"
                      >
                        Resolve
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
