import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Tag,
  Clock,
  ShieldCheck,
  Check,
  Edit3,
  AlertCircle,
  Send,
  X,
  Sparkles
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { PROTOTYPE_LISTINGS } from '../services/mockListings'
import './ListingDetails.css'

export default function ListingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  // State
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favLoading, setFavLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Message modal state
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageSentSuccess, setMessageSentSuccess] = useState(false)

  // Fetch listing and favorite status
  useEffect(() => {
    let isMounted = true

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // If it's a prototype card, fetch from local mock data directly
        if (id && id.startsWith('proto-')) {
          const protoItem = PROTOTYPE_LISTINGS.find((p) => p._id === id)
          if (protoItem) {
            setListing(protoItem)
            setMessageText(`Hi ${protoItem.sellerId?.name || 'there'}, is "${protoItem.title}" still available?`)
            setLoading(false)
            return
          }
        }

        const { data: listingData } = await api.get(`/listings/${id}`)
        if (!isMounted) return
        setListing(listingData)

        // Set default inquiry text
        setMessageText(`Hi ${listingData.sellerId?.name || 'there'}, is "${listingData.title}" still available?`)

        // Check if user has this item favorited
        if (user) {
          try {
            const { data: favData } = await api.get('/favorites')
            if (isMounted && favData.listings) {
              const favorited = favData.listings.some(
                (f) => (f._id || f) === listingData._id
              )
              setIsFavorited(favorited)
            }
          } catch {
            // Silently ignore favorites fetch failure
          }
        }
      } catch (err) {
        if (!isMounted) return
        // Check prototype fallback
        const protoFallback = PROTOTYPE_LISTINGS.find((p) => p._id === id)
        if (protoFallback) {
          setListing(protoFallback)
          setMessageText(`Hi ${protoFallback.sellerId?.name || 'there'}, is "${protoFallback.title}" still available?`)
        } else {
          console.error('Failed to load listing:', err)
          setError(err.response?.data?.message || 'Listing not found or server error.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [id, user])

  // Keyboard navigation for image gallery
  const images = listing?.images && listing.images.length > 0 ? listing.images : []
  const hasMultipleImages = images.length > 1

  const handlePrevImage = useCallback(() => {
    if (!hasMultipleImages) return
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }, [hasMultipleImages, images.length])

  const handleNextImage = useCallback(() => {
    if (!hasMultipleImages) return
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }, [hasMultipleImages, images.length])

  useEffect(() => {
    function handleKeyDown(e) {
      if (messageModalOpen) return
      if (e.key === 'ArrowLeft') handlePrevImage()
      if (e.key === 'ArrowRight') handleNextImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePrevImage, handleNextImage, messageModalOpen])

  // Toast trigger helper
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2800)
  }

  // Share handler
  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        showToast('Link copied to clipboard!')
      } else {
        showToast('Page URL ready to share!')
      }
    } catch {
      showToast('Could not copy link automatically.')
    }
  }

  // Favorite toggle handler with optimistic update
  const handleToggleFavorite = async () => {
    if (!user) {
      navigate('/login', { state: { from: location } })
      return
    }

    setFavLoading(true)
    const prev = isFavorited
    setIsFavorited(!prev) // optimistic

    try {
      const { data } = await api.post(`/favorites/${listing._id}`)
      setIsFavorited(data.favorited)
      showToast(data.favorited ? 'Added to favorites!' : 'Removed from favorites')
    } catch (err) {
      setIsFavorited(prev) // revert on error
      showToast('Could not update favorites')
    } finally {
      setFavLoading(false)
    }
  }

  // Quick message send handler
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim()) return

    const sellerId = listing.sellerId?._id || listing.sellerId
    if (!sellerId) return

    setSendingMessage(true)
    try {
      await api.post('/messages', {
        receiverId: sellerId,
        listingId: listing._id,
        content: messageText.trim()
      })
      setMessageSentSuccess(true)
      setTimeout(() => {
        setMessageModalOpen(false)
        setMessageSentSuccess(false)
        navigate('/messages')
      }, 1200)
    } catch (err) {
      console.error('Failed to send message:', err)
      showToast(err.response?.data?.message || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  // Check if current user is the listing owner
  const sellerIdStr = listing?.sellerId?._id || listing?.sellerId
  const isOwner = user && sellerIdStr && user._id === sellerIdStr

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="details-container page-enter">
        <div className="details-nav-bar">
          <div className="skeleton-box" style={{ width: 140, height: 38 }} />
          <div className="skeleton-box" style={{ width: 90, height: 38 }} />
        </div>
        <div className="details-skeleton-grid">
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div className="skeleton-box" style={{ width: '100%', aspectRatio: '4/3' }} />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <div className="skeleton-box" style={{ width: 72, height: 72 }} />
              <div className="skeleton-box" style={{ width: 72, height: 72 }} />
              <div className="skeleton-box" style={{ width: 72, height: 72 }} />
            </div>
          </div>
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="skeleton-box" style={{ width: '40%', height: 28 }} />
            <div className="skeleton-box" style={{ width: '85%', height: 42 }} />
            <div className="skeleton-box" style={{ width: '50%', height: 48 }} />
            <div className="skeleton-box" style={{ width: '100%', height: 90 }} />
            <div className="skeleton-box" style={{ width: '100%', height: 80 }} />
          </div>
        </div>
      </div>
    )
  }

  // Error / Not Found State
  if (error || !listing) {
    return (
      <div className="details-container page-enter">
        <div className="glass-card error-card">
          <AlertCircle size={48} color="var(--danger)" />
          <h2>Listing Unavailable</h2>
          <p>{error || 'The requested listing could not be found or has been removed by the seller.'}</p>
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  // Formatted date
  const createdDate = listing.createdAt ? new Date(listing.createdAt) : new Date()
  const formattedDate = createdDate.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  const timeAgo = getTimeAgo(listing.createdAt)

  const sellerName = listing.sellerId?.name || 'Fellow Student'
  const sellerReg = listing.sellerId?.Reg_No || 'Campus Member'

  return (
    <div className="details-container page-enter">
      {/* ── Top Nav Bar ────────────────────────────────────────── */}
      <div className="details-nav-bar">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Browse
        </Link>

        <div className="nav-actions">
          <button
            className="action-icon-btn"
            onClick={handleShare}
            title="Share listing"
            aria-label="Share listing"
          >
            <Share2 size={18} />
          </button>

          {!isOwner && user && (
            <button
              className={`action-icon-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={handleToggleFavorite}
              disabled={favLoading}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Favorite button"
            >
              <Heart size={18} fill={isFavorited ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      {/* ── Main Two-Column Layout ─────────────────────────────── */}
      <div className="details-grid">
        {/* Left: Gallery Column */}
        <div>
          <div className="glass-card gallery-card">
            <div className="main-image-wrap">
              {images.length > 0 ? (
                <img
                  src={images[activeImageIndex]}
                  alt={listing.title}
                  className="main-image"
                />
              ) : (
                <div className="main-image-placeholder">
                  <Tag size={48} />
                  <span>No preview images provided</span>
                </div>
              )}

              {/* Navigation arrows for multi-image listings */}
              {hasMultipleImages && (
                <>
                  <button
                    className="gallery-nav-btn prev"
                    onClick={handlePrevImage}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    className="gallery-nav-btn next"
                    onClick={handleNextImage}
                    aria-label="Next image"
                  >
                    <ChevronRight size={22} />
                  </button>
                  <div className="gallery-counter">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails strip */}
            {hasMultipleImages && (
              <div className="thumbnails-strip">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${activeImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Safety Tip Box */}
          <div className="safety-tip-box">
            <ShieldCheck size={22} className="safety-icon" />
            <div>
              <div className="safety-title">Campus Safety Tip</div>
              <div className="safety-desc">
                Meet in open campus spots like the Student Centre, Library entrance, or
                Cafeteria. Inspect items thoroughly before making any UPI payment.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info & Actions Column */}
        <div className="glass-card info-card">
          <div className="details-header">
            <div className="meta-row">
              <span className="category-tag">
                <Tag size={13} />
                {listing.category}
              </span>
              <span className="post-time" title={formattedDate}>
                <Clock size={13} />
                {timeAgo} ({formattedDate})
              </span>
            </div>

            <h1 className="details-title">{listing.title}</h1>

            <div className="details-price-row">
              <span className="details-price">
                ₹{Number(listing.price).toLocaleString('en-IN')}
              </span>
              <span className="price-sub">Fixed campus price</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="details-section-title">Description</div>
            <p className="details-description">{listing.description}</p>
          </div>

          {/* Seller Profile Card */}
          <div className="seller-box">
            <div className="seller-profile-wrap">
              <div className="seller-big-avatar">
                {sellerName[0]?.toUpperCase()}
              </div>
              <div className="seller-details">
                <span className="seller-name">{sellerName}</span>
                <span className="seller-reg">Reg No: {sellerReg}</span>
                <span className="seller-verified-badge">
                  <ShieldCheck size={12} /> Verified Student
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="details-actions">
            {isOwner ? (
              <div className="owner-actions">
                <Link to={`/edit-listing/${listing._id}`} className="btn btn-primary">
                  <Edit3 size={16} /> Edit Listing
                </Link>
                <Link to="/my-listings" className="btn btn-secondary">
                  Manage in My Listings
                </Link>
              </div>
            ) : (
              <>
                <button
                  className="btn btn-primary btn-message"
                  onClick={() => {
                    if (!user) {
                      navigate('/login', { state: { from: location } })
                    } else {
                      setMessageModalOpen(true)
                    }
                  }}
                >
                  <MessageCircle size={18} /> Contact Seller
                </button>

                <button
                  className={`btn btn-secondary ${isFavorited ? 'favorited' : ''}`}
                  onClick={handleToggleFavorite}
                  disabled={favLoading}
                >
                  <Heart
                    size={16}
                    fill={isFavorited ? 'currentColor' : 'none'}
                    color={isFavorited ? 'var(--accent-rose)' : 'currentColor'}
                  />
                  {isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </button>
              </>
            )}

            {isOwner && (
              <div className="owner-badge">
                <Sparkles size={14} style={{ display: 'inline', marginRight: '0.35rem' }} />
                You posted this listing. You can update details or mark it sold anytime.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick Message Modal ────────────────────────────────── */}
      {messageModalOpen && (
        <div className="modal-overlay" onClick={() => setMessageModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Message {sellerName}</h3>
              <button
                className="modal-close-btn"
                onClick={() => setMessageModalOpen(false)}
                aria-label="Close message dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-product-summary">
              {images[0] ? (
                <img
                  src={images[0]}
                  alt={listing.title}
                  className="modal-product-thumb"
                />
              ) : (
                <div
                  className="modal-product-thumb"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-dim)'
                  }}
                >
                  <Tag size={20} />
                </div>
              )}
              <div>
                <div className="modal-product-title">{listing.title}</div>
                <div className="modal-product-price">
                  ₹{Number(listing.price).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                className="modal-textarea"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message or offer here..."
                required
                autoFocus
              />

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMessageModalOpen(false)}
                  disabled={sendingMessage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={sendingMessage || !messageText.trim() || messageSentSuccess}
                >
                  {messageSentSuccess ? (
                    <>
                      <Check size={16} /> Message Sent!
                    </>
                  ) : sendingMessage ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={16} /> Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Floating Feedback Toast ────────────────────────────── */}
      {toastMessage && (
        <div className="toast-notice">
          <Check size={16} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

// Relative time calculation
function getTimeAgo(dateStr) {
  if (!dateStr) return 'Recently'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'Just now'
}
