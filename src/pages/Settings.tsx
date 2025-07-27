import { NavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { setLanguage, setCurrency, Language, Currency } from '@/store/slices/settingsSlice'
import { useTranslation } from '@/hooks/useTranslation'
import { Header } from '@/components/layout/Header'

export const Settings = () => {
  const dispatch = useAppDispatch()
  const { t, language } = useTranslation()
  const { currency } = useAppSelector((state) => state.settings)

  const handleLanguageChange = (newLanguage: Language) => {
    dispatch(setLanguage(newLanguage))
  }

  const handleCurrencyChange = (newCurrency: Currency) => {
    dispatch(setCurrency(newCurrency))
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">{t('settingsTitle')}</h1>
          <p className="text-gray-600">{t('manageSettings')}</p>
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
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            
            {/* Language Settings */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('language')}</h2>
              <p className="text-gray-600 mb-4">{t('selectLanguage')}</p>
              
              <div className="space-y-3">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    language === 'en' 
                      ? 'border-primary bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleLanguageChange('en')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🇺🇸</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{t('english')}</h3>
                        <p className="text-sm text-gray-600">English</p>
                      </div>
                    </div>
                    {language === 'en' && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    language === 'cs' 
                      ? 'border-primary bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleLanguageChange('cs')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🇨🇿</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{t('czech')}</h3>
                        <p className="text-sm text-gray-600">Čeština</p>
                      </div>
                    </div>
                    {language === 'cs' && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Currency Settings */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('currency')}</h2>
              <p className="text-gray-600 mb-4">{t('selectCurrency')}</p>
              
              <div className="space-y-3">
                {[
                  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
                  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
                  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
                  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' }
                ].map((curr) => (
                  <div 
                    key={curr.code}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      currency === curr.code 
                        ? 'border-primary bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleCurrencyChange(curr.code as Currency)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{curr.flag}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{curr.name}</h3>
                          <p className="text-sm text-gray-600">{curr.code} ({curr.symbol})</p>
                        </div>
                      </div>
                      {currency === curr.code && (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}