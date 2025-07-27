// Country code to flag emoji mapping
const countryFlags: Record<string, string> = {
  // Europe
  'CZ': '🇨🇿', 'CZE': '🇨🇿', // Czech Republic
  'DE': '🇩🇪', 'DEU': '🇩🇪', // Germany
  'AT': '🇦🇹', 'AUT': '🇦🇹', // Austria
  'SK': '🇸🇰', 'SVK': '🇸🇰', // Slovakia
  'PL': '🇵🇱', 'POL': '🇵🇱', // Poland
  'HU': '🇭🇺', 'HUN': '🇭🇺', // Hungary
  'IT': '🇮🇹', 'ITA': '🇮🇹', // Italy
  'FR': '🇫🇷', 'FRA': '🇫🇷', // France
  'ES': '🇪🇸', 'ESP': '🇪🇸', // Spain
  'PT': '🇵🇹', 'PRT': '🇵🇹', // Portugal
  'GB': '🇬🇧', 'GBR': '🇬🇧', // United Kingdom
  'IE': '🇮🇪', 'IRL': '🇮🇪', // Ireland
  'NL': '🇳🇱', 'NLD': '🇳🇱', // Netherlands
  'BE': '🇧🇪', 'BEL': '🇧🇪', // Belgium
  'CH': '🇨🇭', 'CHE': '🇨🇭', // Switzerland
  'NO': '🇳🇴', 'NOR': '🇳🇴', // Norway
  'SE': '🇸🇪', 'SWE': '🇸🇪', // Sweden
  'DK': '🇩🇰', 'DNK': '🇩🇰', // Denmark
  'FI': '🇫🇮', 'FIN': '🇫🇮', // Finland
  'IS': '🇮🇸', 'ISL': '🇮🇸', // Iceland
  'GR': '🇬🇷', 'GRC': '🇬🇷', // Greece
  'HR': '🇭🇷', 'HRV': '🇭🇷', // Croatia
  'SI': '🇸🇮', 'SVN': '🇸🇮', // Slovenia
  'RS': '🇷🇸', 'SRB': '🇷🇸', // Serbia
  'BG': '🇧🇬', 'BGR': '🇧🇬', // Bulgaria
  'RO': '🇷🇴', 'ROU': '🇷🇴', // Romania
  'LT': '🇱🇹', 'LTU': '🇱🇹', // Lithuania
  'LV': '🇱🇻', 'LVA': '🇱🇻', // Latvia
  'EE': '🇪🇪', 'EST': '🇪🇪', // Estonia
  'RU': '🇷🇺', 'RUS': '🇷🇺', // Russia
  'UA': '🇺🇦', 'UKR': '🇺🇦', // Ukraine
  
  // North America
  'US': '🇺🇸', 'USA': '🇺🇸', // United States
  'CA': '🇨🇦', 'CAN': '🇨🇦', // Canada
  'MX': '🇲🇽', 'MEX': '🇲🇽', // Mexico
  
  // Asia
  'JP': '🇯🇵', 'JPN': '🇯🇵', // Japan
  'CN': '🇨🇳', 'CHN': '🇨🇳', // China
  'KR': '🇰🇷', 'KOR': '🇰🇷', // South Korea
  'IN': '🇮🇳', 'IND': '🇮🇳', // India
  'TH': '🇹🇭', 'THA': '🇹🇭', // Thailand
  'VN': '🇻🇳', 'VNM': '🇻🇳', // Vietnam
  'SG': '🇸🇬', 'SGP': '🇸🇬', // Singapore
  'MY': '🇲🇾', 'MYS': '🇲🇾', // Malaysia
  'ID': '🇮🇩', 'IDN': '🇮🇩', // Indonesia
  'PH': '🇵🇭', 'PHL': '🇵🇭', // Philippines
  'TR': '🇹🇷', 'TUR': '🇹🇷', // Turkey
  'IL': '🇮🇱', 'ISR': '🇮🇱', // Israel
  'AE': '🇦🇪', 'ARE': '🇦🇪', // UAE
  
  // Oceania
  'AU': '🇦🇺', 'AUS': '🇦🇺', // Australia
  'NZ': '🇳🇿', 'NZL': '🇳🇿', // New Zealand
  
  // Africa
  'ZA': '🇿🇦', 'ZAF': '🇿🇦', // South Africa
  'EG': '🇪🇬', 'EGY': '🇪🇬', // Egypt
  'MA': '🇲🇦', 'MAR': '🇲🇦', // Morocco
  'KE': '🇰🇪', 'KEN': '🇰🇪', // Kenya
  'TZ': '🇹🇿', 'TZA': '🇹🇿', // Tanzania
  
  // South America
  'BR': '🇧🇷', 'BRA': '🇧🇷', // Brazil
  'AR': '🇦🇷', 'ARG': '🇦🇷', // Argentina
  'CL': '🇨🇱', 'CHL': '🇨🇱', // Chile
  'PE': '🇵🇪', 'PER': '🇵🇪', // Peru
  'CO': '🇨🇴', 'COL': '🇨🇴', // Colombia
}

