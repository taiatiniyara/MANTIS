import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import {
  AlertTriangle,
  Calendar,
  Car,
  FileText,
  Loader2,
  MapPin,
  User,
  X,
  Building2,
  CreditCard,
  Image as ImageIcon,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { updateInfringementStatus, type Infringement } from "@/lib/api/infringements"
import { usePermissions } from "@/hooks/use-permissions"
import { ProcessPaymentDialog } from "@/components/process-payment-dialog"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

interface InfringementDetailDialogProps {
  infringement: Infringement | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusColors = {
  issued: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  voided: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  disputed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
}

export function InfringementDetailDialog({
  infringement,
  open,
  onOpenChange,
}: InfringementDetailDialogProps) {
  const queryClient = useQueryClient()
  const { canCreateInfringement, agencyId } = usePermissions()
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [voidNotes, setVoidNotes] = useState("")
  const [disputeNotes, setDisputeNotes] = useState("")
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    infringement?.evidence_urls || []
  )

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: any; notes?: string }) =>
      updateInfringementStatus(id, status, notes),
    onSuccess: (data, variables) => {
      const statusText = variables.status === "voided" ? "voided" : "marked as disputed"
      toast.success(`Infringement ${statusText}`, {
        description: `Infringement ${data.infringement_number} has been updated.`,
      })
      queryClient.invalidateQueries({ queryKey: ["infringements"] })
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error("Failed to update infringement", {
        description: error.message,
      })
    },
  })

  const handleVoid = () => {
    if (!infringement) return
    updateStatusMutation.mutate({
      id: infringement.id,
      status: "voided",
      notes: voidNotes || "Voided by officer",
    })
    setShowVoidDialog(false)
    setVoidNotes("")
  }

  const handleDispute = () => {
    if (!infringement) return
    updateStatusMutation.mutate({
      id: infringement.id,
      status: "disputed",
      notes: disputeNotes || "Marked as disputed",
    })
    setShowDisputeDialog(false)
    setDisputeNotes("")
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!infringement || !event.target.files) return

    const files = Array.from(event.target.files)
    if (files.length === 0) return

    // Check total files limit (max 5)
    if (uploadedImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed", {
        description: "Please remove some images before uploading more.",
      })
      return
    }

    setUploadingFiles(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`)
          continue
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large`, {
            description: "Maximum file size is 5MB",
          })
          continue
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split(".").pop()
        const fileName = `${infringement.id}/${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
          .from("evidence")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (error) {
          toast.error(`Failed to upload ${file.name}`, {
            description: error.message,
          })
          continue
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("evidence").getPublicUrl(data.path)

        uploadedUrls.push(publicUrl)
      }

      if (uploadedUrls.length > 0) {
        // Update infringement with new evidence URLs
        const newEvidenceUrls = [...uploadedImages, ...uploadedUrls]
        setUploadedImages(newEvidenceUrls)

        const { error } = await supabase
          .from("infringements")
          .update({ evidence_urls: newEvidenceUrls })
          .eq("id", infringement.id)

        if (error) {
          toast.error("Failed to save evidence", {
            description: error.message,
          })
        } else {
          toast.success(`${uploadedUrls.length} image(s) uploaded successfully`)
          queryClient.invalidateQueries({ queryKey: ["infringements"] })
        }
      }
    } catch (error) {
      toast.error("Upload failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setUploadingFiles(false)
      // Reset input
      event.target.value = ""
    }
  }

  // Handle image deletion
  const handleDeleteImage = async (imageUrl: string) => {
    if (!infringement) return

    try {
      // Extract path from URL
      const urlParts = imageUrl.split("/evidence/")
      if (urlParts.length < 2) {
        toast.error("Invalid image URL")
        return
      }

      const filePath = urlParts[1]

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("evidence")
        .remove([filePath])

      if (storageError) {
        toast.error("Failed to delete image", {
          description: storageError.message,
        })
        return
      }

      // Update infringement
      const newEvidenceUrls = uploadedImages.filter((url) => url !== imageUrl)
      setUploadedImages(newEvidenceUrls)

      const { error: updateError } = await supabase
        .from("infringements")
        .update({ evidence_urls: newEvidenceUrls })
        .eq("id", infringement.id)

      if (updateError) {
        toast.error("Failed to update infringement", {
          description: updateError.message,
        })
      } else {
        toast.success("Image deleted successfully")
        queryClient.invalidateQueries({ queryKey: ["infringements"] })
      }
    } catch (error) {
      toast.error("Delete failed", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  if (!infringement) return null

  const canModify =
    canCreateInfringement &&
    infringement.issuing_agency_id === agencyId &&
    infringement.status === "issued"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Infringement Details</span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                  statusColors[infringement.status]
                }`}
              >
                {infringement.status.charAt(0).toUpperCase() + infringement.status.slice(1)}
              </span>
            </DialogTitle>
            <DialogDescription>
              Infringement #{infringement.infringement_number}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Key Information */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Car className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Vehicle</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {infringement.vehicle?.reg_number}
                    </p>
                    {(infringement.vehicle?.make || infringement.vehicle?.model) && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {infringement.vehicle.make} {infringement.vehicle.model}
                        {infringement.vehicle.year && ` (${infringement.vehicle.year})`}
                      </p>
                    )}
                  </div>
                </div>

                {infringement.driver_licence_number && (
                  <div className="flex items-start gap-3">
                    <User className="mt-1 size-5 text-slate-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-500">Driver Licence</p>
                      <p className="text-base text-slate-900 dark:text-slate-50">
                        {infringement.driver_licence_number}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Building2 className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Issuing Agency</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">
                      {infringement.agency?.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Officer: {infringement.officer?.display_name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Offence</p>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-50">
                      {infringement.offence?.code}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {infringement.offence?.description}
                    </p>
                    {infringement.offence?.category && (
                      <p className="mt-1 text-xs text-slate-500">
                        Category: {infringement.offence.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CreditCard className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Fine Amount</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      ${infringement.fine_amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Issued Date & Time</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">
                      {format(new Date(infringement.issued_at), "MMMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {format(new Date(infringement.issued_at), "hh:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            {infringement.location_description && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 size-5 text-slate-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Location</p>
                    <p className="text-base text-slate-900 dark:text-slate-50">
                      {infringement.location_description}
                    </p>
                    {infringement.location && (
                      <p className="mt-1 text-xs text-slate-500">
                        Coordinates: {infringement.location.lat.toFixed(6)},{" "}
                        {infringement.location.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {infringement.notes && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                <p className="text-sm font-medium text-slate-500 mb-2">Notes</p>
                <p className="text-sm text-slate-900 dark:text-slate-50 whitespace-pre-wrap">
                  {infringement.notes}
                </p>
              </div>
            )}

            {/* Evidence */}
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-5 text-slate-500" />
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                    Evidence ({uploadedImages.length}/5)
                  </p>
                </div>
                {canModify && uploadedImages.length < 5 && (
                  <label htmlFor="file-upload">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingFiles}
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      {uploadingFiles ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                      <span className="ml-2">Upload</span>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingFiles}
                    />
                  </label>
                )}
              </div>

              {uploadedImages.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-800"
                      />
                      {canModify && (
                        <button
                          onClick={() => handleDeleteImage(url)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ImageIcon className="size-12 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-sm text-slate-500">No evidence uploaded yet</p>
                  {canModify && (
                    <p className="text-xs text-slate-400 mt-1">
                      Upload photos to document this infringement
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              {/* Pay Now Button - Show for issued infringements */}
              {infringement.status === "issued" && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setShowPaymentDialog(true)}
                >
                  <CreditCard className="mr-2 size-4" />
                  Pay Now
                </Button>
              )}

              {canModify && (
                <>
                  <Button
                    variant="outline"
                    className="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-400 dark:hover:bg-yellow-950/20"
                    onClick={() => setShowDisputeDialog(true)}
                >
                  <AlertTriangle className="size-4 mr-2" />
                  Mark as Disputed
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-500 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950/20"
                  onClick={() => setShowVoidDialog(true)}
                >
                  <X className="size-4 mr-2" />
                  Void Infringement
                </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      {infringement && (
        <ProcessPaymentDialog
          infringement={infringement}
          open={showPaymentDialog}
          onOpenChange={setShowPaymentDialog}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["infringements"] })
            onOpenChange(false) // Close detail dialog after successful payment
          }}
        />
      )}

      {/* Void Confirmation Dialog */}
      <AlertDialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Infringement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to void this infringement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <label className="text-sm font-medium mb-2 block">Reason for voiding (optional)</label>
            <textarea
              value={voidNotes}
              onChange={(e) => setVoidNotes(e.target.value)}
              placeholder="Enter reason..."
              className="min-h-[100px] w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVoid}
              className="bg-red-500 hover:bg-red-600"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Void Infringement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dispute Confirmation Dialog */}
      <AlertDialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Disputed</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this infringement as disputed. An agency admin will review this case.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <label className="text-sm font-medium mb-2 block">Dispute reason (optional)</label>
            <textarea
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
              placeholder="Enter dispute reason..."
              className="min-h-[100px] w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDispute}
              className="bg-yellow-500 hover:bg-yellow-600"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Mark as Disputed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
