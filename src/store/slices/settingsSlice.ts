import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type Language = 'en' | 'cs'
export type Currency = 'EUR' | 'CZK' | 'USD' | 'GBP'

interface SettingsState {
  language: Language
  currency: Currency
}

const initialState: SettingsState = {
  language: (localStorage.getItem('language') as Language) || 'en',
  currency: (localStorage.getItem('currency') as Currency) || 'EUR'
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload
      localStorage.setItem('language', action.payload)
    },
    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.currency = action.payload
      localStorage.setItem('currency', action.payload)
    }
  }
})

export const { setLanguage, setCurrency } = settingsSlice.actions
export default settingsSlice.reducer