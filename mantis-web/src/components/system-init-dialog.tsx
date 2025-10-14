import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Database, Loader2 } from "lucide-react"
import { toast } from "sonner"

type SeedStatus = {
  agencies: boolean
  offences: boolean
  vehicles: boolean
  users: boolean
  infringements: boolean
  payments: boolean
}

type SeedStep = {
  name: keyof SeedStatus
  label: string
  description: string
}

const seedSteps: SeedStep[] = [
  {
    name: "agencies",
    label: "Agencies",
    description: "Police Force, LTA, City Councils",
  },
  {
    name: "offences",
    label: "Offences Catalog",
    description: "Speeding, parking, licensing violations",
  },
  {
    name: "vehicles",
    label: "Sample Vehicles",
    description: "Test vehicle registrations",
  },
  {
    name: "users",
    label: "User Profiles",
    description: "Officers, admins, and citizens",
  },
  {
    name: "infringements",
    label: "Sample Infringements",
    description: "Test infringement records",
  },
  {
    name: "payments",
    label: "Sample Payments",
    description: "Test payment transactions",
  },
]

export function SystemInitDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<keyof SeedStatus | null>(null)
  const [status, setStatus] = useState<SeedStatus>({
    agencies: false,
    offences: false,
    vehicles: false,
    users: false,
    infringements: false,
    payments: false,
  })
  const [error, setError] = useState<string | null>(null)

  const seedAgencies = async () => {
    const agencies = [
      {
        id: "a1111111-1111-1111-1111-111111111111",
        name: "Fiji Police Force",
        code: "POLICE",
        active: true,
      },
      {
        id: "a2222222-2222-2222-2222-222222222222",
        name: "Land Transport Authority",
        code: "LTA",
        active: true,
      },
      {
        id: "a3333333-3333-3333-3333-333333333333",
        name: "Suva City Council",
        code: "SUVA_CC",
        active: true,
      },
    ]

    const { error } = await supabase.from("agencies").upsert(agencies, {
      onConflict: "code",
      ignoreDuplicates: true,
    })

    if (error) throw error
  }

  const seedOffences = async () => {
    const offences = [
      {
        id: "o1111111-1111-1111-1111-111111111111",
        code: "SPD001",
        description: "Speeding in 50km/h zone",
        base_fine_amount: 150.0,
        category: "speeding",
        active: true,
      },
      {
        id: "o2222222-2222-2222-2222-222222222222",
        code: "SPD002",
        description: "Speeding in 80km/h zone",
        base_fine_amount: 300.0,
        category: "speeding",
        active: true,
      },
      {
        id: "o3333333-3333-3333-3333-333333333333",
        code: "PARK001",
        description: "Illegal parking",
        base_fine_amount: 75.0,
        category: "parking",
        active: true,
      },
      {
        id: "o4444444-4444-4444-4444-444444444444",
        code: "PARK002",
        description: "Parking in disabled bay",
        base_fine_amount: 200.0,
        category: "parking",
        active: true,
      },
      {
        id: "o5555555-5555-5555-5555-555555555555",
        code: "LIC001",
        description: "Expired warrant of fitness",
        base_fine_amount: 450.0,
        category: "license",
        active: true,
      },
      {
        id: "o6666666-6666-6666-6666-666666666666",
        code: "SAFE001",
        description: "Seatbelt violation",
        base_fine_amount: 200.0,
        category: "safety",
        active: true,
      },
      {
        id: "o7777777-7777-7777-7777-777777777777",
        code: "SAFE002",
        description: "Mobile phone while driving",
        base_fine_amount: 300.0,
        category: "safety",
        active: true,
      },
      {
        id: "o8888888-8888-8888-8888-888888888888",
        code: "LIC002",
        description: "Driving without license",
        base_fine_amount: 500.0,
        category: "license",
        active: true,
      },
    ]

    const { error } = await supabase.from("offences").upsert(offences, {
      onConflict: "code",
      ignoreDuplicates: true,
    })

    if (error) throw error
  }

  const seedVehicles = async () => {
    const vehicles = [
      {
        id: "v1111111-1111-1111-1111-111111111111",
        reg_number: "FH1289",
        owner_user_id: null,
        make: "Toyota",
        model: "Corolla",
        year: 2020,
        color: "White",
        active: true,
      },
      {
        id: "v2222222-2222-2222-2222-222222222222",
        reg_number: "LG4421",
        owner_user_id: null,
        make: "Nissan",
        model: "March",
        year: 2018,
        color: "Blue",
        active: true,
      },
      {
        id: "v3333333-3333-3333-3333-333333333333",
        reg_number: "MT0932",
        owner_user_id: null,
        make: "Holden",
        model: "Commodore",
        year: 2015,
        color: "Black",
        active: true,
      },
      {
        id: "v4444444-4444-4444-4444-444444444444",
        reg_number: "CE3330",
        owner_user_id: null,
        make: "Ford",
        model: "Ranger",
        year: 2019,
        color: "Silver",
        active: true,
      },
      {
        id: "v5555555-5555-5555-5555-555555555555",
        reg_number: "HA9876",
        owner_user_id: null,
        make: "Honda",
        model: "Civic",
        year: 2021,
        color: "Red",
        active: true,
      },
    ]

    const { error } = await supabase.from("vehicles").upsert(vehicles, {
      onConflict: "reg_number",
      ignoreDuplicates: true,
    })

    if (error) throw error
  }

  const seedUsers = async () => {
    // Note: This requires auth users to be created first
    // This is a placeholder that will check if auth users exist
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      throw new Error("Cannot seed users: Admin access required or no auth users exist")
    }

    // Only proceed if we have some auth users
    if (!authUsers || authUsers.users.length === 0) {
      throw new Error("No auth users found. Please create auth users first via Supabase Dashboard")
    }

    // This is informational only - actual user profiles should be created via auth triggers
    console.log(`Found ${authUsers.users.length} auth users`)
  }

  const seedInfringements = async () => {
    // Get existing officers to use as issuers
    const { data: officers, error: officerError } = await supabase
      .from("users")
      .select("id")
      .in("role", ["officer", "agency_admin"])
      .limit(1)

    if (officerError || !officers || officers.length === 0) {
      throw new Error("No officers found. Please create officer users first")
    }

    const officerId = officers[0].id

    const infringements = [
      {
        id: "i1111111-1111-1111-1111-111111111111",
        infringement_number: "INF-2025-000001",
        issuing_agency_id: "a1111111-1111-1111-1111-111111111111",
        officer_user_id: officerId,
        vehicle_id: "v1111111-1111-1111-1111-111111111111",
        driver_licence_number: "DL123456",
        offence_id: "o2222222-2222-2222-2222-222222222222",
        fine_amount: 300.0,
        status: "issued",
        location_description: "Kings Road, Suva",
        issued_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "i2222222-2222-2222-2222-222222222222",
        infringement_number: "INF-2025-000002",
        issuing_agency_id: "a3333333-3333-3333-3333-333333333333",
        officer_user_id: officerId,
        vehicle_id: "v2222222-2222-2222-2222-222222222222",
        driver_licence_number: "DL789012",
        offence_id: "o3333333-3333-3333-3333-333333333333",
        fine_amount: 75.0,
        status: "disputed",
        location_description: "Victoria Parade, Suva",
        issued_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    const { error } = await supabase.from("infringements").upsert(infringements, {
      onConflict: "infringement_number",
      ignoreDuplicates: true,
    })

    if (error) throw error
  }

  const seedPayments = async () => {
    // Get a citizen user for the payment
    const { data: citizens, error: citizenError } = await supabase
      .from("users")
      .select("id")
      .eq("role", "citizen")
      .limit(1)

    if (citizenError || !citizens || citizens.length === 0) {
      console.log("No citizens found, skipping payment seeding")
      return
    }

    const citizenId = citizens[0].id

    const payments = [
      {
        id: "p1111111-1111-1111-1111-111111111111",
        infringement_id: "i1111111-1111-1111-1111-111111111111",
        amount: 300.0,
        method: "mpaisa",
        provider_ref: "MP20250001234",
        status: "success",
        receipt_number: "RCP-2025-000001",
        paid_by_user_id: citizenId,
        paid_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    const { error } = await supabase.from("payments").upsert(payments, {
      onConflict: "receipt_number",
      ignoreDuplicates: true,
    })

    if (error) throw error

    // Update infringement status to paid
    await supabase
      .from("infringements")
      .update({ status: "paid" })
      .eq("id", "i1111111-1111-1111-1111-111111111111")
  }

  const runSeeding = async () => {
    setLoading(true)
    setError(null)
    setStatus({
      agencies: false,
      offences: false,
      vehicles: false,
      users: false,
      infringements: false,
      payments: false,
    })

    try {
      // Agencies
      setCurrentStep("agencies")
      await seedAgencies()
      setStatus((prev) => ({ ...prev, agencies: true }))

      // Offences
      setCurrentStep("offences")
      await seedOffences()
      setStatus((prev) => ({ ...prev, offences: true }))

      // Vehicles
      setCurrentStep("vehicles")
      await seedVehicles()
      setStatus((prev) => ({ ...prev, vehicles: true }))

      // Users (check only)
      setCurrentStep("users")
      await seedUsers()
      setStatus((prev) => ({ ...prev, users: true }))

      // Infringements
      setCurrentStep("infringements")
      await seedInfringements()
      setStatus((prev) => ({ ...prev, infringements: true }))

      // Payments
      setCurrentStep("payments")
      await seedPayments()
      setStatus((prev) => ({ ...prev, payments: true }))

      setCurrentStep(null)
      toast.success("System initialization complete!", {
        description: "All seed data has been loaded successfully.",
      })
    } catch (err) {
      console.error("Seeding error:", err)
      setError(err instanceof Error ? err.message : "Failed to seed database")
      toast.error("Initialization failed", {
        description: err instanceof Error ? err.message : "Failed to seed database",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Database className="size-4" />
          Initialize System
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>System Initialization</DialogTitle>
          <DialogDescription>
            Load seed data into the database for testing and development. This will create agencies,
            offences, sample vehicles, and test records.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {seedSteps.map((step) => (
            <div
              key={step.name}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                currentStep === step.name
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                  : status[step.name]
                    ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                    : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="mt-0.5">
                {currentStep === step.name ? (
                  <Loader2 className="size-5 animate-spin text-orange-600" />
                ) : status[step.name] ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <div className="size-5 rounded-full border-2 border-slate-300 dark:border-slate-700" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{step.label}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{step.description}</div>
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
              <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Close
          </Button>
          <Button onClick={runSeeding} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <Database className="size-4" />
                Start Initialization
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
