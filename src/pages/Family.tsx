import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { fetchFamilyGroups } from '@/store/slices/familySlice'
import { Header } from '@/components/layout/Header'
import { Modal } from '@/components/ui/Modal'
import { FamilyGroupForm } from '@/components/family/FamilyGroupForm'
import { useTranslation } from '@/hooks/useTranslation'

export const Family = () => {
  const dispatch = useAppDispatch()
  const { groups, loading } = useAppSelector((state) => state.family)
  const { t } = useTranslation()
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    dispatch(fetchFamilyGroups())
  }, [dispatch])

  const handleGroupCreated = () => {
    dispatch(fetchFamilyGroups())
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('familyGroups')}</h1>
          <p className="text-gray-600">{t('manageFamilyGroups')}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Family Groups List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{t('yourFamilyGroups')}</h2>
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                >
                  {t('createGroup')}
                </button>
              </div>
            </div>

            <div className="p-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noFamilyGroups')}</h3>
                  <p className="text-gray-600 mb-4">{t('createFirstFamilyGroup')}</p>
                  <button 
                    onClick={() => setShowCreateForm(true)}
                    className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    {t('createFamilyGroup')}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-600">
                            {t('created')} {new Date(group.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {t('admin')}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Group Details / Members */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">{t('groupMembers')}</h2>
            </div>
            
            <div className="p-4">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('selectFamilyGroup')}</h3>
                <p className="text-gray-600">{t('chooseFamilyGroup')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">{t('recentActivity')}</h2>
          </div>
          
          <div className="p-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t('activityFeed')}</h3>
              <p className="text-gray-600">{t('familyActivity')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Family Group Modal */}
      <Modal
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        title={t('createFamilyGroupTitle')}
        size="md"
      >
        <FamilyGroupForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleGroupCreated}
        />
      </Modal>
    </div>
  )
}