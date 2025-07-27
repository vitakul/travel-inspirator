import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { supabase, type Tables } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Tables<'users'> | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  session: null,
  profile: null,
  loading: true,
  error: null
}

// Async thunks
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }
)

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }: { email: string; password: string; name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    if (error) throw error
    return data
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
)

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', updates.id!)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ user: User | null; session: Session | null }>) => {
      state.user = action.payload.user
      state.session = action.payload.session
      state.loading = false
    },
    setProfile: (state, action: PayloadAction<Tables<'users'> | null>) => {
      state.profile = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Sign in
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Sign in failed'
      })
      
      // Sign up
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Sign up failed'
      })
      
      // Sign out
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
        state.session = null
        state.profile = null
        state.loading = false
      })
      
      // Fetch profile
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      
      // Update profile
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
  }
})

export const { setAuth, setProfile, setLoading, clearError } = authSlice.actions
export default authSlice.reducer