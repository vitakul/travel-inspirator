import { useState } from 'react'
import { useAppDispatch } from '@/hooks/redux'
import { createFamilyGroup } from '@/store/slices/familySlice'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'

interface FamilyGroupFormProps {
  onClose: () => void
  onSuccess?: () => void
}

export const FamilyGroupForm = ({ onClose, onSuccess }: FamilyGroupFormProps) => {
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const { t } = useTranslation()
  
  const [formData, setFormData] = useState({
    name: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.name.trim()) return

    setSubmitting(true)
    setError('')
    
    try {
      await dispatch(createFamilyGroup({
        name: formData.name.trim(),
        adminId: user.id
      })).unwrap()

      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Error creating family group:', error)
      setError(error.message || 'Failed to create family group')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          {t('familyGroupName')} *
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder={t('enterGroupName')}
          maxLength={50}
        />
        <p className="mt-1 text-xs text-gray-500">
          Choose a name that represents your family or travel group (max 50 characters)
        </p>
      </div>

      {/* Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              About Family Groups
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="space-y-1">
                <li>• You'll be the administrator of this group</li>
                <li>• You can invite up to 4 more family members</li>
                <li>• All group members can add places and create routes</li>
                <li>• You control whether content is public or private</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting || !formData.name.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-blue-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? t('loading') : t('createFamilyGroup')}
        </button>
      </div>
    </form>
  )
}