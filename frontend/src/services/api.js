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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
