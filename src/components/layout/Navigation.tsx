import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'

interface NavigationProps {
  className?: string
}

export const Navigation = ({ className = "" }: NavigationProps) => {
  const location = useLocation()
  const { t } = useTranslation()
  
  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: '🏠', description: 'Main overview' },
    { path: '/places', label: t('places'), icon: '📍', description: 'Manage destinations' },
    { path: '/routes', label: t('routes'), icon: '🗺️', description: 'Create travel routes' },
    { path: '/family', label: t('family'), icon: '👥', description: 'Manage groups' },
  ]

  return (
    <div className={className}>
      {/* Current Page Indicator */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center">
          <span className="text-lg mr-2">
            {navItems.find(item => location.pathname === item.path)?.icon || '📍'}
          </span>
          <div>
            <p className="text-sm font-medium text-blue-900">
              {navItems.find(item => location.pathname === item.path)?.label || 'Current Page'}
            </p>
            <p className="text-xs text-blue-600">
              {navItems.find(item => location.pathname === item.path)?.description || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-1">
        {navItems.filter(item => location.pathname !== item.path).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <div>
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </NavLink>
        ))}
      </nav>

      {/* Quick Return to Dashboard */}
      {location.pathname !== '/dashboard' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <NavLink
            to="/dashboard"
            className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-primary bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            <span className="mr-2">🏠</span>
{t('backToDashboard')}
          </NavLink>
        </div>
      )}
    </div>
  )
}