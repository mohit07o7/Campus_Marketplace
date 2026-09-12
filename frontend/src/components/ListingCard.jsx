import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Tag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import './ListingCard.css'

export default function ListingCard({ listing, onFavoriteToggle }) {
  const { user } = useAuth()
  const [favorited, setFavorited] = useState(listing.isFavorited || false)
  const [favLoading, setFavLoading] = useState(false)

  const {
    _id, title, price, category, images = [], sellerId,
    description, createdAt
  } = listing

  const imageUrl = images[0] || null
  const sellerName = sellerId?.name || 'Unknown seller'
  const timeAgo = getTimeAgo(createdAt)

  async function handleFavorite(e) {
    e.preventDefault()  // Don't navigate to listing
    e.stopPropagation()
    if (!user) return
    setFavLoading(true)
    // Optimistic update — toggle immediately
    setFavorited(f => !f)
    try {
      await api.post(`/favorites/${_id}`)
      onFavoriteToggle?.(_id, !favorited)
    } catch {
      // Revert on failure
      setFavorited(f => !f)
    } finally {
      setFavLoading(false)
    }
  }

  return (
    <Link to={`/listing/${_id}`} className="listing-card glass-card" aria-label={title}>
      {/* Image */}
      <div className="card-image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="card-image" loading="lazy" />
        ) : (
          <div className="card-image-placeholder">
            <Tag size={32} />
          </div>
        )}

        {/* Category badge */}
        <span className="card-category badge">{category}</span>

        {/* Favorite button (only if logged in) */}
        {user && (
          <button
            className={`card-fav-btn ${favorited ? 'favorited' : ''}`}
            onClick={handleFavorite}
            disabled={favLoading}
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-desc">{description}</p>

        <div className="card-footer">
          <span className="card-price">₹{price.toLocaleString('en-IN')}</span>
          <div className="card-meta">
            <span className="card-seller">
              <div className="seller-avatar">{sellerName[0]?.toUpperCase()}</div>
              {sellerName.split(' ')[0]}
            </span>
            <span className="card-time">{timeAgo}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function getTimeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (days > 0)  return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${mins}m ago`
}
