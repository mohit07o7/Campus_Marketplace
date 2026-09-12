import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowLeft, ShoppingBag, AlertCircle, Check } from 'lucide-react'
import api from '../services/api'
import ListingCard from '../components/ListingCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import './Favorites.css'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/favorites')
      // Ensure each item has isFavorited: true
      const mapped = (data.listings || []).map((item) => ({
        ...item,
        isFavorited: true
      }))
      setFavorites(mapped)
    } catch (err) {
      console.error('Failed to load favorites:', err)
      setError(err.response?.data?.message || 'Could not load your saved items.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // Handle when heart is un-toggled from a ListingCard
  const handleFavoriteToggle = (listingId, isFav) => {
    if (!isFav) {
      setFavorites((prev) => prev.filter((item) => item._id !== listingId))
      showToast('Removed from saved wishlist')
    }
  }

  return (
    <div className="favorites-container page-enter">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="favorites-header">
        <div>
          <h1>
            <Heart size={28} color="var(--accent-rose)" fill="var(--accent-rose)" /> Saved Wishlist
            {!loading && favorites.length > 0 && (
              <span className="favorites-count-badge">
                {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </h1>
          <p>Keep track of campus items you are interested in buying.</p>
        </div>

        <Link to="/" className="btn btn-secondary">
          <ArrowLeft size={16} /> Browse More Items
        </Link>
      </div>

      {/* ── Content ───────────────────────────────────────────── */}
      {loading ? (
        <div className="favorites-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="glass-card empty-favorites-card">
          <AlertCircle size={48} color="var(--danger)" />
          <h3>Error Loading Saved Items</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchFavorites}>
            Try Again
          </button>
        </div>
      ) : favorites.length === 0 ? (
        /* ── Empty State ───────────────────────────────────────── */
        <div className="glass-card empty-favorites-card">
          <div className="empty-heart-icon">
            <Heart size={36} fill="currentColor" />
          </div>
          <h3>Your wishlist is empty</h3>
          <p>
            Spot an item you like while browsing? Click the heart icon on any card to save it here for quick access later.
          </p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            <ShoppingBag size={18} /> Explore Marketplace
          </Link>
        </div>
      ) : (
        /* ── Favorites Grid ────────────────────────────────────── */
        <div className="favorites-grid">
          {favorites.map((item) => (
            <ListingCard
              key={item._id}
              listing={item}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </div>
      )}

      {/* ── Toast Feedback ─────────────────────────────────────── */}
      {toastMessage && (
        <div className="toast-notice">
          <Check size={16} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
