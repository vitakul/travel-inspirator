import type { Database } from '@/integrations/supabase/types'

type PlaceCategory = Database['public']['Enums']['place_category']

// Map database category values to translation keys
export const categoryToTranslationKey = (category: PlaceCategory | null): string => {
  if (!category) return 'other'
  
  switch (category) {
    case 'monuments':
      return 'monuments'
    case 'restaurants':
      return 'restaurants'
    case 'accommodation':
      return 'accommodation'
    case 'natural_attractions':
      return 'naturalAttractions'
    case 'other_attractions':
    default:
      return 'other'
  }
}