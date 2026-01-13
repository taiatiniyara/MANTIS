import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import type { Location } from '@/lib/supabase/schema'
import { useState, useMemo } from 'react'
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, MapPin, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export const Route = createFileRoute('/agency-admin/locations/')({
  component: RouteComponent,
})

interface LocationWithCoords extends Location {
  coordinates?: { lat: number; lng: number }
}

function parseGeometry(
  geom: string | null,
): { lat: number; lng: number } | null {
  if (!geom) return null
  try {
    const parsed = JSON.parse(geom)
    if (parsed.type === 'Point' && parsed.coordinates) {
      return { lng: parsed.coordinates[0], lat: parsed.coordinates[1] }
    }
    // For Polygon, use centroid approximation (first coordinate)
    if (parsed.type === 'Polygon' && parsed.coordinates?.[0]?.[0]) {
      return {
        lng: parsed.coordinates[0][0][0],
        lat: parsed.coordinates[0][0][1],
      }
    }
  } catch (e) {
    console.error('Failed to parse geometry:', e)
  }
  return null
}

function RouteComponent() {
  const { userMetadata } = useAuth()
  const [selectedLocation, setSelectedLocation] =
    useState<LocationWithCoords | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [viewState, setViewState] = useState({
    latitude: -18.1416, // Default to Fiji
    longitude: 178.4419,
    zoom: 8,
  })

  const {
    data: locations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agency-locations', userMetadata?.agency_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('agency_id', userMetadata?.agency_id || '')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data as Location[]).map((loc) => ({
        ...loc,
        coordinates: parseGeometry(loc.geom),
      })) as LocationWithCoords[]
    },
    enabled: !!userMetadata?.agency_id,
  })

  const locationsWithCoords = useMemo(
    () => locations?.filter((loc) => loc.coordinates) || [],
    [locations],
  )

  // Center map on locations once when data first loads
  useMemo(() => {
    if (locationsWithCoords.length > 0 && !hasInitialized) {
      const avgLat =
        locationsWithCoords.reduce(
          (sum, loc) => sum + (loc.coordinates?.lat || 0),
          0,
        ) / locationsWithCoords.length
      const avgLng =
        locationsWithCoords.reduce(
          (sum, loc) => sum + (loc.coordinates?.lng || 0),
          0,
        ) / locationsWithCoords.length
      setViewState((prev) => ({
        ...prev,
        latitude: avgLat,
        longitude: avgLng,
      }))
      setHasInitialized(true)
    }
  }, [locationsWithCoords, hasInitialized])

  if (error) {
    return (
      <Card className="m-4">
        <CardContent className="pt-6">
          <p className="text-destructive">
            Error loading locations: {(error as Error).message}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="relative h-[calc(100vh-8rem)]">
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-3 left-3 z-10 md:hidden bg-background shadow-lg touch-manipulation"
        onClick={() => setShowSidebar(!showSidebar)}
      >
        {showSidebar ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
          absolute top-0 left-0 h-full w-[85vw] max-w-sm sm:w-80 bg-background border-r z-20
          transition-transform duration-300 ease-in-out
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-3 sm:p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">Locations</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden touch-manipulation"
              onClick={() => setShowSidebar(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : locations && locations.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {locations.length} location{locations.length !== 1 ? 's' : ''} found
              </p>
              {locations.map((location) => (
                <Card
                  key={location.id}
                  className={
                    selectedLocation?.id === location.id
                      ? 'border-primary cursor-pointer active:bg-accent/50 transition-colors touch-manipulation'
                      : 'cursor-pointer hover:border-primary/50 active:bg-accent/50 transition-colors touch-manipulation'
                  }
                  onClick={() => {
                    setSelectedLocation(location)
                    if (location.coordinates) {
                      setViewState((prev) => ({
                        ...prev,
                        latitude: location.coordinates!.lat,
                        longitude: location.coordinates!.lng,
                        zoom: 12,
                      }))
                    }
                    setShowSidebar(false)
                  }}
                >
                  <CardHeader className="pb-2 p-3 sm:p-4 sm:pb-3">
                    <CardTitle className="text-sm sm:text-base flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <span className="line-clamp-2">{location.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0 sm:p-4 sm:pt-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">
                        {location.type}
                      </Badge>
                      {location.coordinates && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          Mapped
                        </Badge>
                      )}
                    </div>
                    {location.parent_id && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Has parent location
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No locations</h3>
                <p className="text-muted-foreground text-center text-sm">
                  Your agency doesn't have any locations yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="h-full md:ml-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-muted">
            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Map attributionControl={false}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          >
            <NavigationControl position="top-right" />

            {locationsWithCoords.map((location) => (
              <Marker
                key={location.id}
                latitude={location.coordinates!.lat}
                longitude={location.coordinates!.lng}
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  setSelectedLocation(location)
                }}
              >
                <div className="cursor-pointer transform hover:scale-110 active:scale-125 transition-transform touch-manipulation">
                  <MapPin
                    className="w-7 h-7 sm:w-8 sm:h-8 text-primary drop-shadow-lg"
                    fill="currentColor"
                  />
                </div>
              </Marker>
            ))}

            {selectedLocation?.coordinates && (
              <Popup
                latitude={selectedLocation.coordinates.lat}
                longitude={selectedLocation.coordinates.lng}
                onClose={() => setSelectedLocation(null)}
                closeOnClick={false}
                offset={25}
                maxWidth="280px"
              >
                <div className="p-2 sm:p-3">
                  <h3 className="font-semibold mb-1 text-sm sm:text-base line-clamp-2">
                    {selectedLocation.name}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs mb-2">
                    {selectedLocation.type}
                  </Badge>
                  <div className="text-[10px] sm:text-xs text-muted-foreground space-y-1">
                    <p>
                      Lat: {selectedLocation.coordinates.lat.toFixed(4)}
                    </p>
                    <p>
                      Lng: {selectedLocation.coordinates.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        )}
      </div>
    </div>
  )
}
