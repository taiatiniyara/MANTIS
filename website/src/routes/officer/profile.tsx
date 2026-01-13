import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { User, Mail, Shield, Building2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import type { Agency, Team } from '@/lib/supabase/schema'

export const Route = createFileRoute('/officer/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, userMetadata } = useAuth()

  // Fetch agency details
  const agency = useSupabaseQuery<Agency>({
    tableName: 'agencies',
    queryKey: ['agency', userMetadata?.agency_id || "agid"],
    filter: {
      column: 'id',
      value: userMetadata?.agency_id || '',
    },
  })

  // Fetch team details if user has a team
  const team = useSupabaseQuery<Team>({
    tableName: 'teams',
    queryKey: ['team', userMetadata?.team_id || "tid"],
    filter: {
      column: 'id',
      value: userMetadata?.team_id || '',
    },
  })

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 max-w-3xl">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View your account information and role details
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <p className="text-base font-medium">{userMetadata?.name || 'Not set'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <p className="text-base">{user?.email || 'Not available'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role
            </label>
            <Badge variant="default" className="text-sm">
              {userMetadata?.role || 'Guest'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization
          </CardTitle>
          <CardDescription>Your agency and team assignment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Agency</label>
            {agency.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : agency.data && agency.data.length > 0 ? (
              <div>
                <p className="text-base font-medium">{agency.data[0].name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {agency.data[0].code}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {agency.data[0].type}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No agency assigned</p>
            )}
          </div>

          {userMetadata?.team_id && (
            <div className="space-y-2 pt-2 border-t">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team
              </label>
              {team.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : team.data && team.data.length > 0 ? (
                <p className="text-base font-medium">{team.data[0].name}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No team assigned</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Additional account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">User ID</label>
            <p className="text-xs font-mono text-muted-foreground break-all">
              {user?.id || 'Not available'}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Account Created</label>
            <p className="text-sm">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Not available'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
