import { useAppSelector } from '@/hooks/redux'
import { useTranslation } from '@/hooks/useTranslation'

export const MapLegend = () => {
  const { routes } = useAppSelector((state) => state.routes || { routes: [] })
  const { t } = useTranslation()
  
  const getRouteColor = (index: number) => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
    return colors[index % colors.length]
  }

  if (!routes || routes.length === 0) return null

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 z-[1000] max-w-64">
      <h4 className="text-sm font-medium text-gray-900 mb-2">{t('routes')}</h4>
      <div className="space-y-1">
        {routes.slice(0, 6).map((route, index) => (
          <div key={route.id} className="flex items-center text-xs">
            <div 
              className="w-3 h-1 mr-2 rounded"
              style={{ backgroundColor: getRouteColor(index) }}
            />
            <span className="text-gray-700 truncate" title={route.name}>
              {route.name}
            </span>
          </div>
        ))}
        {routes.length > 6 && (
          <div className="text-xs text-gray-500 mt-1">
            +{routes.length - 6} more routes
          </div>
        )}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-600">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2 flex-shrink-0" />
          <span>{t('places')}</span>
        </div>
      </div>
    </div>
  )
}