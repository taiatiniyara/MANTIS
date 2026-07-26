import SupabaseDataLoader from "@/components/supabaseLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { H2 } from "@/components/ui/heading";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { type User } from "@/lib/supabase/schema";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Users as UsersIcon } from "lucide-react";

export const Route = createFileRoute("/super-admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const list = useSupabaseQuery<User>({
    tableName: "users",
    queryKey: ["super-admin", "users", "list"],
  });
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <H2>Users</H2>
          <p className="text-muted-foreground mt-2">
            {list.data?.length ?? 0} user{list.data?.length === 1 ? "" : "s"} on
            the platform
          </p>
        </div>
        <a href="/super-admin/users/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </a>
      </div>

      <SupabaseDataLoader
        data={list.data}
        error={list.error}
        isLoading={list.isLoading}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.data?.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <UsersIcon className="w-5 h-5 text-primary shrink-0" />
                  {user.display_name || "Unnamed user"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{user.role}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {list.data?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UsersIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first user to the platform
              </p>
              <a href="/super-admin/users/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
      </SupabaseDataLoader>
    </div>
  );
}
