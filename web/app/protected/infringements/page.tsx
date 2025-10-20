import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default async function ProtectedInfringementsPage() {
  const supabase = await createClient();

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

  const isOfficer = userData.role === "officer";

  // Fetch infringements - scoped by role
  let query = supabase
    .from("infringements")
    .select(
      `
      *,
      officer:users!officer_id (
        position,
        full_name
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
    );

  // Officers only see their own infringements
  if (isOfficer) {
    query = query.eq("officer_id", user.id);
  } else {
    // Agency admins see all agency infringements
    query = query.eq("agency_id", userData.agency_id);
  }

  const { data: infringements } = await query.order("issued_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isOfficer ? "My Infringements" : "Infringements"}
        </h1>
        <p className="text-muted-foreground">
          {isOfficer 
            ? "View your recorded infringements and their status"
            : "View and manage your agency's infringement records"
          }
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
                        {!isOfficer && `${infringement.officer?.full_name || infringement.officer?.position || "Unknown Officer"} • `}
                        {new Date(infringement.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs mb-1 ${
                      infringement.status === 'approved' ? 'bg-green-100 text-green-700' :
                      infringement.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {infringement.status || 'pending'}
                    </span>
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
