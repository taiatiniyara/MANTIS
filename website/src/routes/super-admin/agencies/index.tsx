import SupabaseDataLoader from "@/components/supabaseLoader";
import { H3 } from "@/components/ui/heading";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { type Agency } from "@/lib/supabase/schema";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/agencies/")({
  component: RouteComponent,
});

function RouteComponent() {
  const list = useSupabaseQuery<Agency>({
    tableName: "agencies",
    queryKey: ["agencies"],
  });
  return (
    <div>
      <H3>Agencies</H3>

      <SupabaseDataLoader
        data={list.data}
        isLoading={list.isLoading}
        error={list.error}
      >
        {list.data && list.data.length > 0 ? (
          <ul className="border my-2 rounded shadow p-2">
            {list.data.map((agency) => (
              <a
                href={`/super-admin/agencies/${agency.id}`}
                key={agency.id}
                className="text-base sm:text-lg"
              >
                {agency.name} - {agency.code}
              </a>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-base sm:text-lg">No agencies found.</p>
        )}
      </SupabaseDataLoader>
    </div>
  );
}
