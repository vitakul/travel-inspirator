import { useAuth } from '@/hooks/useAuth'
import { AuthForm } from './AuthForm'
import { useState } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth()
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(mode => mode === 'signin' ? 'signup' : 'signin')} 
      />
    )
  }

  return <>{children}</>
}