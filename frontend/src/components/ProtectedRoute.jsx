import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Wraps any route that requires the user to be logged in.
// If not logged in → redirect to /login and remember where they were trying to go.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location          = useLocation()

  // While checking localStorage, show nothing (prevents flash of login redirect)
  if (loading) return null

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
