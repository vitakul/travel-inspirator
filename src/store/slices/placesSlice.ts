import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

export interface Place {
  id: string
  name: string
  description: string | null
  category: Database['public']['Enums']['place_category'] | null
  rating: number | null
  location: any
  location_name: string | null
  is_public: boolean
  created_by: string
  family_id: string
  created_at: string
  updated_at: string
  practical_info: any
  latitude?: number
  longitude?: number
}

interface PlacesState {
  places: Place[]
  selectedPlace: Place | null
  loading: boolean
  error: string | null
  filters: {
    category: string | null
    rating: number | null
    isPublic: boolean | null
    familyId: string | null
  }
}

const initialState: PlacesState = {
  places: [],
  selectedPlace: null,
  loading: false,
  error: null,
  filters: {
    category: null,
    rating: null,
    isPublic: null,
    familyId: null
  }
}

export const fetchPlaces = createAsyncThunk(
  'places/fetchPlaces',
  async (filters?: Partial<PlacesState['filters']>) => {
    // Use the RPC function to get places with coordinates
    const { data, error } = await supabase.rpc('get_places_with_coordinates')

    if (error) throw error

    // Apply client-side filters if any
    let filteredPlaces = data || []

    if (filters?.category) {
      filteredPlaces = filteredPlaces.filter(place => place.category === filters.category)
    }
    if (filters?.rating) {
      filteredPlaces = filteredPlaces.filter(place => place.rating >= filters.rating!)
    }
    if (filters?.isPublic !== undefined && filters.isPublic !== null) {
      filteredPlaces = filteredPlaces.filter(place => place.is_public === filters.isPublic)
    }
    if (filters?.familyId) {
      filteredPlaces = filteredPlaces.filter(place => place.family_id === filters.familyId)
    }

    return filteredPlaces
  }
)

export const createPlace = createAsyncThunk(
  'places/createPlace',
  async (placeData: any) => {
    const { data, error } = await supabase
      .from('places')
      .insert(placeData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

export const updatePlace = createAsyncThunk(
  'places/updatePlace',
  async ({ id, updates }: { id: string; updates: any }) => {
    const { data, error } = await supabase
      .from('places')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

export const deletePlace = createAsyncThunk(
  'places/deletePlace',
  async (id: string) => {
    const { error } = await supabase
      .from('places')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return id
  }
)

const placesSlice = createSlice({
  name: 'places',
  initialState,
  reducers: {
    setSelectedPlace: (state, action: PayloadAction<any>) => {
      state.selectedPlace = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<PlacesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch places
      .addCase(fetchPlaces.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPlaces.fulfilled, (state, action) => {
        state.loading = false
        // Map the RPC response to Place interface
        state.places = action.payload.map((place: any) => ({
          ...place,
          location: null // RPC doesn't return location field, only lat/lng
        })) as Place[]
      })
      .addCase(fetchPlaces.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch places'
      })
      
      // Create place
      .addCase(createPlace.fulfilled, (state, action) => {
        state.places.unshift(action.payload)
      })
      
      // Update place
      .addCase(updatePlace.fulfilled, (state, action) => {
        const index = state.places.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.places[index] = action.payload
        }
        if (state.selectedPlace?.id === action.payload.id) {
          state.selectedPlace = action.payload
        }
      })
      
      // Delete place
      .addCase(deletePlace.fulfilled, (state, action) => {
        state.places = state.places.filter(p => p.id !== action.payload)
        if (state.selectedPlace?.id === action.payload) {
          state.selectedPlace = null
        }
      })
  }
})

export const { setSelectedPlace, setFilters, clearFilters, clearError } = placesSlice.actions
export default placesSlice.reducer