import { createFileRoute } from "@tanstack/react-router";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { type Offence } from "@/lib/supabase/schema";
import SupabaseDataLoader from "@/components/supabaseLoader";
import { H2 } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, FolderTree } from "lucide-react";

export const Route = createFileRoute("/super-admin/offences/")({
  component: RouteComponent,
});

const severityVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  minor: "secondary",
  serious: "default",
  critical: "destructive",
};

function RouteComponent() {
  const offences = useSupabaseQuery<Offence>({
    tableName: "offences",
    queryKey: ["offences"],
    orderBy: [{ column: "code", ascending: true }],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <H2>Offences</H2>
          <p className="text-muted-foreground mt-2">
            Offence catalogue with fixed penalties
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/super-admin/offence-categories">
            <Button variant="outline">
              <FolderTree className="w-4 h-4 mr-2" />
              Categories
            </Button>
          </a>
          <a href="/super-admin/offences/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Offence
            </Button>
          </a>
        </div>
      </div>

      <SupabaseDataLoader
        data={offences.data}
        isLoading={offences.isLoading}
        error={offences.error}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offences.data?.map((offence) => (
            <Card key={offence.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="w-5 h-5 text-primary shrink-0" />
                    {offence.name}
                  </CardTitle>
                  {!offence.active && (
                    <Badge variant="outline" className="shrink-0">
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-mono">
                      {offence.code}
                    </Badge>
                    <span className="font-semibold">
                      FJD {offence.fixed_penalty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={severityVariant[offence.severity] ?? "secondary"}>
                      {offence.severity}
                    </Badge>
                    <Badge variant="outline">{offence.agency_type}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {offences.data?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No offences yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Add your first offence to the catalogue
              </p>
              <a href="/super-admin/offences/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Offence
                </Button>
              </a>
            </CardContent>
          </Card>
        )}
      </SupabaseDataLoader>
    </div>
  );
}
