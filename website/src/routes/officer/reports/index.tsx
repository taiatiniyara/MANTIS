import { createFileRoute, } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Plus, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import type { Infringement } from '@/lib/supabase/schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export const Route = createFileRoute('/officer/reports/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Fetch officer's infringements
  const infringements = useSupabaseQuery<Infringement>({
    tableName: 'infringements',
    queryKey: ['officer-infringements', user?.id || "uid"],
    filter: user?.id ? {
      column: 'officer_id',
      value: user.id,
    } : undefined,
    enabled: Boolean(user?.id),
  })

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

  // Filter infringements based on search and status
  const filteredInfringements = infringements.data?.filter(inf => {
    const matchesSearch = searchQuery === '' || 
      inf.offence_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || inf.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Sort by most recent
  const sortedInfringements = filteredInfringements?.sort((a, b) => {
    const dateA = a.issued_at ? new Date(a.issued_at).getTime() : 0
    const dateB = b.issued_at ? new Date(b.issued_at).getTime() : 0
    return dateB - dateA
  })

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">My Infringements</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and track your issued infringements
          </p>
        </div>
        <a href="/officer/reports/create">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Infringement
          </Button>
        </a>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by offence code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
                className="flex-1 sm:flex-none"
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
                className="flex-1 sm:flex-none"
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('paid')}
                className="flex-1 sm:flex-none"
              >
                Paid
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infringements List */}
      <Card>
        <CardHeader className="p-4 sm:p-6 border-b">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            Infringements ({sortedInfringements?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {infringements.isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">Loading infringements...</p>
            </div>
          ) : sortedInfringements && sortedInfringements.length > 0 ? (
            <div className="divide-y">
              {sortedInfringements.map((inf) => (
                <a 
                  key={inf.id} 
                  href="/officer/reports/$id" 
                  className="block"
                >
                  <div className="p-4 sm:p-6 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base">
                            {inf.offence_code}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                            {inf.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Fine:</span>
                          <span className="font-semibold text-foreground">
                            ${inf.fine_amount}
                          </span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Issued:</span>
                          <span>
                            {inf.issued_at
                              ? new Date(inf.issued_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : 'No date'}
                          </span>
                        </div>
                        {inf.issued_at && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(inf.issued_at).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-start gap-2">
                      {getStatusBadge(inf.status)}
                    </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">
                {searchQuery || statusFilter !== 'all'
                  ? 'No infringements match your filters'
                  : 'No infringements yet'}
              </p>
              <p className="text-xs mt-1">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first infringement to get started'}
              </p>
              <a href="/officer/reports/create">
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Infringement
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
