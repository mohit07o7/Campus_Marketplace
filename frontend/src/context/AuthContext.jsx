import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

// ── Create Context ────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ── Custom hook for easy access ───────────────────────────────────────────────
// Any component can call: const { user, login, logout } = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// ── Provider Component ────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [token,   setToken]   = useState(null)
  const [loading, setLoading] = useState(true) // true while we check localStorage

  // On first mount — restore session from localStorage if token exists
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  // ── login(email, password) ────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await api.post('/users/login', { email, password })
    _saveSession(data)
    return data
  }

  // ── register(name, email, password, Reg_No) ───────────────────────────────
  const register = async (name, email, password, Reg_No) => {
    const { data } = await api.post('/users/register', { name, email, password, Reg_No })
    _saveSession(data)
    return data
  }

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  // ── updateUserInContext(updatedUser) ──────────────────────────────────────
  // Called by Profile page after a successful PUT /api/users/profile
  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser }
    setUser(merged)
    localStorage.setItem('user', JSON.stringify(merged))
  }

  // ── Internal helper ────────────────────────────────────────────────────────
  const _saveSession = (data) => {
    const { token, ...profile } = data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(profile))
    setToken(token)
    setUser(profile)
  }

  const value = { user, token, loading, login, register, logout, updateUser }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
