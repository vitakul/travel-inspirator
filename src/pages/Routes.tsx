import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { RouteBuilder } from '@/components/routes/RouteBuilder'
import { RouteMap } from '@/components/routes/RouteMap'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchRoutes } from '@/store/slices/routesSlice'

type ViewMode = 'list' | 'create' | 'view'

export const Routes = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  
  const { routes, loading } = useAppSelector(state => state.routes)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [useRouting, setUseRouting] = useState(true)
  
  useEffect(() => {
    dispatch(fetchRoutes())
  }, [dispatch])
  
  const handleRouteCreated = () => {
    setViewMode('list')
    dispatch(fetchRoutes()) // Refresh the routes list
  }
  
  const handleCreateRoute = () => {
    setViewMode('create')
  }
  
  const handleCancelCreate = () => {
    setViewMode('list')
  }
  
  const handleViewRoute = (routeId: string) => {
    setSelectedRouteId(routeId)
    setViewMode('view')
  }
  
  const handleBackToList = () => {
    setViewMode('list')
    setSelectedRouteId(null)
    setIsEditing(false)
    setUseRouting(true)
  }

  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <RouteBuilder 
          onRouteCreated={handleRouteCreated}
          onCancel={handleCancelCreate}
        />
      </div>
    )
  }

  if (viewMode === 'view' && selectedRouteId) {
    const selectedRoute = routes.find(r => r.id === selectedRouteId)
    
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        
        {/* Page Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {t('backToList')}
                </button>
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    isEditing 
                      ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' 
                      : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isEditing ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    )}
                  </svg>
                  {isEditing ? t('doneEditing') : t('editRoute')}
                </button>
                
                <button
                  onClick={() => setUseRouting(!useRouting)}
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    useRouting 
                      ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100' 
                      : 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100'
                  }`}
                  title={useRouting ? 'Switch to straight lines' : 'Switch to real routing'}
                >
                  <span className="text-base mr-2">{useRouting ? '🛣️' : '📍'}</span>
                  {useRouting ? 'Real Routes' : 'Straight Lines'}
                </button>
              </div>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedRoute?.name || t('viewRoute')}
                </h1>
                {selectedRoute?.description && (
                  <p className="text-gray-600">{selectedRoute.description}</p>
                )}
              </div>
              
              <div className="w-48"></div> {/* Spacer for balance */}
            </div>
          </div>
        </div>

        {/* Route Map */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
            <RouteMap 
              routeId={selectedRouteId}
              className="h-full w-full"
              editable={isEditing}
              useRouting={useRouting}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('routes')}</h1>
              <p className="text-gray-600">{t('createAndManageRoutes')}</p>
            </div>
            <button
              onClick={handleCreateRoute}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('createRoute')}
            </button>
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <NavLink
          to="/dashboard"
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <span className="mr-2">🏠</span>
          {t('backToDashboard')}
        </NavLink>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">{t('loading')}</span>
          </div>
        ) : routes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">🗺️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noRoutesYet')}</h3>
              <p className="text-gray-600 mb-6">
                {t('routesFunctionality')}
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• {t('connectMultiplePlaces')}</p>
                <p>• {t('editRoutePaths')}</p>
                <p>• {t('shareRoutes')}</p>
                <p>• {t('exportRoutes')}</p>
              </div>
              <button 
                onClick={handleCreateRoute}
                className="mt-6 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-colors"
              >
                {t('createFirstRoute')}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <div key={route.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{route.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    route.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {route.is_public ? t('public') : t('private')}
                  </span>
                </div>
                
                {route.description && (
                  <p className="text-gray-600 text-sm mb-4">{route.description}</p>
                )}
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📍</span>
                    <span>{route.waypoint_count} {t('waypoints')}</span>
                  </div>
                  
                  {route.difficulty_level && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">⚡</span>
                      <span>{t(route.difficulty_level)}</span>
                    </div>
                  )}
                  
                  {route.transport_mode && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">
                        {route.transport_mode === 'walking' ? '🚶' : 
                         route.transport_mode === 'driving' ? '🚗' :
                         route.transport_mode === 'cycling' ? '🚴' :
                         route.transport_mode === 'public_transport' ? '🚌' : '🔄'}
                      </span>
                      <span>{t(route.transport_mode === 'public_transport' ? 'publicTransport' : route.transport_mode)}</span>
                    </div>
                  )}
                  
                  {route.estimated_duration && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">⏱️</span>
                      <span>{route.estimated_duration} {t('minutes')}</span>
                    </div>
                  )}
                  
                  {route.total_distance && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📏</span>
                      <span>{route.total_distance} km</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => handleViewRoute(route.id)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    {t('viewRoute')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}