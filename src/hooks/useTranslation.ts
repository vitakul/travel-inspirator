import { useAppSelector } from './redux'
import { translations, TranslationKey } from '@/i18n/translations'

export const useTranslation = () => {
  const language = useAppSelector((state) => state.settings.language)
  
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }
  
  return { t, language }
}