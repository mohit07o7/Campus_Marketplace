import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  X,
  Tag,
  AlertCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import './CreateListing.css'

const CATEGORIES = [
  'Electronics',
  'Books',
  'Clothing',
  'Furniture',
  'Sports',
  'Stationery',
  'Other'
]

export default function CreateListing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  // Form Fields State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  // Images State: array of { file: File, previewUrl: string }
  const [images, setImages] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)

  // Validation & Submit State
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [images])

  // Process newly selected or dropped files
  const handleFiles = (incomingFiles) => {
    setServerError('')
    const fileList = Array.from(incomingFiles)

    // Check total limit
    if (images.length + fileList.length > 5) {
      setServerError('You can upload a maximum of 5 images per listing.')
      return
    }

    const validExtensions = ['image/jpeg', 'image/png', 'image/webp']
    const newItems = []

    for (const file of fileList) {
      if (!validExtensions.includes(file.type)) {
        setServerError('Only JPEG, PNG, and WEBP image files are allowed.')
        continue
      }
      if (file.size > 5 * 1024 * 1024) {
        setServerError(`"${file.name}" exceeds the 5 MB limit.`)
        continue
      }
      newItems.push({
        file,
        previewUrl: URL.createObjectURL(file)
      })
    }

    setImages((prev) => [...prev, ...newItems])
  }

  // File picker handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      e.target.value = '' // reset input
    }
  }

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // Remove thumbnail
  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => {
      const removed = prev[indexToRemove]
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((_, idx) => idx !== indexToRemove)
    })
  }

  // Client-side form validation
  const validateForm = () => {
    const errors = {}

    if (!title.trim()) {
      errors.title = 'Title is required'
    } else if (title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters'
    } else if (title.trim().length > 100) {
      errors.title = 'Title cannot exceed 100 characters'
    }

    if (!category) {
      errors.category = 'Please select a category'
    }

    if (price === '' || price === null) {
      errors.price = 'Price is required'
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      errors.price = 'Price must be a valid positive number or 0'
    }

    if (!description.trim()) {
      errors.description = 'Description is required'
    } else if (description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters'
    } else if (description.trim().length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    if (!validateForm()) return

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('category', category)
      formData.append('price', price)
      formData.append('description', description.trim())

      images.forEach((imgObj) => {
        formData.append('images', imgObj.file)
      })

      const { data } = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Redirect to the newly created listing page
      navigate(`/listing/${data._id}`)
    } catch (err) {
      console.error('Failed to create listing:', err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to publish listing. Please check your connection and try again.'
      setServerError(msg)
    }
    finally {
      setSubmitting(false)
    }

  }

  return (
    <div className="create-container page-enter">
      <div className="create-header">
        <h1>Sell an Item</h1>
        <p>List your pre-loved textbooks, gear, or dorm essentials for fellow students.</p>
      </div>

      <div className="create-grid">
        {/* ── Left: Form ────────────────────────────────────────── */}
        <div className="glass-card create-form-card">
          {serverError && (
            <div className="form-banner-error">
              <AlertCircle size={18} flexShrink={0} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Image Upload Zone */}
            <div className="form-group">
              <div className="input-with-counter">
                <label className="form-label">Photos (Up to 5)</label>
                <span className="char-counter">{images.length} / 5 uploaded</span>
              </div>

              <div
                className={`dropzone-box ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="dropzone-icon">
                  <UploadCloud size={24} />
                </div>
                <div className="dropzone-text">
                  Drag & drop photos here, or <span style={{ color: 'var(--primary-500)', textDecoration: 'underline' }}>browse</span>
                </div>
                <div className="dropzone-subtext">
                  JPEG, PNG, or WEBP (max 5 MB each). First photo is the cover.
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="file-input-hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Thumbnails list */}
              {images.length > 0 && (
                <div className="previews-grid">
                  {images.map((img, idx) => (
                    <div key={idx} className="preview-thumb-wrap">
                      <img src={img.previewUrl} alt={`Upload ${idx + 1}`} className="preview-thumb-img" />
                      {idx === 0 && <span className="preview-badge-cover">Cover</span>}
                      <button
                        type="button"
                        className="preview-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveImage(idx)
                        }}
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="form-group">
              <div className="input-with-counter">
                <label className="form-label" htmlFor="listing-title">Listing Title *</label>
                <span className={`char-counter ${title.length > 90 ? 'limit-near' : ''}`}>
                  {title.length} / 100
                </span>
              </div>
              <input
                id="listing-title"
                type="text"
                className={`form-input ${fieldErrors.title ? 'error' : ''}`}
                placeholder="e.g. Casio FX-991EX Scientific Calculator"
                value={title}
                maxLength={100}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: null })
                }}
              />
              {fieldErrors.title && (
                <div className="form-field-error">
                  <AlertCircle size={13} /> {fieldErrors.title}
                </div>
              )}
            </div>

            {/* Category & Price Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="listing-category">Category *</label>
                <select
                  id="listing-category"
                  className={`form-select ${fieldErrors.category ? 'error' : ''}`}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    if (fieldErrors.category) setFieldErrors({ ...fieldErrors, category: null })
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {fieldErrors.category && (
                  <div className="form-field-error">
                    <AlertCircle size={13} /> {fieldErrors.category}
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="form-group">
                <label className="form-label" htmlFor="listing-price">Price (₹) *</label>
                <div className="price-input-wrapper">
                  <span className="price-currency-sign">₹</span>
                  <input
                    id="listing-price"
                    type="number"
                    min="0"
                    step="1"
                    className={`form-input ${fieldErrors.price ? 'error' : ''}`}
                    placeholder="500"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value)
                      if (fieldErrors.price) setFieldErrors({ ...fieldErrors, price: null })
                    }}
                  />
                </div>
                {fieldErrors.price && (
                  <div className="form-field-error">
                    <AlertCircle size={13} /> {fieldErrors.price}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="input-with-counter">
                <label className="form-label" htmlFor="listing-desc">Description *</label>
                <span className={`char-counter ${description.length > 900 ? 'limit-near' : ''}`}>
                  {description.length} / 1000
                </span>
              </div>
              <textarea
                id="listing-desc"
                className={`form-textarea ${fieldErrors.description ? 'error' : ''}`}
                rows={5}
                placeholder="Mention the condition, semester used, reason for selling, and preferred pickup location on campus..."
                value={description}
                maxLength={1000}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: null })
                }}
              />
              {fieldErrors.description && (
                <div className="form-field-error">
                  <AlertCircle size={13} /> {fieldErrors.description}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={submitting}
              style={{ marginTop: '0.75rem' }}
            >
              {submitting ? (
                <>
                  <Sparkles size={18} className="spin-icon" /> Uploading & Publishing...
                </>
              ) : (
                <>
                  Publish Listing <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Right: Live Feed Preview ─────────────────────────── */}
        <div className="create-preview-col">
          <div className="preview-title-bar">
            <h3>
              <Eye size={18} color="var(--primary-500)" /> Live Marketplace Preview
            </h3>
            <span className="badge">Student Card</span>
          </div>

          <div className="preview-card-wrap">
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              {/* Card Image */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', background: '#030712' }}>
                {images.length > 0 ? (
                  <img
                    src={images[0].previewUrl}
                    alt="Cover preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-dim)',
                      gap: '0.5rem'
                    }}
                  >
                    <Tag size={36} />
                    <span style={{ fontSize: '0.8rem' }}>Upload photo for preview</span>
                  </div>
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    padding: '0.25rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(15, 23, 41, 0.85)',
                    backdropFilter: 'blur(6px)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--primary-200)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {category || 'Category'}
                </span>
              </div>

              {/* Card Content */}
              <div style={{ padding: '1.25rem' }}>
                <h4
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    marginBottom: '0.4rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {title || 'Item Title Preview'}
                </h4>
                <p
                  style={{
                    fontSize: '0.84rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.5rem'
                  }}
                >
                  {description || 'Your description will appear here on the student marketplace browse feed.'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)'
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.35rem',
                      fontWeight: 800,
                      color: 'var(--text-main)'
                    }}
                  >
                    ₹{price ? Number(price).toLocaleString('en-IN') : '0'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'var(--primary-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#fff'
                      }}
                    >
                      {(user?.name || 'S')[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {user?.name?.split(' ')[0] || 'You'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips Box */}
          <div className="preview-tip-box">
            <div style={{ fontWeight: 600, color: 'var(--primary-200)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={14} /> Tips for a fast sale:
            </div>
            <ul>
              <li>Take clear, well-lit photos showing any scratches or wear.</li>
              <li>Include edition/model numbers for books and electronics.</li>
              <li>Set a competitive price compared to campus store prices.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
