import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle, XCircle, ArrowUpCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { resolveDispute, escalateDispute, type Dispute } from "@/lib/api/disputes"
import { toast } from "sonner"

interface ResolveDisputeDialogProps {
  dispute: Dispute | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResolveDisputeDialog({ dispute, open, onOpenChange }: ResolveDisputeDialogProps) {
  const queryClient = useQueryClient()
  const [resolutionNotes, setResolutionNotes] = useState("")
  const [action, setAction] = useState<"approve" | "reject" | "escalate" | null>(null)

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: (approve: boolean) =>
      resolveDispute({
        dispute_id: dispute!.id,
        resolution_notes: resolutionNotes,
        approve,
      }),
    onSuccess: (_data, approve) => {
      const action = approve ? "approved" : "rejected"
      toast.success(`Dispute ${action}`, {
        description: `The infringement has been ${approve ? "voided" : "reinstated"}.`,
      })
      queryClient.invalidateQueries({ queryKey: ["disputes"] })
      queryClient.invalidateQueries({ queryKey: ["dispute-summary"] })
      queryClient.invalidateQueries({ queryKey: ["infringements"] })
      onOpenChange(false)
      setResolutionNotes("")
      setAction(null)
    },
    onError: (error: Error) => {
      toast.error("Failed to resolve dispute", {
        description: error.message,
      })
      setAction(null)
    },
  })

  // Escalate mutation
  const escalateMutation = useMutation({
    mutationFn: (notes: string) => escalateDispute(dispute!.id, notes),
    onSuccess: () => {
      toast.success("Dispute escalated", {
        description: "The dispute has been escalated to a higher authority.",
      })
      queryClient.invalidateQueries({ queryKey: ["disputes"] })
      queryClient.invalidateQueries({ queryKey: ["dispute-summary"] })
      onOpenChange(false)
      setResolutionNotes("")
      setAction(null)
    },
    onError: (error: Error) => {
      toast.error("Failed to escalate dispute", {
        description: error.message,
      })
      setAction(null)
    },
  })

  const handleApprove = () => {
    if (!resolutionNotes.trim()) {
      toast.error("Resolution notes required", {
        description: "Please provide notes explaining your decision.",
      })
      return
    }
    setAction("approve")
    resolveMutation.mutate(true)
  }

  const handleReject = () => {
    if (!resolutionNotes.trim()) {
      toast.error("Resolution notes required", {
        description: "Please provide notes explaining your decision.",
      })
      return
    }
    setAction("reject")
    resolveMutation.mutate(false)
  }

  const handleEscalate = () => {
    if (!resolutionNotes.trim()) {
      toast.error("Escalation notes required", {
        description: "Please provide notes explaining why this needs escalation.",
      })
      return
    }
    setAction("escalate")
    escalateMutation.mutate(resolutionNotes)
  }

  const isLoading = resolveMutation.isPending || escalateMutation.isPending

  if (!dispute) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resolve Dispute</DialogTitle>
          <DialogDescription>
            Review the dispute and decide whether to approve (void infringement) or reject (keep
            infringement).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dispute Summary */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Dispute Reason
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {dispute.reason}
            </p>
          </div>

          {/* Infringement Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Infringement</p>
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {dispute.infringement?.infringement_number}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Vehicle</p>
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {dispute.infringement?.vehicle?.reg_number}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Fine Amount</p>
              <p className="font-medium text-orange-600 dark:text-orange-400">
                ${dispute.infringement?.fine_amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Submitted By</p>
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {dispute.citizen?.display_name}
              </p>
            </div>
          </div>

          {/* Resolution Notes Input */}
          <div>
            <label className="text-sm font-medium text-slate-900 dark:text-slate-50 mb-2 block">
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Explain your decision and any relevant details..."
              className="min-h-[120px] w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500 mt-1">
              Required for all actions. Be clear and professional.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={handleApprove}
                disabled={isLoading || !resolutionNotes.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {action === "approve" && isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 size-4" />
                )}
                Approve
              </Button>
              <Button
                onClick={handleReject}
                disabled={isLoading || !resolutionNotes.trim()}
                variant="outline"
                className="border-red-500 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/20"
              >
                {action === "reject" && isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 size-4" />
                )}
                Reject
              </Button>
              <Button
                onClick={handleEscalate}
                disabled={isLoading || !resolutionNotes.trim()}
                variant="outline"
                className="border-orange-500 text-orange-700 hover:bg-orange-50 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950/20"
              >
                {action === "escalate" && isLoading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <ArrowUpCircle className="mr-2 size-4" />
                )}
                Escalate
              </Button>
            </div>

            {/* Action Descriptions */}
            <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
              <div>
                <strong className="text-green-600 dark:text-green-400">Approve:</strong> Void the
                infringement
              </div>
              <div>
                <strong className="text-red-600 dark:text-red-400">Reject:</strong> Keep the
                infringement
              </div>
              <div>
                <strong className="text-orange-600 dark:text-orange-400">Escalate:</strong> Send to
                higher authority
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
