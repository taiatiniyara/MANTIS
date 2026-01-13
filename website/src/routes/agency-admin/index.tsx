import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MapPin, AlertCircle, FileText, TrendingUp } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import type { Team, Location, Infringement } from '@/lib/supabase/schema'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/agency-admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { userMetadata } = useAuth()
  
  // Fetch agency teams
  const teams = useSupabaseQuery<Team>({
    tableName: 'teams',
    queryKey: ['agency-teams', userMetadata?.agency_id || "agid"],
    filter: {
      column: 'agency_id',
      value: userMetadata?.agency_id || '',
    },
  })

  // Fetch agency locations
  const locations = useSupabaseQuery<Location>({
    tableName: 'locations',
    queryKey: ['agency-locations', userMetadata?.agency_id || "agid"],
    filter: {
      column: 'agency_id',
      value: userMetadata?.agency_id || '',
    },
  })

  // Fetch agency infringements
  const infringements = useSupabaseQuery<Infringement>({
    tableName: 'infringements',
    queryKey: ['agency-infringements', userMetadata?.agency_id || "agid"],
    filter: {
      column: 'agency_id',
      value: userMetadata?.agency_id || '',
    },
  })

  const activeInfringements = infringements.data?.filter(
    (inf) => inf.status === 'pending' || inf.status === 'under_review'
  ).length || 0

  const recentInfringements = infringements.data
    ?.sort((a, b) => {
      const dateA = a.issuedAt ? new Date(a.issuedAt).getTime() : 0
      const dateB = b.issuedAt ? new Date(b.issuedAt).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 5)

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Agency Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome back, {userMetadata?.name || 'Admin'}
        </p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Teams</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {teams.isLoading ? '-' : teams.data?.length || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
              Active teams
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {locations.isLoading ? '-' : locations.data?.length || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
              Managed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {infringements.isLoading ? '-' : activeInfringements}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
              Pending
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {infringements.isLoading ? '-' : infringements.data?.length || 0}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">
              All time
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            {infringements.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : recentInfringements && recentInfringements.length > 0 ? (
              <div className="space-y-3">
                {recentInfringements.map((inf) => (
                  <div
                    key={inf.id}
                    className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{inf.offenceCode}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {inf.description || 'No description'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inf.issuedAt
                          ? new Date(inf.issuedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Unknown date'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        inf.status === 'pending'
                          ? 'default'
                          : inf.status === 'paid'
                          ? 'outline'
                          : 'secondary'
                      }
                      className="shrink-0 text-[10px] sm:text-xs"
                    >
                      {inf.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="space-y-2 sm:space-y-3">
              <a
                href="/agency-admin/teams"
                className="block p-3 sm:p-4 rounded-lg border hover:bg-accent active:bg-accent/80 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base">Manage Teams</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      View and organize your teams
                    </p>
                  </div>
                </div>
              </a>
              <a
                href="/agency-admin/locations"
                className="block p-3 sm:p-4 rounded-lg border hover:bg-accent active:bg-accent/80 transition-colors touch-manipulation"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base">View Locations</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Browse locations on map
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
