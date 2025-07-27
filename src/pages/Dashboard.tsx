import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchPlaces, setSelectedPlace } from '@/store/slices/placesSlice'
import { fetchFamilyGroups } from '@/store/slices/familySlice'
import { fetchRoutes } from '@/store/slices/routesSlice'
import { MapComponent } from '@/components/map/MapComponent'
import { PlaceCard } from '@/components/places/PlaceCard'
import { Navigation } from '@/components/layout/Navigation'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { PlaceForm } from '@/components/places/PlaceForm'
import { FamilyGroupForm } from '@/components/family/FamilyGroupForm'
import { RouteBuilder } from '@/components/routes/RouteBuilder'
import { useTranslation } from '@/hooks/useTranslation'

export const Dashboard = () => {
  const dispatch = useAppDispatch()
  const { places, loading } = useAppSelector((state) => state.places)
  const { groups } = useAppSelector((state) => state.family)
  const { t } = useTranslation()
  const [showPlaceForm, setShowPlaceForm] = useState(false)
  const [showRouteForm, setShowRouteForm] = useState(false)
  const [showFamilyForm, setShowFamilyForm] = useState(false)
  const [editingPlace, setEditingPlace] = useState<any>(null)

  useEffect(() => {
    dispatch(fetchPlaces())
    dispatch(fetchFamilyGroups())
    dispatch(fetchRoutes())
  }, [dispatch])

  const handlePlaceCreated = () => {
    dispatch(fetchPlaces())
    setEditingPlace(null)
  }

  const handleEditPlace = (place: any) => {
    setEditingPlace(place)
    setShowPlaceForm(true)
  }

  const handleFamilyGroupCreated = () => {
    dispatch(fetchFamilyGroups())
  }

  const handleRouteCreated = () => {
    dispatch(fetchRoutes())
    setShowRouteForm(false)
  }

  const handlePlaceSelect = (place: any) => {
    dispatch(setSelectedPlace(place))
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px] h-[calc(100vh-8rem)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard')}</h2>
            <Navigation />

            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">{t('quickActions')}</h3>
              <div className="space-y-2">
                {groups.length === 0 ? (
                  <button 
                    onClick={() => setShowFamilyForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {t('createFamilyGroup')}
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowPlaceForm(true)}
                    className="w-full bg-primary hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {t('addPlace')}
                  </button>
                )}
                <button 
                  onClick={() => setShowRouteForm(true)}
                  className="w-full bg-secondary hover:bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {t('createRoute')}
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">{t('recentPlaces')}</h3>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {places.slice(0, 5).map((place) => (
                    <PlaceCard 
                      key={place.id} 
                      place={place} 
                      onClick={() => handlePlaceSelect(place)}
                      onEdit={() => handleEditPlace(place)}
                    />
                  ))}
                  {places.length === 0 && (
                    <p className="text-sm text-gray-500">{t('noPlacesYet')}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Map Area */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm overflow-hidden">
            <MapComponent />
          </div>
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={showPlaceForm}
        onClose={() => {
          setShowPlaceForm(false)
          setEditingPlace(null)
        }}
        title={editingPlace ? t('editPlace') : t('addNewPlace')}
        size="lg"
      >
        <PlaceForm
          onClose={() => {
            setShowPlaceForm(false)
            setEditingPlace(null)
          }}
          onSuccess={handlePlaceCreated}
          editingPlace={editingPlace}
        />
      </Modal>

      <Modal
        isOpen={showRouteForm}
        onClose={() => setShowRouteForm(false)}
        title={t('createRoute')}
        size="full"
      >
        <RouteBuilder
          onRouteCreated={handleRouteCreated}
          onCancel={() => setShowRouteForm(false)}
        />
      </Modal>

      <Modal
        isOpen={showFamilyForm}
        onClose={() => setShowFamilyForm(false)}
        title={t('createFamilyGroupTitle')}
        size="md"
      >
        <FamilyGroupForm
          onClose={() => setShowFamilyForm(false)}
          onSuccess={handleFamilyGroupCreated}
        />
      </Modal>
    </div>
  )
}