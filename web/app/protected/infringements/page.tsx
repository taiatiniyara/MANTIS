import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default async function ProtectedInfringementsPage() {
  

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user data
  const { data: userData } = await supabase
    .from("users")
    .select("role, agency_id, position")
    .eq("id", user.id)
    .single();

  if (!userData) {
    redirect("/auth/login");
  }

  // Fetch infringements for the user's agency
  const { data: infringements } = await supabase
    .from("infringements")
    .select(
      `
      *,
      officer:users!officer_id (
        position
      ),
      team:teams (
        name
      ),
      route:routes (
        name
      ),
      location:locations (
        name
      ),
      type:infringement_types (
        code,
        name,
        fine_amount,
        category:infringement_categories (
          name
        )
      )
    `
    )
    .eq("agency_id", userData.agency_id)
    .order("issued_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Infringements</h1>
        <p className="text-muted-foreground">
          View and manage your agency's infringement records
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Infringement Records</CardTitle>
          <CardDescription>
            {infringements?.length || 0} total record{infringements?.length === 1 ? "" : "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {infringements && infringements.length > 0 ? (
            <div className="space-y-4">
              {infringements.map((infringement: any) => (
                <div
                  key={infringement.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{infringement.vehicle_id}</p>
                      <p className="text-sm text-muted-foreground">
                        {infringement.type?.name || "Unknown Type"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {infringement.officer?.position || "Unknown Officer"} •{" "}
                        {new Date(infringement.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${(infringement.type?.fine_amount || 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {infringement.type?.category?.name || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No infringements found</h3>
              <p className="text-sm text-muted-foreground">
                No infringement records for your agency yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
