import SupabaseDataLoader from "@/components/supabaseLoader";
import { Badge } from "@/components/ui/badge";
import { H3 } from "@/components/ui/heading";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { type User } from "@/lib/supabase/schema";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const list = useSupabaseQuery<User>({
    tableName: "users",
    queryKey: ["super-admin", "users", "list"],
  });
  return (
    <div>
      <H3>Users</H3>

      <SupabaseDataLoader
        data={list.data}
        error={list.error}
        isLoading={list.isLoading}
      >
        <p className="text-neutral-500 text-sm">
          Total Users: <b>{list.data?.length}</b>
        </p>
        {list.data?.map((user) => (
          <div
            className="border my-2 p-2 shadow bg-white rounded"
            key={user.id}
          >
            {user.display_name}
            <br />
            <Badge variant={"outline"}>{user.role}</Badge>
          </div>
        ))}
      </SupabaseDataLoader>
    </div>
  );
}
