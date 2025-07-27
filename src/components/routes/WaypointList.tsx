import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { categoryToTranslationKey } from '@/utils/categoryMappings'
import type { Place } from '@/store/slices/placesSlice'
import type { Database } from '@/integrations/supabase/types'

type RouteTransport = Database['public']['Enums']['route_transport']

interface WaypointListProps {
  waypointIds: string[]
  places: Place[]
  onRemove: (placeId: string) => void
  onReorder: (newOrder: string[]) => void
  transportMode: RouteTransport
}

export const WaypointList = ({ 
  waypointIds, 
  places, 
  onRemove, 
  onReorder,
  transportMode 
}: WaypointListProps) => {
  const { t } = useTranslation()
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  
  const waypointPlaces = waypointIds
    .map(id => places.find(place => place.id === id))
    .filter(Boolean) as Place[]
  
  const getTransportIcon = (transport: RouteTransport) => {
    switch (transport) {
      case 'walking': return '🚶'
      case 'driving': return '🚗'
      case 'cycling': return '🚴'
      case 'public_transport': return '🚌'
      case 'mixed': return '🔄'
      default: return '🚶'
    }
  }
  
  const getTransportLabel = (transport: RouteTransport) => {
    switch (transport) {
      case 'walking': return t('walking')
      case 'driving': return t('driving')
      case 'cycling': return t('cycling')
      case 'public_transport': return t('publicTransport')
      case 'mixed': return t('mixed')
      default: return t('walking')
    }
  }
  
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }
    
    const newOrder = [...waypointIds]
    const [draggedItem] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(dropIndex, 0, draggedItem)
    
    onReorder(newOrder)
    setDraggedIndex(null)
  }
  
  const handleDragEnd = () => {
    setDraggedIndex(null)
  }
  
  if (waypointPlaces.length === 0) {
    return null
  }
  
  return (
    <div className="space-y-3">
      {waypointPlaces.map((place, index) => (
        <div key={place.id} className="relative">
          {/* Waypoint Card */}
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              bg-white border rounded-lg p-4 cursor-move transition-all
              ${draggedIndex === index ? 'opacity-50 scale-95' : 'hover:shadow-md'}
              ${index === 0 ? 'border-green-300 bg-green-50' : ''}
              ${index === waypointPlaces.length - 1 ? 'border-red-300 bg-red-50' : ''}
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Drag Handle */}
                <div className="flex flex-col space-y-1 text-gray-400">
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                  <div className="w-1 h-1 bg-current rounded-full"></div>
                </div>
                
                {/* Waypoint Number */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                  ${index === 0 ? 'bg-green-500' : index === waypointPlaces.length - 1 ? 'bg-red-500' : 'bg-blue-500'}
                `}>
                  {index === 0 ? 'S' : index === waypointPlaces.length - 1 ? 'E' : index + 1}
                </div>
                
                {/* Place Information */}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{place.name}</h4>
                  <p className="text-sm text-gray-600">{place.location_name}</p>
                  {place.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full mt-1">
                      {t(categoryToTranslationKey(place.category) as any)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Remove Button */}
              <button
                onClick={() => onRemove(place.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title={t('removeWaypoint')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Transport to Next Waypoint */}
          {index < waypointPlaces.length - 1 && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                <span className="text-lg">{getTransportIcon(transportMode)}</span>
                <span>{getTransportLabel(transportMode)}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m0 0l7-7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Waypoint Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">{t('waypointInstructions')}</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>{t('dragToReorder')}</li>
              <li>{t('greenIsStart')}</li>
              <li>{t('redIsEnd')}</li>
              <li>{t('transportModeAppliesTo')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}