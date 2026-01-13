import SupabaseDataLoader from "@/components/supabaseLoader";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { type Agency } from "@/lib/supabase/schema";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isLoading, data, error } = useSupabaseQuery<Agency>({
    queryKey: ["agencies"],
    tableName: "agencies",
    limit: 10,
  });

  return (
    <SupabaseDataLoader
      isLoading={isLoading}
      error={error}
    >
      <div>{data?.length}</div>
    </SupabaseDataLoader>
  );
}
