import SupabaseDataLoader from "@/components/supabaseLoader";
import { H2 } from "@/components/ui/heading";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { type Team } from "@/lib/supabase/schema";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin } from "lucide-react";

export const Route = createFileRoute("/agency-admin/teams/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { userMetadata } = useAuth();
  const teams = useSupabaseQuery<Team>({
    tableName: "teams",
    queryKey: ["agency-teams", userMetadata?.agency_id || "idd"],
    filter: {
      column: "agency_id",
      value: userMetadata?.agency_id || "",
    },
  });
  
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="space-y-1">
        <H2 className="text-2xl sm:text-3xl">Teams</H2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage teams within your agency
        </p>
      </div>

      <SupabaseDataLoader
        data={teams.data}
        isLoading={teams.isLoading}
        error={teams.error}
      >
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {teams.data?.map((team) => (
            <Card key={team.id} className="hover:shadow-md active:shadow-lg transition-shadow touch-manipulation">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                  <span className="truncate">{team.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-xs sm:text-sm">Team ID:</span>
                    <Badge variant="outline" className="font-mono text-[10px] sm:text-xs shrink-0">
                      {team.id.slice(0, 8)}...
                    </Badge>
                  </div>
                  {team.location_id && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">
                        Location assigned
                      </span>
                    </div>
                  )}
                  {team.createdAt && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground text-xs sm:text-sm">Created:</span>
                      <span className="text-xs">
                        {new Date(team.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {teams.data?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground text-center">
                Your agency doesn't have any teams created yet.
              </p>
            </CardContent>
          </Card>
        )}
      </SupabaseDataLoader>
    </div>
  );
}
