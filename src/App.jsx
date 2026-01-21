import React from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Login from './components/Login'
import ClientView from './components/ClientView'
import AdminView from './components/AdminView'

// Loading spinner
const LoadingScreen = () => (
  <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white/60">Cargando...</p>
    </div>
  </div>
)

// Main App Content
const AppContent = () => {
  const { user, profile, loading, isAdmin, isClient } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  // No autenticado → mostrar login
  if (!user || !profile) {
    return <Login />
  }

  // Admin → mostrar panel de administración
  if (isAdmin) {
    return <AdminView />
  }

  // Cliente → mostrar su panel
  if (isClient) {
    return <ClientView />
  }

  // Fallback
  return <Login />
}

// App wrapper con AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
