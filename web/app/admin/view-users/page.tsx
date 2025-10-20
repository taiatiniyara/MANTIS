import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ViewUsersPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Get current user's role
  const { data: currentUserData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Only super_admin can view all users
  if (currentUserData?.role !== "super_admin") {
    return redirect("/admin");
  }

  // Fetch all users with their agency and location info
  const { data: users, error } = await supabase
    .from("users")
    .select(`
      id,
      role,
      position,
      created_at,
      agency:agencies!agency_id (
        id,
        name
      ),
      location:locations!location_id (
        id,
        name,
        type
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  // Get auth users to show email
  const authUsers = await Promise.all(
    (users || []).map(async (u) => {
      const { data: authUser } = await supabase.auth.admin.getUserById(u.id);
      return {
        ...u,
        email: authUser.user?.email || "N/A",
      };
    })
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "agency_admin":
        return "default";
      case "officer":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
        <p className="text-slate-600 mt-2">
          View all users in the MANTIS system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Total users: {users?.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600">No users found in the system.</p>
              <p className="text-sm text-slate-500 mt-2">
                Users will appear here after signing up.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {formatRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.position || "—"}</TableCell>
                      <TableCell>
                        {(user.agency as any)?.name || "—"}
                      </TableCell>
                      <TableCell>
                        {(user.location as any)?.name || "—"}
                        {(user.location as any)?.type && (
                          <span className="text-xs text-slate-500 ml-1">
                            ({(user.location as any).type})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(user.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Admin Users Only</CardTitle>
          <CardDescription>
            Super Admins and Agency Admins
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!users || users.filter((u) => u.role !== "officer").length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No admin users found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authUsers
                    .filter((u) => u.role !== "officer")
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {formatRole(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.position || "—"}</TableCell>
                        <TableCell>
                          {(user.agency as any)?.name || "—"}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatDate(user.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          👤 Your Current Session
        </h3>
        <p className="text-sm text-blue-800">
          Email: <span className="font-medium">{user.email}</span>
        </p>
        <p className="text-sm text-blue-800">
          Role: <span className="font-medium">{formatRole(currentUserData?.role || "")}</span>
        </p>
        <p className="text-sm text-blue-800">
          User ID: <span className="font-mono text-xs">{user.id}</span>
        </p>
      </div>
    </div>
  );
}
