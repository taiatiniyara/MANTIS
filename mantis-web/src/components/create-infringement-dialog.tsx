import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Loader2, MapPin, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  createInfringement,
  getOffences,
  searchVehicle,
  type CreateInfringementData,
} from "@/lib/api/infringements"
import { toast } from "sonner"

interface CreateInfringementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateInfringementDialog({
  open,
  onOpenChange,
}: CreateInfringementDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreateInfringementData>({
    vehicle_reg_number: "",
    offence_id: "",
    driver_licence_number: "",
    location_description: "",
    notes: "",
  })
  const [vehicleSearched, setVehicleSearched] = useState(false)
  const [vehicleExists, setVehicleExists] = useState<boolean | null>(null)
  const [isSearchingVehicle, setIsSearchingVehicle] = useState(false)

  // Fetch offences
  const { data: offences, isLoading: isLoadingOffences } = useQuery({
    queryKey: ["offences"],
    queryFn: getOffences,
  })

  // Create infringement mutation
  const createMutation = useMutation({
    mutationFn: createInfringement,
    onSuccess: (data) => {
      toast.success("Infringement created successfully", {
        description: `Infringement ${data.infringement_number} has been recorded.`,
      })
      queryClient.invalidateQueries({ queryKey: ["infringements"] })
      handleClose()
    },
    onError: (error: Error) => {
      toast.error("Failed to create infringement", {
        description: error.message,
      })
    },
  })

  // Handle vehicle search
  const handleVehicleSearch = async () => {
    if (!formData.vehicle_reg_number.trim()) {
      return
    }

    setIsSearchingVehicle(true)
    try {
      const vehicle = await searchVehicle(formData.vehicle_reg_number)
      setVehicleExists(vehicle !== null)
      setVehicleSearched(true)
      
      if (vehicle) {
        toast.success("Vehicle found", {
          description: `${vehicle.reg_number}${vehicle.make ? ` - ${vehicle.make}` : ""}${vehicle.model ? ` ${vehicle.model}` : ""}`,
        })
      } else {
        toast.info("Vehicle not found", {
          description: "A new vehicle record will be created.",
        })
      }
    } catch (error) {
      toast.error("Failed to search vehicle", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsSearchingVehicle(false)
    }
  }

  // Get current location
  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }))
          toast.success("Location captured", {
            description: `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`,
          })
        },
        (error) => {
          toast.error("Failed to get location", {
            description: error.message,
          })
        }
      )
    } else {
      toast.error("Geolocation not supported", {
        description: "Your browser does not support location services.",
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.vehicle_reg_number.trim()) {
      toast.error("Vehicle registration required")
      return
    }

    if (!formData.offence_id) {
      toast.error("Please select an offence")
      return
    }

    createMutation.mutate(formData)
  }

  const handleClose = () => {
    setFormData({
      vehicle_reg_number: "",
      offence_id: "",
      driver_licence_number: "",
      location_description: "",
      notes: "",
    })
    setVehicleSearched(false)
    setVehicleExists(null)
    onOpenChange(false)
  }

  const selectedOffence = offences?.find((o) => o.id === formData.offence_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Infringement</DialogTitle>
          <DialogDescription>
            Enter the details of the traffic infringement below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle Registration */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Vehicle Registration Number <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., AB1234"
                value={formData.vehicle_reg_number}
                onChange={(e) => {
                  setFormData({ ...formData, vehicle_reg_number: e.target.value.toUpperCase() })
                  setVehicleSearched(false)
                }}
                className="flex-1 uppercase"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleVehicleSearch}
                disabled={isSearchingVehicle || !formData.vehicle_reg_number.trim()}
              >
                {isSearchingVehicle ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                <span className="ml-2">Search</span>
              </Button>
            </div>
            {vehicleSearched && (
              <Alert variant={vehicleExists ? "default" : "default"}>
                <AlertCircle className="size-4" />
                <AlertDescription>
                  {vehicleExists
                    ? "✓ Vehicle found in registry"
                    : "⚠ Vehicle not found - a new record will be created"}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Driver Licence Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Driver Licence Number (Optional)</label>
            <Input
              placeholder="e.g., DL123456"
              value={formData.driver_licence_number}
              onChange={(e) =>
                setFormData({ ...formData, driver_licence_number: e.target.value })
              }
            />
          </div>

          {/* Offence Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Offence <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.offence_id}
              onValueChange={(value) => setFormData({ ...formData, offence_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an offence" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingOffences ? (
                  <div className="p-2 text-center text-sm text-slate-500">Loading...</div>
                ) : (
                  offences?.map((offence) => (
                    <SelectItem key={offence.id} value={offence.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {offence.code} - {offence.description}
                        </span>
                        <span className="text-xs text-slate-500">
                          Fine: ${offence.base_fine_amount.toFixed(2)}
                          {offence.category && ` • ${offence.category}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedOffence && (
              <div className="rounded-md bg-orange-50 dark:bg-orange-950/20 p-3 text-sm">
                <div className="font-medium text-orange-900 dark:text-orange-100">
                  Fine Amount: ${selectedOffence.base_fine_amount.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Corner of Victoria Parade and Butt Street"
                value={formData.location_description}
                onChange={(e) =>
                  setFormData({ ...formData, location_description: e.target.value })
                }
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleGetLocation}>
                <MapPin className="size-4" />
                <span className="ml-2">GPS</span>
              </Button>
            </div>
            {formData.latitude && formData.longitude && (
              <p className="text-xs text-slate-500">
                Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (Optional)</label>
            <textarea
              placeholder="Additional details about the infringement..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[100px] w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {createMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Record Infringement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
