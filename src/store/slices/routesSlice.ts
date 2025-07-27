import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type RouteTransport = Database['public']['Enums']['route_transport']
type RouteDifficulty = Database['public']['Enums']['route_difficulty']

interface RouteWithDetails {
  id: string
  name: string
  description: string | null
  created_by: string
  family_id: string
  is_public: boolean
  estimated_duration: number | null
  difficulty_level: RouteDifficulty | null
  transport_mode: RouteTransport | null
  total_distance: number | null
  created_at: string
  updated_at: string
  waypoint_count: number
}

interface RouteWaypoint {
  waypoint_id: string
  place_id: string
  place_name: string
  place_description: string | null
  place_category: Database['public']['Enums']['place_category']
  place_rating: number | null
  place_location_name: string | null
  latitude: number
  longitude: number
  order_index: number
  transport_to_next: RouteTransport | null
  notes: string | null
  estimated_time: number | null
}

interface RoutesState {
  routes: RouteWithDetails[]
  selectedRoute: RouteWithDetails | null
  routeWaypoints: RouteWaypoint[]
  loading: boolean
  error: string | null
  creating: boolean
}

const initialState: RoutesState = {
  routes: [],
  selectedRoute: null,
  routeWaypoints: [],
  loading: false,
  error: null,
  creating: false
}

// Fetch all routes
export const fetchRoutes = createAsyncThunk(
  'routes/fetchRoutes',
  async () => {
    const { data, error } = await supabase.rpc('get_routes_with_details')
    if (error) throw error
    return data as RouteWithDetails[]
  }
)

// Fetch waypoints for a specific route
export const fetchRouteWaypoints = createAsyncThunk(
  'routes/fetchRouteWaypoints',
  async (routeId: string) => {
    const { data, error } = await supabase.rpc('get_route_waypoints', { route_id: routeId })
    if (error) throw error
    return data as RouteWaypoint[]
  }
)

// Create a new route
export const createRoute = createAsyncThunk(
  'routes/createRoute',
  async (routeData: {
    name: string
    description?: string
    created_by: string
    family_id: string
    is_public: boolean
    estimated_duration?: number
    difficulty_level?: RouteDifficulty
    transport_mode?: RouteTransport
    total_distance?: number
  }) => {
    const { data, error } = await supabase
      .from('routes')
      .insert(routeData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

// Update an existing route
export const updateRoute = createAsyncThunk(
  'routes/updateRoute',
  async ({ id, updates }: { id: string; updates: any }) => {
    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

// Add waypoint to route
export const addWaypoint = createAsyncThunk(
  'routes/addWaypoint',
  async (waypointData: {
    route_id: string
    place_id: string
    order_index: number
    transport_to_next?: RouteTransport
    notes?: string
    estimated_time?: number
  }) => {
    const { data, error } = await supabase
      .from('route_places')
      .insert(waypointData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

// Update waypoint
export const updateWaypoint = createAsyncThunk(
  'routes/updateWaypoint',
  async ({ 
    route_id, 
    place_id, 
    updates 
  }: { 
    route_id: string
    place_id: string
    updates: {
      order_index?: number
      transport_to_next?: RouteTransport
      notes?: string
      estimated_time?: number
    }
  }) => {
    const { data, error } = await supabase
      .from('route_places')
      .update(updates)
      .eq('route_id', route_id)
      .eq('place_id', place_id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

// Remove waypoint from route
export const removeWaypoint = createAsyncThunk(
  'routes/removeWaypoint',
  async ({ route_id, place_id }: { route_id: string; place_id: string }) => {
    const { error } = await supabase
      .from('route_places')
      .delete()
      .eq('route_id', route_id)
      .eq('place_id', place_id)
    
    if (error) throw error
    return { route_id, place_id }
  }
)

// Reorder waypoints
export const reorderWaypoints = createAsyncThunk(
  'routes/reorderWaypoints',
  async ({ route_id, waypoints }: { 
    route_id: string
    waypoints: { place_id: string; order_index: number }[]
  }) => {
    // Update all waypoints with new order
    const promises = waypoints.map(({ place_id, order_index }) =>
      supabase
        .from('route_places')
        .update({ order_index })
        .eq('route_id', route_id)
        .eq('place_id', place_id)
    )
    
    const results = await Promise.all(promises)
    
    // Check if any updates failed
    for (const result of results) {
      if (result.error) throw result.error
    }
    
    return { route_id, waypoints }
  }
)

// Delete route
export const deleteRoute = createAsyncThunk(
  'routes/deleteRoute',
  async (id: string) => {
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return id
  }
)

const routesSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setSelectedRoute: (state, action: PayloadAction<RouteWithDetails | null>) => {
      state.selectedRoute = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setCreating: (state, action: PayloadAction<boolean>) => {
      state.creating = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch routes
      .addCase(fetchRoutes.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.loading = false
        state.routes = action.payload
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch routes'
      })
      
      // Fetch route waypoints
      .addCase(fetchRouteWaypoints.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRouteWaypoints.fulfilled, (state, action) => {
        state.loading = false
        state.routeWaypoints = action.payload
      })
      .addCase(fetchRouteWaypoints.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch waypoints'
      })
      
      // Create route
      .addCase(createRoute.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createRoute.fulfilled, (state, action) => {
        state.creating = false
        // Convert to RouteWithDetails by adding waypoint_count
        const routeWithDetails: RouteWithDetails = {
          ...action.payload,
          waypoint_count: 0
        }
        state.routes.unshift(routeWithDetails)
      })
      .addCase(createRoute.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create route'
      })
      
      // Update route
      .addCase(updateRoute.fulfilled, (state, action) => {
        const index = state.routes.findIndex(route => route.id === action.payload.id)
        if (index !== -1) {
          state.routes[index] = { ...state.routes[index], ...action.payload }
        }
        if (state.selectedRoute?.id === action.payload.id) {
          state.selectedRoute = { ...state.selectedRoute, ...action.payload }
        }
      })
      
      // Add waypoint
      .addCase(addWaypoint.fulfilled, () => {
        // Waypoints will be refetched after adding
      })
      
      // Remove waypoint
      .addCase(removeWaypoint.fulfilled, (state, action) => {
        state.routeWaypoints = state.routeWaypoints.filter(
          wp => !(wp.place_id === action.payload.place_id)
        )
      })
      
      // Reorder waypoints
      .addCase(reorderWaypoints.fulfilled, (state, action) => {
        // Update local state with new order
        const { waypoints } = action.payload
        waypoints.forEach(({ place_id, order_index }) => {
          const waypoint = state.routeWaypoints.find(wp => wp.place_id === place_id)
          if (waypoint) {
            waypoint.order_index = order_index
          }
        })
        // Sort waypoints by order_index
        state.routeWaypoints.sort((a, b) => a.order_index - b.order_index)
      })
      
      // Delete route
      .addCase(deleteRoute.fulfilled, (state, action) => {
        state.routes = state.routes.filter(route => route.id !== action.payload)
        if (state.selectedRoute?.id === action.payload) {
          state.selectedRoute = null
          state.routeWaypoints = []
        }
      })
  }
})

export const { setSelectedRoute, clearError, setCreating } = routesSlice.actions
export default routesSlice.reducer