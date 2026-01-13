import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  FileText, 
  Camera,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import type { Infringement, Offence, EvidenceFile } from '@/lib/supabase/schema'
import PuffLoader from 'react-spinners/PuffLoader'
import { MapPicker } from '@/components/ui/map'

export const Route = createFileRoute('/officer/reports/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [infringement, setInfringement] = useState<Infringement | null>(null)
  const [offence, setOffence] = useState<Offence | null>(null)
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInfringementDetails()
  }, [id])

  const fetchInfringementDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch infringement
      const { data: infData, error: infError } = await supabase
        .from('infringements')
        .select('*')
        .eq('id', id)
        .single()

      if (infError) throw infError
      if (!infData) throw new Error('Infringement not found')

      setInfringement(infData as Infringement)

      // Fetch offence details
      if (infData.offenceCode) {
        const { data: offData, error: offError } = await supabase
          .from('offences')
          .select('*')
          .eq('code', infData.offenceCode)
          .single()

        if (!offError && offData) {
          setOffence(offData as Offence)
        }
      }

      // Fetch evidence files
      const { data: evidenceData, error: evidenceError } = await supabase
        .from('evidence_files')
        .select('*')
        .eq('infringement_id', id)

      if (!evidenceError && evidenceData) {
        setEvidenceFiles(evidenceData as EvidenceFile[])

        // Fetch photo URLs from storage - handle both camelCase and snake_case
        const urls = await Promise.all(
          evidenceData
            .filter(file => file.file_path || file.filePath) // Filter out files without a path
            .map(async (file) => {
              const filePath = file.file_path || file.filePath
              const { data } = supabase.storage
                .from('evidence')
                .getPublicUrl(filePath)
              return data.publicUrl
            })
        )
        setPhotoUrls(urls.filter(url => url)) // Remove any null/undefined URLs
      }
    } catch (err: any) {
      console.error('Error fetching infringement:', err)
      setError(err.message || 'Failed to load infringement details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, icon: any }> = {
      pending: { variant: 'outline', label: 'Pending', icon: Clock },
      paid: { variant: 'default', label: 'Paid', icon: CheckCircle },
      under_review: { variant: 'secondary', label: 'Under Review', icon: AlertCircle },
      cancelled: { variant: 'destructive', label: 'Cancelled', icon: AlertCircle },
    }
    const config = statusMap[status] || { variant: 'outline' as const, label: status, icon: FileText }
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const parseLocation = (locationJson: string | null) => {
    if (!locationJson) {
      console.log('No location data provided')
      return null
    }
    
    console.log('Raw location data:', locationJson)
    
    // If it's just text (not JSON), return as text location
    if (!locationJson.startsWith('{') && !locationJson.startsWith('[')) {
      console.log('Location is text:', locationJson)
      return { text: locationJson }
    }
    
    try {
      const loc = JSON.parse(locationJson)
      console.log('Parsed location:', loc)
      if (loc.type === 'Point' && loc.coordinates && Array.isArray(loc.coordinates) && loc.coordinates.length >= 2) {
        const result = {
          longitude: loc.coordinates[0],
          latitude: loc.coordinates[1]
        }
        console.log('Extracted coordinates:', result)
        return result
      }
    } catch (e) {
      // If JSON parsing fails, treat as text location
      console.log('JSON parse failed, treating as text')
      return { text: locationJson }
    }
    console.log('Could not parse location')
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center space-y-3">
          <PuffLoader color="#1d4ed8" size={60} />
          <p className="text-sm text-muted-foreground">Loading infringement details...</p>
        </div>
      </div>
    )
  }

  if (error || !infringement) {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate({ to: '/officer/reports' })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Report</h3>
            <p className="text-sm text-muted-foreground">
              {error || 'The requested infringement could not be found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const location = parseLocation(infringement.location)
  console.log('Final location object:', location)
  console.log('Has latitude?', location && 'latitude' in location)

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            onClick={() => navigate({ to: '/officer/reports' })}
            className="-ml-3 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Infringement Details</h1>
          <p className="text-sm text-muted-foreground">
            Report ID: {id?.substring(0, 8)}...
          </p>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(infringement.status)}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Offence Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Offence Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">Offence Code</div>
              <div className="text-lg font-semibold">{infringement.offenceCode}</div>
            </div>
            
            {offence && (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Offence Name</div>
                  <div className="text-base font-semibold">{offence.name}</div>
                </div>

                {offence.description && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Official Description</div>
                    <div className="text-sm text-muted-foreground">{offence.description}</div>
                  </div>
                )}

                {offence.agencyType && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Agency Type</div>
                    <Badge variant="secondary">{offence.agencyType}</Badge>
                  </div>
                )}
              </>
            )}

            {infringement.description && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Officer Notes</div>
                <div className="text-sm">{infringement.description}</div>
              </div>
            )}

            <Separator />

            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Fine Amount</div>
                <div className="text-2xl font-bold">${infringement.fineAmount}</div>
              </div>
            </div>

            {offence && (
              <>
                {offence.severity && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">Severity</div>
                    <Badge variant={offence.severity === 'critical' ? 'destructive' : offence.severity === 'serious' ? 'secondary' : 'outline'}>
                      {offence.severity}
                    </Badge>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 text-sm">
                  {offence.requiresEvidence && (
                    <div className="flex items-center gap-1.5">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Evidence Required</span>
                    </div>
                  )}
                  {offence.requiresLocation && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location Required</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Time & Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Time & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Issued At</div>
                <div className="text-base font-medium">
                  {infringement.issuedAt
                    ? new Date(infringement.issuedAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Unknown'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {infringement.issuedAt
                    ? new Date(infringement.issuedAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : ''}
                </div>
              </div>
            </div>

            <Separator />

            {location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {'latitude' in location ? 'GPS Coordinates' : 'Location'}
                  </div>
                  <div className="text-sm font-mono">
                    {'latitude' in location 
                      ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                      : location.text
                    }
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location Map - Full Width */}
      {location && 'latitude' in location ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Map
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-muted-foreground">GPS Coordinates: </span>
                <span className="font-mono">{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View on Google Maps →
              </a>
            </div>
            <div className="h-96 border-2 border-dashed border-primary/20 rounded-lg">
              <MapPicker
                latitude={location.latitude}
                longitude={location.longitude}
              />
            </div>
          </CardContent>
        </Card>
      ) : location ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Location data available as text only: {location.text}</p>
            <p className="text-xs mt-1">GPS coordinates required for map display</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No location data available</p>
          </CardContent>
        </Card>
      )}

      {/* Photos/Evidence */}
      {evidenceFiles.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Evidence Photos ({photoUrls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {photoUrls.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Loading evidence photos...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photoUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 hover:border-primary transition-all shadow-sm hover:shadow-md"
                  >
                    <img
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = '<div class="flex items-center justify-center h-full bg-muted"><Camera class="h-8 w-8 text-muted-foreground" /></div>'
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">View Full Size</span>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.print()}>
            <FileText className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
