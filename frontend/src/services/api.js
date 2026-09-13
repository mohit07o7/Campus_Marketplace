import axios from 'axios'

// ── Axios Instance ────────────────────────────────────────────────────────────
// All API calls go through this one object.
// Base URL uses VITE_API_URL in production, or defaults to '/api' (proxied by vite.config.js in dev)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request Interceptor ───────────────────────────────────────────────────────
// Before EVERY request, auto-attach the token from localStorage.
// This is why we don't need to manually add headers in every component.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ──────────────────────────────────────────────────────
// If any request returns 401 (Unauthorized / token expired), auto-logout.
// IMPORTANT: Skip auto-logout for auth routes — login/register legitimately
// return 401 for wrong credentials, so we must NOT redirect there.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes('/users/login') ||
                        error.config?.url?.includes('/users/register')
    const hasToken = !!localStorage.getItem('token')

    if (error.response?.status === 401 && !isAuthRoute && hasToken) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
