import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import { LatLngExpression, Icon } from 'leaflet'
import { useAppSelector } from '@/hooks/redux'

// Fix for default markers in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Custom marker icon
const customIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Selected place marker icon (larger and different color)
const selectedIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [35, 55], // Larger size
  iconAnchor: [17, 55],
  popupAnchor: [1, -45],
  shadowSize: [55, 55],
  className: 'selected-marker' // For custom styling
})

interface MapComponentProps {
  center?: LatLngExpression
  zoom?: number
  onMapClick?: (lat: number, lng: number) => void
  className?: string
}

const MapEvents = ({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) => {
  const map = useMap()

  useEffect(() => {
    if (onMapClick) {
      const handleClick = (e: any) => {
        onMapClick(e.latlng.lat, e.latlng.lng)
      }
      
      map.on('click', handleClick)
      return () => {
        map.off('click', handleClick)
      }
    }
  }, [map, onMapClick])

  return null
}

// Component to handle map center changes based on selected place
const MapController = ({ selectedPlace }: { selectedPlace: any }) => {
  const map = useMap()
  
  useEffect(() => {
    if (selectedPlace && selectedPlace.latitude && selectedPlace.longitude) {
      const lat = selectedPlace.latitude
      const lng = selectedPlace.longitude
      map.setView([lat, lng], 15, { animate: true })
    }
  }, [map, selectedPlace])
  
  return null
}

export const MapComponent = ({ 
  center = [50.0755, 14.4378], // Prague as default
  zoom = 13,
  onMapClick,
  className = "h-full w-full"
}: MapComponentProps) => {
  const { places, selectedPlace } = useAppSelector((state) => state.places)
  const { routes = [] } = useAppSelector((state) => state.routes || { routes: [] })
  const mapRef = useRef<any>(null)

  // Get route colors for different routes
  const getRouteColor = (index: number) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
    return colors[index % colors.length]
  }

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapEvents onMapClick={onMapClick} />
        <MapController selectedPlace={selectedPlace} />
        
        {places.map((place) => {
          // Use the extracted latitude and longitude from PostGIS
          if (place.latitude && place.longitude) {
            const lat = place.latitude
            const lng = place.longitude
            const isSelected = selectedPlace && selectedPlace.id === place.id
            return (
              <Marker
                key={place.id}
                position={[lat, lng]}
                icon={isSelected ? selectedIcon : customIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900">{place.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{place.category}</p>
                    {place.rating && (
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-600">Rating: </span>
                        <div className="ml-1 flex">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-sm ${
                                i < place.rating! ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {place.description && (
                      <p className="text-sm text-gray-700">{place.description}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          }
          return null
        })}

        {/* Simple route visualization - only if routes exist and have data */}
        {routes.length > 0 && places.length >= 2 && routes.map((route, routeIndex) => {
          // Only show routes that have waypoints
          if (!route.waypoint_count || route.waypoint_count < 2) return null
          
          // For demo purposes, create a simple line between first few places
          // In production, this would fetch actual waypoint data
          const routePlaces = places.slice(0, Math.min(route.waypoint_count, places.length))
          
          if (routePlaces.length < 2) return null
          
          const routePositions: LatLngExpression[] = routePlaces
            .filter(place => place.latitude && place.longitude)
            .map(place => [place.latitude!, place.longitude!])

          if (routePositions.length < 2) return null

          return (
            <Polyline
              key={route.id}
              positions={routePositions}
              color={getRouteColor(routeIndex)}
              weight={3}
              opacity={0.6}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{route.name}</h3>
                  <p className="text-xs text-gray-500">
                    {route.waypoint_count} waypoints • {route.difficulty_level || 'Unknown'} difficulty
                  </p>
                </div>
              </Popup>
            </Polyline>
          )
        })}

      </MapContainer>
    </div>
  )
}