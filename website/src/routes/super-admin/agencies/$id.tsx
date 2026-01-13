import SupabaseDataLoader from "@/components/supabaseLoader";
import { H1 } from "@/components/ui/heading";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { type Agency } from "@/lib/supabase/schema";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/agencies/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const id = window.location.pathname.split("/").pop();
  const agency = useSupabaseQuery<Agency>({
    tableName: "agencies",
    queryKey: ["agency1", id || "id-missing"],
    filter: {
      column: "id",
      value: id as string,
    },
    limit: 1,
  });

  return (
    <SupabaseDataLoader
      data={agency.data}
      isLoading={agency.isLoading}
      error={agency.error}
    >
      <div>
        {agency.data ? (
          <>
            <H1>
              {agency.data[0].name} ({agency.data[0].code})
            </H1>
          </>
        ) : (
          <p className="mt-4 text-base sm:text-lg">Agency not found.</p>
        )}
      </div>
    </SupabaseDataLoader>
  );
}
