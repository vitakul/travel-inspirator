import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { getCountryFlag } from '@/utils/countryFlags'
import { categoryToTranslationKey } from '@/utils/categoryMappings'
import type { Place } from '@/store/slices/placesSlice'

interface PlaceSelectorProps {
  places: Place[]
  selectedPlaceIds: string[]
  onSelectPlace: (placeId: string) => void
  onClose: () => void
  loading?: boolean
}

export const PlaceSelector = ({ 
  places, 
  selectedPlaceIds, 
  onSelectPlace, 
  onClose,
  loading = false 
}: PlaceSelectorProps) => {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      // Don't show already selected places
      if (selectedPlaceIds.includes(place.id)) {
        return false
      }
      
      const matchesSearch = !searchTerm || 
        place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        place.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = !selectedCategory || place.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [places, selectedPlaceIds, searchTerm, selectedCategory])
  
  const categories = useMemo(() => {
    const cats = new Set(places.map(place => place.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [places])
  
  const handlePlaceClick = (place: Place) => {
    onSelectPlace(place.id)
  }
  
  const modalContent = (
    <div className="fixed inset-0 z-[10000] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {t('selectPlace')}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="searchPlaces" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('searchPlaces')}
                </label>
                <input
                  type="text"
                  id="searchPlaces"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('searchByNameOrLocation')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('filterByCategory')}
                </label>
                <select
                  id="categoryFilter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map(category => (
                    <option key={category} value={category || ''}>
                      {t(categoryToTranslationKey(category) as any)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Places List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">{t('loading')}</span>
                </div>
              ) : filteredPlaces.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>{t('noPlacesFound')}</p>
                  {searchTerm || selectedCategory ? (
                    <p className="text-sm mt-1">{t('tryDifferentFilters')}</p>
                  ) : (
                    <p className="text-sm mt-1">{t('createSomePlacesFirst')}</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPlaces.map((place) => (
                    <div
                      key={place.id}
                      onClick={() => handlePlaceClick(place)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="font-medium text-gray-900">{place.name}</h4>
                            <span className="text-lg ml-2">
                              {(() => {
                                const sources = [
                                  place.location_name,
                                  place.description,
                                  place.name,
                                  place.practical_info?.location_info
                                ].filter(Boolean)
                                
                                for (const source of sources) {
                                  const flag = getCountryFlag(source)
                                  if (flag !== '🌍') {
                                    return flag
                                  }
                                }
                                return '🌍'
                              })()}
                            </span>
                          </div>
                          
                          {place.location_name && (
                            <p className="text-sm text-gray-600 mt-1">{place.location_name}</p>
                          )}
                          
                          <div className="flex items-center mt-2 space-x-2">
                            {place.category && (
                              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                                {t(categoryToTranslationKey(place.category) as any)}
                              </span>
                            )}
                            
                            {place.rating && (
                              <div className="flex items-center">
                                <span className="text-yellow-400">★</span>
                                <span className="text-sm text-gray-600 ml-1">{place.rating}/5</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
              <p>
                {filteredPlaces.length > 0 
                  ? `${filteredPlaces.length} ${t('placesAvailable')}`
                  : selectedPlaceIds.length > 0 
                    ? `${selectedPlaceIds.length} ${t('placesAlreadySelected')}`
                    : ''
                }
              </p>
              
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  
  return createPortal(modalContent, document.body)
}