// Common country name variations to country code mapping
const countryNameToCode: Record<string, string> = {
  // Czech Republic variations
  'czech republic': 'CZ',
  'czechia': 'CZ',
  'czech': 'CZ',
  'česká republika': 'CZ',
  'česko': 'CZ',
  
  // Germany variations
  'germany': 'DE',
  'deutschland': 'DE',
  'německo': 'DE',
  
  // Austria variations
  'austria': 'AT',
  'österreich': 'AT',
  'rakousko': 'AT',
  
  // Slovakia variations
  'slovakia': 'SK',
  'slovensko': 'SK',
  
  // Poland variations
  'poland': 'PL',
  'polska': 'PL',
  'polsko': 'PL',
  
  // Hungary variations
  'hungary': 'HU',
  'magyarország': 'HU',
  'maďarsko': 'HU',
  
  // Italy variations
  'italy': 'IT',
  'italia': 'IT',
  'itálie': 'IT',
  
  // France variations
  'france': 'FR',
  'francie': 'FR',
  
  // Spain variations
  'spain': 'ES',
  'españa': 'ES',
  'španělsko': 'ES',
  
  // United Kingdom variations
  'united kingdom': 'GB',
  'uk': 'GB',
  'britain': 'GB',
  'great britain': 'GB',
  'velká británie': 'GB',
  'spojené království': 'GB',
  
  // United States variations
  'united states': 'US',
  'usa': 'US',
  'america': 'US',
  'spojené státy': 'US',
  
  // Add more as needed
}

export function getCountryFlag(location: string): string {
  if (!location) return '🌍' // Default world flag
  
  const locationLower = location.toLowerCase()
  console.log('Detecting country for location:', location) // Debug logging
  
  // First try to find country code directly (2-3 letter codes)
  const words = locationLower.split(/[,\s\-\(\)]+/).filter(w => w.length > 0)
  for (const word of words) {
    const upperWord = word.toUpperCase()
    if (countryFlags[upperWord]) {
      console.log('Found country by code:', upperWord, countryFlags[upperWord])
      return countryFlags[upperWord]
    }
  }
  
  // Try country name variations (prioritize longer matches first)
  const countryEntries = Object.entries(countryNameToCode).sort((a, b) => b[0].length - a[0].length)
  for (const [name, code] of countryEntries) {
    if (locationLower.includes(name)) {
      console.log('Found country by name:', name, '→', code, countryFlags[code])
      return countryFlags[code] || '🌍'
    }
  }
  
  // Try to extract country from common location formats
  // "City, Country" or "City, State, Country" or "Place, City, Country"
  const parts = location.split(',').map(p => p.trim().toLowerCase())
  if (parts.length >= 2) {
    // Check from last to first part (most likely to be country)
    for (let i = parts.length - 1; i >= Math.max(0, parts.length - 3); i--) {
      const part = parts[i]
      for (const [name, code] of countryEntries) {
        if (part.includes(name)) {
          console.log('Found country in part', i, ':', name, '→', code, countryFlags[code])
          return countryFlags[code] || '🌍'
        }
      }
    }
  }
  
  // Special handling for common place name patterns
  if (locationLower.includes('prague') || locationLower.includes('praha')) {
    console.log('Detected Prague → Czech Republic')
    return '🇨🇿'
  }
  if (locationLower.includes('warsaw') || locationLower.includes('warszawa') || locationLower.includes('krakow') || locationLower.includes('kraków')) {
    console.log('Detected Polish city → Poland')
    return '🇵🇱'
  }
  if (locationLower.includes('vienna') || locationLower.includes('wien')) {
    console.log('Detected Vienna → Austria')
    return '🇦🇹'
  }
  if (locationLower.includes('budapest')) {
    console.log('Detected Budapest → Hungary')
    return '🇭🇺'
  }
  if (locationLower.includes('berlin') || locationLower.includes('munich') || locationLower.includes('münchen')) {
    console.log('Detected German city → Germany')
    return '🇩🇪'
  }
  
  console.log('No country detected for:', location)
  return '🌍' // Default world flag if no country detected
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'EUR': '€',
    'CZK': 'Kč',
    'USD': '$',
    'GBP': '£'
  }
  return symbols[currency] || currency
}