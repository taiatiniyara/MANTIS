import SupabaseDataLoader from "@/components/supabaseLoader";
import { H2 } from "@/components/ui/heading";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { type Agency } from "@/lib/supabase/schema";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus } from "lucide-react";

export const Route = createFileRoute("/super-admin/agencies/")({
  component: RouteComponent,
});

function RouteComponent() {
  const list = useSupabaseQuery<Agency>({
    tableName: "agencies",
    queryKey: ["agencies"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <H2>Agencies</H2>
          <p className="text-muted-foreground mt-2">
            Enforcement agencies operating on the platform
          </p>
        </div>
        <a href="/super-admin/agencies/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Agency
          </Button>
        </a>
      </div>

      <SupabaseDataLoader
        data={list.data}
        isLoading={list.isLoading}
        error={list.error}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.data?.map((agency) => (
            <a key={agency.id} href={`/super-admin/agencies/${agency.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    {agency.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      {agency.code}
                    </Badge>
                    <Badge variant="outline">{agency.type}</Badge>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        {list.data?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agencies yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by registering your first agency
              </p>
              <a href="/super-admin/agencies/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Agency
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
      </SupabaseDataLoader>
    </div>
  );
}
