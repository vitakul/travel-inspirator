import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { RouteBuilder } from '@/components/routes/RouteBuilder'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchRoutes } from '@/store/slices/routesSlice'

type ViewMode = 'list' | 'create'

export const Routes = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  
  const { routes, loading } = useAppSelector(state => state.routes)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  
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
                  <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition-colors">
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