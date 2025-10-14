import { useState } from "react"
import { Calendar } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onClear: () => void
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
}: DateRangeFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const handleQuickSelect = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)

    onStartDateChange(format(start, "yyyy-MM-dd"))
    onEndDateChange(format(end, "yyyy-MM-dd"))
    setShowFilters(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Calendar className="size-4" />
          Date Range
          {(startDate || endDate) && (
            <span className="text-xs text-orange-600 dark:text-orange-400">
              (Active)
            </span>
          )}
        </Button>

        {(startDate || endDate) && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(7)}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(30)}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSelect(90)}
                >
                  Last 90 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const start = new Date()
                    start.setMonth(0, 1) // January 1st
                    onStartDateChange(format(start, "yyyy-MM-dd"))
                    onEndDateChange(format(new Date(), "yyyy-MM-dd"))
                  }}
                >
                  Year to Date
                </Button>
              </div>

              {/* Custom Date Inputs */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    max={endDate || format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    min={startDate}
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
              </div>

              {/* Current Range Display */}
              {startDate && endDate && (
                <div className="text-sm text-slate-600 dark:text-slate-400 text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                  Showing data from{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-50">
                    {format(new Date(startDate), "MMM dd, yyyy")}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-50">
                    {format(new Date(endDate), "MMM dd, yyyy")}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
