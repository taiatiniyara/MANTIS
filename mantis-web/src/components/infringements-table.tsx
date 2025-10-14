import { format } from "date-fns"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Infringement } from "@/lib/api/infringements"

interface InfringementsTableProps {
  infringements: Infringement[]
  onViewDetails?: (infringement: Infringement) => void
}

const statusColors = {
  issued: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  voided: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  disputed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}

export function InfringementsTable({
  infringements,
  onViewDetails,
}: InfringementsTableProps) {
  if (infringements.length === 0) {
    return null
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Infringement #
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Vehicle
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Offence
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Fine Amount
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Issued Date
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-slate-900 dark:text-slate-50">
              Agency
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-slate-900 dark:text-slate-50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {infringements.map((infringement) => (
            <tr
              key={infringement.id}
              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-50">
                {infringement.infringement_number}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  {infringement.vehicle?.reg_number}
                </div>
                {(infringement.vehicle?.make || infringement.vehicle?.model) && (
                  <div className="text-xs text-slate-500">
                    {infringement.vehicle.make} {infringement.vehicle.model}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm">
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  {infringement.offence?.code}
                </div>
                <div className="text-xs text-slate-500 max-w-[200px] truncate">
                  {infringement.offence?.description}
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-50">
                {formatCurrency(infringement.fine_amount)}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    statusColors[infringement.status]
                  }`}
                >
                  {infringement.status.charAt(0).toUpperCase() + infringement.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                {format(new Date(infringement.issued_at), "MMM dd, yyyy")}
                <div className="text-xs text-slate-500">
                  {format(new Date(infringement.issued_at), "hh:mm a")}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                {infringement.agency?.name}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(infringement)}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/20"
                >
                  <Eye className="size-4" />
                  <span className="ml-2">View</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
