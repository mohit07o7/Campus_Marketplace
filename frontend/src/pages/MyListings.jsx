import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Tag,
  Clock,
  AlertTriangle,
  PackageOpen,
  Check,
  DollarSign
} from 'lucide-react'
import api from '../services/api'
import './MyListings.css'

export default function MyListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [deleteModalItem, setDeleteModalItem] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  useEffect(() => {
    fetchMyListings()
  }, [])

  const fetchMyListings = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/users/my-listings')
      setListings(data.listings || [])
    } catch (err) {
      console.error('Failed to load your listings:', err)
      setError(err.response?.data?.message || 'Could not load your listings.')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2800)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModalItem) return
    const idToDelete = deleteModalItem._id

    setDeletingId(idToDelete)
    try {
      await api.delete(`/listings/${idToDelete}`)
      setListings((prev) => prev.filter((item) => item._id !== idToDelete))
      showToast('Listing removed successfully')
      setDeleteModalItem(null)
    } catch (err) {
      console.error('Failed to delete listing:', err)
      showToast(err.response?.data?.message || 'Failed to delete listing')
    } finally {
      setDeletingId(null)
    }
  }

  const totalValue = listings.reduce((sum, item) => sum + (Number(item.price) || 0), 0)

  return (
    <div className="my-listings-container page-enter">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="my-listings-header">
        <div>
          <h1>My Active Listings</h1>
          <p>Manage all items you are currently selling on the campus marketplace.</p>
        </div>

        <Link to="/create-listing" className="btn btn-primary">
          <Plus size={18} /> Post New Item
        </Link>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      {!loading && listings.length > 0 && (
        <div className="my-listings-stats">
          <div className="stat-pill">
            <span>Total Items:</span>
            <span className="stat-num">{listings.length}</span>
          </div>
          <div className="stat-pill">
            <span>Total Value:</span>
            <span className="stat-num">₹{totalValue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* ── Loading Skeleton ──────────────────────────────────── */}
      {loading ? (
        <div className="my-items-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card my-item-card">
              <div className="my-item-main">
                <div className="skeleton-box" style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <div className="skeleton-box" style={{ width: '60%', height: 20 }} />
                  <div className="skeleton-box" style={{ width: '40%', height: 16 }} />
                </div>
              </div>
              <div className="skeleton-box" style={{ width: 80, height: 24 }} />
              <div className="skeleton-box" style={{ width: 140, height: 38 }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="glass-card empty-listings-box">
          <AlertTriangle size={48} color="var(--danger)" />
          <h3>Error Loading Listings</h3>
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchMyListings}>
            Try Again
          </button>
        </div>
      ) : listings.length === 0 ? (
        /* ── Empty State ───────────────────────────────────────── */
        <div className="glass-card empty-listings-box">
          <PackageOpen size={56} className="empty-icon" />
          <h3>You haven't listed anything yet</h3>
          <p>Have textbooks from last semester, lab coats, or electronics you no longer use? List them to make space and earn cash!</p>
          <Link to="/create-listing" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            <Plus size={18} /> Post Your First Item
          </Link>
        </div>
      ) : (
        /* ── Listings List ─────────────────────────────────────── */
        <div className="my-items-list">
          {listings.map((item) => {
            const hasImage = item.images && item.images.length > 0
            const firstImg = hasImage ? item.images[0] : null
            const timeAgo = getTimeAgo(item.createdAt)

            return (
              <div key={item._id} className="glass-card my-item-card">
                {/* Image & Title */}
                <div className="my-item-main">
                  <div className="my-item-thumb">
                    {firstImg ? (
                      <img src={firstImg} alt={item.title} />
                    ) : (
                      <Tag size={28} color="var(--text-dim)" />
                    )}
                  </div>

                  <div className="my-item-info">
                    <Link to={`/listing/${item._id}`} className="my-item-title">
                      {item.title}
                    </Link>
                    <div className="my-item-meta">
                      <span className="badge">{item.category}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> {timeAgo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="my-item-price">
                  ₹{Number(item.price).toLocaleString('en-IN')}
                </div>

                {/* Actions */}
                <div className="my-item-actions">
                  <Link
                    to={`/listing/${item._id}`}
                    className="btn btn-ghost btn-sm"
                    title="View public listing"
                  >
                    <ExternalLink size={15} /> View
                  </Link>

                  <Link
                    to={`/edit-listing/${item._id}`}
                    className="btn btn-secondary btn-sm"
                    title="Edit item details"
                  >
                    <Edit3 size={15} /> Edit
                  </Link>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => setDeleteModalItem(item)}
                    title="Delete listing"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────── */}
      {deleteModalItem && (
        <div className="confirm-modal-overlay" onClick={() => setDeleteModalItem(null)}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-wrap">
              <AlertTriangle size={28} />
            </div>

            <h3>Delete Listing?</h3>
            <p>
              Are you sure you want to permanently delete <strong>"{deleteModalItem.title}"</strong>? This action cannot be undone.
            </p>

            <div className="confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteModalItem(null)}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirm}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Feedback Toast ─────────────────────────────────────── */}
      {toastMessage && (
        <div className="toast-notice">
          <Check size={16} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

function getTimeAgo(dateStr) {
  if (!dateStr) return 'Recently'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${mins}m ago`
}
