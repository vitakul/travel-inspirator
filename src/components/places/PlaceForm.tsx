import { useState, useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { createPlace, updatePlace } from '@/store/slices/placesSlice'
import { fetchFamilyGroups } from '@/store/slices/familySlice'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'

interface PlaceFormProps {
  onClose: () => void
  onSuccess?: () => void
  initialCoordinates?: { lat: number; lng: number }
  editingPlace?: any // Place to edit, if provided
}

interface LocationSuggestion {
  display_name: string
  lat: string
  lon: string
  place_id: string
}

export const PlaceForm = ({ onClose, onSuccess, initialCoordinates, editingPlace }: PlaceFormProps) => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { groups } = useAppSelector((state) => state.family)
  const { currency } = useAppSelector((state) => state.settings)
  const { t } = useTranslation()
  
  const [formData, setFormData] = useState({
    name: editingPlace?.name || '',
    description: editingPlace?.description || '',
    category: editingPlace?.category || 'other',
    rating: editingPlace?.rating || 1,
    location_name: editingPlace?.location_name || '', // Store the full location display name
    practical_info: {
      entrance_fee: editingPlace?.practical_info?.entrance_fee?.toString() || '',
      currency: editingPlace?.practical_info?.currency || currency,
      parking: editingPlace?.practical_info?.parking || false,
      description: editingPlace?.practical_info?.description || ''
    },
    is_public: editingPlace?.is_public ?? true, // Make public by default
    family_id: editingPlace?.family_id || '',
    location: initialCoordinates || (editingPlace?.latitude && editingPlace?.longitude ? 
      { lat: editingPlace.latitude, lng: editingPlace.longitude } : 
      { lat: 50.0755, lng: 14.4378 })
  })

  const [locationQuery, setLocationQuery] = useState(editingPlace?.location_name || '')
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    dispatch(fetchFamilyGroups())
  }, [dispatch])

  useEffect(() => {
    if (groups.length > 0 && !formData.family_id) {
      setFormData(prev => ({ ...prev, family_id: groups[0].id }))
    }
  }, [groups, formData.family_id])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        locationInputRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json()
      const newSuggestions = data.features.map((feature: any) => ({
        display_name: feature.properties.name + (feature.properties.city ? `, ${feature.properties.city}` : '') + (feature.properties.country ? `, ${feature.properties.country}` : ''),
        lat: feature.geometry.coordinates[1].toString(),
        lon: feature.geometry.coordinates[0].toString(),
        place_id: feature.properties.osm_id
      }))
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    } catch (error) {
      console.error('Error searching location:', error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationQuery && locationQuery.length >= 3) {
        // Don't search if the current query exactly matches a previously selected location
        const isExactMatch = suggestions.some(s => s.display_name === locationQuery)
        if (!isExactMatch) {
          searchLocation(locationQuery)
        }
      } else if (locationQuery.length < 3) {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [locationQuery, suggestions])

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    setLocationQuery(suggestion.display_name)
    setFormData(prev => ({
      ...prev,
      location_name: suggestion.display_name, // Store the full location display name
      location: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon)
      }
    }))
    setSuggestions([])
    setShowSuggestions(false)
    // Clear suggestions completely to prevent showing selected item
    setTimeout(() => {
      setSuggestions([])
      setShowSuggestions(false)
    }, 0)
    // Optional: focus on the next form field (description or name)
    setTimeout(() => {
      const nameInput = document.getElementById('name')
      if (nameInput && !formData.name) {
        nameInput.focus()
      } else {
        const descInput = document.getElementById('description')
        if (descInput) {
          descInput.focus()
        }
      }
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.family_id) return

    setSubmitting(true)
    try {
      // Build practical_info object, ensuring we don't include undefined values
      const practicalInfo: any = {}
      
      // Only add entrance_fee if it's a valid number
      if (formData.practical_info.entrance_fee && !isNaN(parseFloat(formData.practical_info.entrance_fee))) {
        practicalInfo.entrance_fee = parseFloat(formData.practical_info.entrance_fee)
      }
      
      // Always include currency if provided
      if (formData.practical_info.currency && formData.practical_info.currency.trim()) {
        practicalInfo.currency = formData.practical_info.currency.trim()
      }
      
      // Always include parking (boolean)
      practicalInfo.parking = Boolean(formData.practical_info.parking)
      
      // Only add description if it has content
      if (formData.practical_info.description && formData.practical_info.description.trim()) {
        practicalInfo.description = formData.practical_info.description.trim()
      }

      console.log('Practical info being sent:', practicalInfo)

      const placeData: any = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        rating: formData.rating,
        location_name: formData.location_name, // Include the location display name
        practical_info: practicalInfo,
        family_id: formData.family_id,
        is_public: formData.is_public
      }

      // Only include location if we have valid coordinates
      if (formData.location && formData.location.lng && formData.location.lat) {
        placeData.location = `POINT(${formData.location.lng} ${formData.location.lat})`
      }

      if (editingPlace) {
        // Update existing place
        console.log('Updating place with data:', placeData)
        await dispatch(updatePlace({
          id: editingPlace.id,
          updates: placeData
        })).unwrap()
      } else {
        // Create new place
        await dispatch(createPlace({
          ...placeData,
          created_by: user.id
        })).unwrap()
      }

      onSuccess?.()
      onClose()
    } catch (error) {
      console.error(`Error ${editingPlace ? 'updating' : 'creating'} place:`, error)
    } finally {
      setSubmitting(false)
    }
  }

  const categories = [
    { value: 'monuments', label: `🏛️ ${t('monuments')}` },
    { value: 'natural_attractions', label: `🌲 ${t('naturalAttractions')}` },
    { value: 'other_attractions', label: `🎪 ${t('other')}` },
    { value: 'restaurants', label: `🍽️ ${t('restaurants')}` },
    { value: 'accommodation', label: `🏨 ${t('accommodation')}` }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Place Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          {t('placeName')} *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="Enter place name"
        />
      </div>

      {/* Location Search */}
      <div className="relative">
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          {t('location')} *
        </label>
        <input
          ref={locationInputRef}
          type="text"
          id="location"
          value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow for clicks
            setTimeout(() => {
              setShowSuggestions(false)
            }, 150)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder={t('searchLocation')}
        />
        
        {/* Location Suggestions */}
        {suggestions.length > 0 && showSuggestions && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto" 
            style={{ zIndex: 10002 }}
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleLocationSelect(suggestion)}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur from firing before click
                className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              >
                {suggestion.display_name}
              </button>
            ))}
          </div>
        )}
        
        {loading && (
          <div className="absolute right-3 top-10">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
          {t('category')} *
        </label>
        <select
          id="category"
          required
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
          {t('rating')}
        </label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
              className={`text-2xl ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
            >
              ★
            </button>
          ))}
          <span className="text-sm text-gray-600">({formData.rating}/5)</span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          {t('description')}
        </label>
        <textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="Describe this place..."
        />
      </div>

      {/* Practical Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="entrance_fee" className="block text-sm font-medium text-gray-700 mb-2">
            {t('entranceFee')}
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              id="entrance_fee"
              min="0"
              step="0.01"
              value={formData.practical_info.entrance_fee}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                practical_info: { ...prev.practical_info, entrance_fee: e.target.value }
              }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              placeholder="0.00"
            />
            <select
              value={formData.practical_info.currency}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                practical_info: { ...prev.practical_info, currency: e.target.value }
              }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="EUR">€ EUR</option>
              <option value="CZK">Kč CZK</option>
              <option value="USD">$ USD</option>
              <option value="GBP">£ GBP</option>
            </select>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="parking"
            checked={formData.practical_info.parking}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              practical_info: { ...prev.practical_info, parking: e.target.checked }
            }))}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="parking" className="ml-2 block text-sm text-gray-700">
            Parking Available
          </label>
        </div>
      </div>

      {/* Family Group */}
      <div>
        <label htmlFor="family_id" className="block text-sm font-medium text-gray-700 mb-2">
          Family Group *
        </label>
        <select
          id="family_id"
          required
          value={formData.family_id}
          onChange={(e) => setFormData(prev => ({ ...prev, family_id: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          <option value="">Select a family group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* Public/Private */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_private"
          checked={!formData.is_public}
          onChange={(e) => setFormData(prev => ({ ...prev, is_public: !e.target.checked }))}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700">
          {t('makePrivate')}
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t('loading') : (editingPlace ? t('updatePlace') : t('save'))}
        </button>
      </div>
    </form>
  )
}