import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Components
import Navbar          from './components/Navbar'
import ProtectedRoute  from './components/ProtectedRoute'

// Pages
import Home            from './pages/Home'
import Login           from './pages/Login'
import Register        from './pages/Register'
import ListingDetails  from './pages/ListingDetails'
import CreateListing   from './pages/CreateListing'
import EditListing     from './pages/EditListing'
import MyListings      from './pages/MyListings'
import Profile         from './pages/Profile'
import Favorites       from './pages/Favorites'
import Messages        from './pages/Messages'

export default function App() {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* ── Public Routes ─────────────────────────────────── */}
          <Route path="/"           element={<Home />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/listing/:id" element={<ListingDetails />} />

          {/* ── Protected Routes ──────────────────────────────── */}
          <Route path="/create-listing"   element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
          <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
          <Route path="/my-listings"      element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
          <Route path="/profile"          element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/favorites"        element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/messages"         element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
