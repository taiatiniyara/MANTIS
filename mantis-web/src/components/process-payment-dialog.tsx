import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreditCard, Loader2, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createPayment, processPayment, type PaymentMethod } from "@/lib/api/payments"
import type { Infringement } from "@/lib/api/infringements"
import { toast } from "sonner"

interface ProcessPaymentDialogProps {
  infringement: Infringement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const paymentMethods: { value: PaymentMethod; label: string; icon: any; color: string }[] = [
  {
    value: "card",
    label: "Credit/Debit Card",
    icon: CreditCard,
    color: "bg-blue-500",
  },
  {
    value: "mpaisa",
    label: "M-Paisa (Vodafone)",
    icon: Smartphone,
    color: "bg-red-500",
  },
  {
    value: "mycash",
    label: "MyCash (Digicel)",
    icon: Smartphone,
    color: "bg-orange-500",
  },
]

export function ProcessPaymentDialog({
  infringement,
  open,
  onOpenChange,
  onSuccess,
}: ProcessPaymentDialogProps) {
  const queryClient = useQueryClient()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean
    receipt?: string
    message?: string
  } | null>(null)

  // Create and process payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (method: PaymentMethod) => {
      if (!infringement) throw new Error("No infringement selected")

      // Create payment record
      const payment = await createPayment({
        infringement_id: infringement.id,
        amount: infringement.fine_amount,
        method,
      })

      // Process payment (simulate gateway)
      const result = await processPayment(payment.id, method)
      return result
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setPaymentResult({
          success: true,
          receipt: data.receipt_number || undefined,
          message: "Payment processed successfully!",
        })
        toast.success("Payment successful!", {
          description: `Receipt: ${data.receipt_number}`,
        })
        queryClient.invalidateQueries({ queryKey: ["payments"] })
        queryClient.invalidateQueries({ queryKey: ["infringements"] })
        onSuccess?.()
      } else {
        setPaymentResult({
          success: false,
          message: "Payment failed. Please try again or use a different payment method.",
        })
        toast.error("Payment failed", {
          description: "Please try again or use a different payment method.",
        })
      }
      setProcessing(false)
    },
    onError: (error: Error) => {
      setPaymentResult({
        success: false,
        message: error.message,
      })
      toast.error("Payment error", {
        description: error.message,
      })
      setProcessing(false)
    },
  })

  const handlePayment = async (method: PaymentMethod) => {
    setSelectedMethod(method)
    setProcessing(true)
    setPaymentResult(null)
    paymentMutation.mutate(method)
  }

  const handleClose = () => {
    if (!processing) {
      setSelectedMethod(null)
      setPaymentResult(null)
      onOpenChange(false)
    }
  }

  if (!infringement) return null

  // If payment already processed
  if (infringement.status === "paid") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Already Processed</DialogTitle>
            <DialogDescription>
              This infringement has already been paid.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertDescription>
              Infringement #{infringement.infringement_number} has been marked as paid. No
              further payment is required.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Select a payment method to process this infringement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Infringement Summary */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Infringement #
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {infringement.infringement_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Vehicle</span>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {infringement.vehicle?.reg_number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Offence</span>
                <span className="font-medium text-slate-900 dark:text-slate-50">
                  {infringement.offence?.code}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ${infringement.fine_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Result */}
          {paymentResult && (
            <Alert variant={paymentResult.success ? "default" : "destructive"}>
              <AlertDescription>{paymentResult.message}</AlertDescription>
              {paymentResult.receipt && (
                <p className="mt-2 text-sm font-mono">Receipt: {paymentResult.receipt}</p>
              )}
            </Alert>
          )}

          {/* Payment Methods */}
          {!paymentResult && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                Select Payment Method
              </p>
              <div className="grid gap-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = selectedMethod === method.value
                  const isProcessing = processing && isSelected

                  return (
                    <button
                      key={method.value}
                      onClick={() => handlePayment(method.value)}
                      disabled={processing}
                      className={`
                        relative flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all
                        ${
                          isSelected
                            ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        }
                        ${processing && !isSelected ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      `}
                    >
                      <div
                        className={`flex size-12 items-center justify-center rounded-lg ${method.color} text-white`}
                      >
                        {isProcessing ? (
                          <Loader2 className="size-6 animate-spin" />
                        ) : (
                          <Icon className="size-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-50">
                          {method.label}
                        </p>
                        {isProcessing && (
                          <p className="text-sm text-orange-600 dark:text-orange-400">
                            Processing payment...
                          </p>
                        )}
                      </div>
                      {isSelected && !isProcessing && (
                        <div className="size-6 rounded-full bg-orange-500 flex items-center justify-center">
                          <svg
                            className="size-4 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Payment Result Actions */}
          {paymentResult && (
            <div className="flex gap-3">
              {paymentResult.success ? (
                <>
                  <Button onClick={handleClose} className="flex-1">
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // TODO: Implement receipt download
                      toast.info("Receipt download coming soon!")
                    }}
                  >
                    Download Receipt
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setPaymentResult(null)
                      setSelectedMethod(null)
                    }}
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Disclaimer */}
          {!paymentResult && (
            <p className="text-xs text-slate-500 text-center">
              This is a demonstration. No actual payment will be processed.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
