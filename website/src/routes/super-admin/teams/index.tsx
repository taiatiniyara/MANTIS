import SupabaseDataLoader from "@/components/supabaseLoader";
import { H2 } from "@/components/ui/heading";
import { useSupabaseQuery } from "@/hooks/useSupabaseQuery";
import { type Team } from "@/lib/supabase/schema";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/super-admin/teams/")({
  component: RouteComponent,
});

function RouteComponent() {
  const teams = useSupabaseQuery<Team>({
    tableName: "teams",
    queryKey: ["teams"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <H2>Teams</H2>
          <p className="text-muted-foreground mt-2">
            Manage teams across all agencies
          </p>
        </div>
        <Link to="/super-admin/teams/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </Button>
        </Link>
      </div>

      <SupabaseDataLoader
        data={teams.data}
        isLoading={teams.isLoading}
        error={teams.error}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.data?.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {team.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Agency ID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {team.agency_id.slice(0, 8)}...
                    </Badge>
                  </div>
                  {team.location_id && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Location ID:</span>
                      <Badge variant="outline" className="font-mono text-xs">
                        {team.location_id.slice(0, 8)}...
                      </Badge>
                    </div>
                  )}
                  {team.createdAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created:</span>
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
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first team
              </p>
              <Link to="/super-admin/teams/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </SupabaseDataLoader>
    </div>
  );
}

