import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './redux'
import { supabase } from '@/integrations/supabase/client'
import { setAuth, fetchProfile } from '@/store/slices/authSlice'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const { user, session, profile, loading, error } = useAppSelector((state) => state.auth)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setAuth({ user: session?.user ?? null, session }))
      
      if (session?.user) {
        dispatch(fetchProfile(session.user.id))
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      dispatch(setAuth({ user: session?.user ?? null, session }))
      
      if (session?.user) {
        dispatch(fetchProfile(session.user.id))
      }
    })

    return () => subscription.unsubscribe()
  }, [dispatch])

  return {
    user,
    session,
    profile,
    loading,
    error,
    isAuthenticated: !!user
  }
}