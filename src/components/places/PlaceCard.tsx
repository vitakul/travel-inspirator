import { getCountryFlag } from '@/utils/countryFlags'
import { useAuth } from '@/hooks/useAuth'
import { useAppSelector } from '@/hooks/redux'

interface PlaceCardProps {
  place: any
  onClick?: () => void
  onEdit?: () => void
}

export const PlaceCard = ({ place, onClick, onEdit }: PlaceCardProps) => {
  const { user } = useAuth()
  const { groups } = useAppSelector((state) => state.family)
  
  // Check if user can edit this place (creator or family member of the same group)
  const canEdit = user && (
    place.created_by === user.id || 
    groups.some(group => group.id === place.family_id)
  )
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'monuments':
        return '🏛️'
      case 'natural_attractions':
        return '🌲'
      case 'other_attractions':
        return '🎪'
      case 'restaurants':
        return '🍽️'
      case 'accommodation':
        return '🏨'
      default:
        return '📍'
    }
  }

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-lg mr-2">{getCategoryIcon(place.category)}</span>
            <h3 className="font-semibold text-gray-900 text-sm flex-1">{place.name}</h3>
            <span className="text-lg ml-2">{
              (() => {
                // Try multiple sources for country detection
                const sources = [
                  place.location_name,
                  place.description, 
                  place.name,
                  // Extract location info from practical_info if available
                  place.practical_info?.location_info
                ].filter(Boolean)
                
                console.log('Place data for country detection:', {
                  name: place.name,
                  location_name: place.location_name,
                  description: place.description,
                  practical_info: place.practical_info
                })
                
                // Try each source until we find a flag
                for (const source of sources) {
                  const flag = getCountryFlag(source)
                  if (flag !== '🌍') {
                    return flag
                  }
                }
                return '🌍'
              })()
            }</span>
          </div>
          
          {place.rating && (
            <div className="flex items-center mb-2">
              <div className="flex">
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
              <span className="ml-1 text-xs text-gray-600">({place.rating}/5)</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 capitalize">
              {place.category.replace('_', ' ')}
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {place.is_public ? '🌐 Public' : '🔒 Private'}
              </span>
              {canEdit && onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit()
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  ✏️ Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}