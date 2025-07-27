import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Dashboard } from '@/pages/Dashboard'
import { Places } from '@/pages/Places'
import { Routes as RoutesPage } from '@/pages/Routes'
import { Family } from '@/pages/Family'
import { Settings } from '@/pages/Settings'

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/places" element={
            <ProtectedRoute>
              <Places />
            </ProtectedRoute>
          } />
          <Route path="/routes" element={
            <ProtectedRoute>
              <RoutesPage />
            </ProtectedRoute>
          } />
          <Route path="/family" element={
            <ProtectedRoute>
              <Family />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App