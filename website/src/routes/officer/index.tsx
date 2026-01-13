import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, Clock, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import type { Infringement } from '@/lib/supabase/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/officer/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, userMetadata } = useAuth()
  
  // Fetch officer's infringements
  const infringements = useSupabaseQuery<Infringement>({
    tableName: 'infringements',
    queryKey: ['officer-infringements', user?.id || "uid"],
    filter: {
      column: 'officer_id',
      value: user?.id || '',
    },
  })

  const totalInfringements = infringements.data?.length || 0
  const pendingInfringements = infringements.data?.filter(inf => inf.status === 'pending').length || 0
  const paidInfringements = infringements.data?.filter(inf => inf.status === 'paid').length || 0

  // Get today's infringements
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysInfringements = infringements.data?.filter(inf => {
    if (!inf.issued_at) return false
    const issueDate = new Date(inf.issued_at)
    issueDate.setHours(0, 0, 0, 0)
    return issueDate.getTime() === today.getTime()
  }).length || 0

  // Recent infringements for activity feed
  const recentInfringements = infringements.data
    ?.sort((a, b) => {
      const dateA = a.issued_at ? new Date(a.issued_at).getTime() : 0
      const dateB = b.issued_at ? new Date(b.issued_at).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 5)

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      paid: { variant: 'default', label: 'Paid' },
      under_review: { variant: 'secondary', label: 'Under Review' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    }
    const config = statusMap[status] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Officer Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Welcome back, {userMetadata?.name || 'Officer'}
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Infringements</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {infringements.isLoading ? '-' : totalInfringements}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              All time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Today</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {infringements.isLoading ? '-' : todaysInfringements}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Issued today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {infringements.isLoading ? '-' : pendingInfringements}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">
              {infringements.isLoading ? '-' : paidInfringements}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              Settled
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            Recent Infringements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {infringements.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : recentInfringements && recentInfringements.length > 0 ? (
            <div className="space-y-3">
              {recentInfringements.map((inf) => (
                <a href={`/officer/reports/${inf.id}`}
                  key={inf.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{inf.offence_code}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {inf.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Fine: ${inf.fine_amount}</span>
                      <span>•</span>
                      <span>
                        {inf.issued_at
                          ? new Date(inf.issued_at).toLocaleDateString()
                          : 'No date'}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {getStatusBadge(inf.status)}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No infringements yet</p>
              <p className="text-xs mt-1">Your issued infringements will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/officer/reports/create" className="block">
              <Button className="w-full h-auto py-4 flex-col gap-2" variant="default">
                <Plus className="h-6 w-6" />
                <span className="font-semibold">New Infringement</span>
                <span className="text-xs opacity-90">Issue a new ticket</span>
              </Button>
            </Link>
            <Link to="/officer/reports" className="block">
              <Button className="w-full h-auto py-4 flex-col gap-2" variant="outline">
                <FileText className="h-6 w-6" />
                <span className="font-semibold">View All Infringements</span>
                <span className="text-xs opacity-70">See all your tickets</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
