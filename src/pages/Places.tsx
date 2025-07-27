import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchPlaces, setSelectedPlace } from '@/store/slices/placesSlice'
import { MapComponent } from '@/components/map/MapComponent'
import { PlaceCard } from '@/components/places/PlaceCard'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { PlaceForm } from '@/components/places/PlaceForm'
import { useTranslation } from '@/hooks/useTranslation'

export const Places = () => {
  const dispatch = useAppDispatch()
  const { places, loading } = useAppSelector((state) => state.places)
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [showPlaceForm, setShowPlaceForm] = useState(false)
  const [editingPlace, setEditingPlace] = useState<any>(null)
  const [mapClickCoordinates, setMapClickCoordinates] = useState<{ lat: number; lng: number } | undefined>()

  useEffect(() => {
    dispatch(fetchPlaces())
  }, [dispatch])

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    place.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handlePlaceSelect = (place: any) => {
    dispatch(setSelectedPlace(place))
  }

  const handleMapClick = (lat: number, lng: number) => {
    setMapClickCoordinates({ lat, lng })
    setShowPlaceForm(true)
  }

  const handlePlaceCreated = async () => {
    await dispatch(fetchPlaces())
    setMapClickCoordinates(undefined)
    setEditingPlace(null)
    // Optional: Auto-select the newly created place
    // This would require the createPlace action to return the created place
  }

  const handleEditPlace = (place: any) => {
    setEditingPlace(place)
    setShowPlaceForm(true)
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('places')}</h1>
          <p className="text-gray-600">Discover and manage your travel destinations</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          
          {/* Places List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('places')} ({filteredPlaces.length})
                </h2>
                <button 
                  onClick={() => setShowPlaceForm(true)}
                  className="bg-primary hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  {t('addPlace')}
                </button>
              </div>
              
              <input
                type="text"
                placeholder={t('searchLocation')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="overflow-y-auto h-[calc(100%-8rem)]">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredPlaces.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">{t('noPlacesYet')}</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-primary hover:text-blue-600 text-sm mt-2"
                        >
                          {t('cancel')}
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredPlaces.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        onClick={() => handlePlaceSelect(place)}
                        onEdit={() => handleEditPlace(place)}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-full">
              <MapComponent onMapClick={handleMapClick} />
            </div>
          </div>
        </div>
      </div>

      {/* Add Place Modal */}
      <Modal
        isOpen={showPlaceForm}
        onClose={() => {
          setShowPlaceForm(false)
          setMapClickCoordinates(undefined)
          setEditingPlace(null)
        }}
        title={editingPlace ? t('editPlace') : t('addNewPlace')}
        size="lg"
      >
        <PlaceForm
          onClose={() => {
            setShowPlaceForm(false)
            setMapClickCoordinates(undefined)
            setEditingPlace(null)
          }}
          onSuccess={handlePlaceCreated}
          initialCoordinates={mapClickCoordinates}
          editingPlace={editingPlace}
        />
      </Modal>
    </div>
  )
}