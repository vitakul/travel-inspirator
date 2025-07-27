import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { createRoute, addWaypoint } from '@/store/slices/routesSlice'
import { fetchPlaces } from '@/store/slices/placesSlice'
import { fetchFamilyGroups } from '@/store/slices/familySlice'
import { WaypointList } from './WaypointList'
import { PlaceSelector } from './PlaceSelector'
import type { Database } from '@/integrations/supabase/types'

type RouteDifficulty = Database['public']['Enums']['route_difficulty']
type RouteTransport = Database['public']['Enums']['route_transport']

interface RouteBuilderProps {
  onRouteCreated?: (routeId: string) => void
  onCancel?: () => void
}

export const RouteBuilder = ({ onRouteCreated, onCancel }: RouteBuilderProps) => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { t } = useTranslation()
  
  const { places, loading: placesLoading } = useAppSelector(state => state.places)
  const { creating, error } = useAppSelector(state => state.routes)
  const familyGroups = useAppSelector(state => state.family.groups)
  
  const [routeName, setRouteName] = useState('')
  const [routeDescription, setRouteDescription] = useState('')
  const [selectedFamilyId, setSelectedFamilyId] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [difficulty, setDifficulty] = useState<RouteDifficulty>('easy')
  const [transportMode, setTransportMode] = useState<RouteTransport>('walking')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [totalDistance, setTotalDistance] = useState('')
  
  const [selectedWaypoints, setSelectedWaypoints] = useState<string[]>([])
  const [showPlaceSelector, setShowPlaceSelector] = useState(false)
  
  useEffect(() => {
    dispatch(fetchPlaces())
    dispatch(fetchFamilyGroups())
  }, [dispatch])
  
  useEffect(() => {
    if (familyGroups.length > 0 && !selectedFamilyId) {
      setSelectedFamilyId(familyGroups[0].id)
    }
  }, [familyGroups, selectedFamilyId])
  
  const handleAddPlace = (placeId: string) => {
    if (!selectedWaypoints.includes(placeId)) {
      setSelectedWaypoints([...selectedWaypoints, placeId])
    }
    setShowPlaceSelector(false)
  }
  
  const handleRemoveWaypoint = (placeId: string) => {
    setSelectedWaypoints(selectedWaypoints.filter(id => id !== placeId))
  }
  
  const handleReorderWaypoints = (newOrder: string[]) => {
    setSelectedWaypoints(newOrder)
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !selectedFamilyId || selectedWaypoints.length < 2) {
      return
    }
    
    try {
      const routeData = {
        name: routeName,
        description: routeDescription || undefined,
        created_by: user.id,
        family_id: selectedFamilyId,
        is_public: isPublic,
        estimated_duration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
        difficulty_level: difficulty,
        transport_mode: transportMode,
        total_distance: totalDistance ? parseFloat(totalDistance) : undefined
      }
      
      const result = await dispatch(createRoute(routeData))
      
      if (createRoute.fulfilled.match(result)) {
        const routeId = result.payload.id
        
        // Add waypoints in order
        for (let i = 0; i < selectedWaypoints.length; i++) {
          await dispatch(addWaypoint({
            route_id: routeId,
            place_id: selectedWaypoints[i],
            order_index: i,
            transport_to_next: i < selectedWaypoints.length - 1 ? transportMode : undefined
          }))
        }
        
        onRouteCreated?.(routeId)
      }
    } catch (error) {
      console.error('Error creating route:', error)
    }
  }
  
  const isFormValid = routeName.trim() && selectedFamilyId && selectedWaypoints.length >= 2
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('createRoute')}</h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Route Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('routeName')} *
              </label>
              <input
                type="text"
                id="routeName"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="familyGroup" className="block text-sm font-medium text-gray-700 mb-1">
                {t('familyGroup')} *
              </label>
              <select
                id="familyGroup"
                value={selectedFamilyId}
                onChange={(e) => setSelectedFamilyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">{t('selectFamilyGroup')}</option>
                {familyGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="routeDescription" className="block text-sm font-medium text-gray-700 mb-1">
              {t('description')}
            </label>
            <textarea
              id="routeDescription"
              value={routeDescription}
              onChange={(e) => setRouteDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Route Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                {t('difficulty')}
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as RouteDifficulty)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="easy">{t('easy')}</option>
                <option value="moderate">{t('moderate')}</option>
                <option value="hard">{t('hard')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="transportMode" className="block text-sm font-medium text-gray-700 mb-1">
                {t('transportMode')}
              </label>
              <select
                id="transportMode"
                value={transportMode}
                onChange={(e) => setTransportMode(e.target.value as RouteTransport)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="walking">{t('walking')}</option>
                <option value="driving">{t('driving')}</option>
                <option value="cycling">{t('cycling')}</option>
                <option value="public_transport">{t('publicTransport')}</option>
                <option value="mixed">{t('mixed')}</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
                {t('estimatedDuration')} ({t('minutes')})
              </label>
              <input
                type="number"
                id="estimatedDuration"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="totalDistance" className="block text-sm font-medium text-gray-700 mb-1">
                {t('totalDistance')} (km)
              </label>
              <input
                type="number"
                id="totalDistance"
                value={totalDistance}
                onChange={(e) => setTotalDistance(e.target.value)}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Privacy Settings */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
              {t('makeRoutePublic')}
            </label>
          </div>
          
          {/* Waypoints Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {t('waypoints')} ({selectedWaypoints.length}/∞)
              </h3>
              <button
                type="button"
                onClick={() => setShowPlaceSelector(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('addPlace')}
              </button>
            </div>
            
            {selectedWaypoints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p>{t('noWaypointsYet')}</p>
                <p className="text-sm">{t('addAtLeastTwoPlaces')}</p>
              </div>
            ) : (
              <WaypointList
                waypointIds={selectedWaypoints}
                places={places}
                onRemove={handleRemoveWaypoint}
                onReorder={handleReorderWaypoints}
                transportMode={transportMode}
              />
            )}
            
            {selectedWaypoints.length > 0 && selectedWaypoints.length < 2 && (
              <p className="text-amber-600 text-sm mt-2">
                {t('routeRequiresAtLeastTwoPlaces')}
              </p>
            )}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {t('cancel')}
            </button>
            
            <button
              type="submit"
              disabled={!isFormValid || creating}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {creating ? t('creating') : t('createRoute')}
            </button>
          </div>
        </form>
      </div>
      
      {/* Place Selector Modal */}
      {showPlaceSelector && (
        <PlaceSelector
          places={places}
          selectedPlaceIds={selectedWaypoints}
          onSelectPlace={handleAddPlace}
          onClose={() => setShowPlaceSelector(false)}
          loading={placesLoading}
        />
      )}
    </div>
  )
}