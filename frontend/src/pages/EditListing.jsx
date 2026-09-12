import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  UploadCloud,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Save,
  Tag
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

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  // Loading & Initial Data
  const [initialLoading, setInitialLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Form Fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  // Existing images from database
  const [existingImages, setExistingImages] = useState([])

  // Newly selected replacement images: array of { file: File, previewUrl: string }
  const [newImages, setNewImages] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)

  // Validation & Submit State
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch listing data on mount
  useEffect(() => {
    let isMounted = true

    async function loadListing() {
      setInitialLoading(true)
      setFetchError('')
      try {
        const { data } = await api.get(`/listings/${id}`)
        if (!isMounted) return

        // Verify ownership
        const sellerId = data.sellerId?._id || data.sellerId
        if (user && sellerId && user._id !== sellerId) {
          setFetchError('You are not authorized to edit this listing.')
          return
        }

        setTitle(data.title || '')
        setCategory(data.category || CATEGORIES[0])
        setPrice(data.price?.toString() || '')
        setDescription(data.description || '')
        setExistingImages(data.images || [])
      } catch (err) {
        if (!isMounted) return
        console.error('Failed to fetch listing for edit:', err)
        setFetchError(err.response?.data?.message || 'Listing not found.')
      } finally {
        if (isMounted) setInitialLoading(false)
      }
    }

    loadListing()

    return () => {
      isMounted = false
    }
  }, [id, user])

  // Clean up object URLs
  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.previewUrl))
    }
  }, [newImages])

  // Process newly picked replacement files
  const handleFiles = (incomingFiles) => {
    setServerError('')
    const fileList = Array.from(incomingFiles)

    if (fileList.length > 5) {
      setServerError('You can upload a maximum of 5 images.')
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

    setNewImages((prev) => [...prev, ...newItems].slice(0, 5))
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleRemoveNewImage = (idx) => {
    setNewImages((prev) => {
      const removed = prev[idx]
      if (removed) URL.revokeObjectURL(removed.previewUrl)
      return prev.filter((_, i) => i !== idx)
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
      errors.price = 'Price must be a valid positive number'
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

  // Handle submit
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

      // If user uploaded new replacement images
      if (newImages.length > 0) {
        newImages.forEach((imgObj) => {
          formData.append('images', imgObj.file)
        })
      }

      await api.put(`/listings/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      navigate(`/listing/${id}`)
    } catch (err) {
      console.error('Failed to update listing:', err)
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to save updates. Please try again.'
      setServerError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="create-container page-enter" style={{ maxWidth: 800 }}>
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div className="skeleton-box" style={{ width: 220, height: 32, marginBottom: '1.5rem' }} />
          <div className="skeleton-box" style={{ width: '100%', height: 48, marginBottom: '1rem' }} />
          <div className="skeleton-box" style={{ width: '100%', height: 48, marginBottom: '1rem' }} />
          <div className="skeleton-box" style={{ width: '100%', height: 120 }} />
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="create-container page-enter" style={{ maxWidth: 600 }}>
        <div className="glass-card empty-listings-box">
          <AlertCircle size={48} color="var(--danger)" />
          <h3>Unable to Edit Listing</h3>
          <p>{fetchError}</p>
          <Link to="/my-listings" className="btn btn-primary">
            <ArrowLeft size={16} /> Back to My Listings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="create-container page-enter" style={{ maxWidth: 840 }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/my-listings" className="back-link">
          <ArrowLeft size={16} /> Back to My Listings
        </Link>
      </div>

      <div className="create-header">
        <h1>Edit Listing</h1>
        <p>Update pricing, photos, or description for "{title}".</p>
      </div>

      <div className="glass-card create-form-card">
        {serverError && (
          <div className="form-banner-error">
            <AlertCircle size={18} flexShrink={0} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current / New Photos Section */}
          <div className="form-group">
            <label className="form-label">Item Photos</label>

            {/* If there are existing photos and no replacement chosen */}
            {existingImages.length > 0 && newImages.length === 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
                  Current active photos (drag below or click to replace):
                </div>
                <div className="previews-grid">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="preview-thumb-wrap">
                      <img src={url} alt={`Existing ${idx + 1}`} className="preview-thumb-img" />
                      {idx === 0 && <span className="preview-badge-cover">Cover</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dropzone for replacing photos */}
            <div
              className={`dropzone-box ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragOver(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-icon">
                <UploadCloud size={24} />
              </div>
              <div className="dropzone-text">
                {newImages.length > 0
                  ? 'Replace with new photos'
                  : 'Click or drop new photos to replace current ones'}
              </div>
              <div className="dropzone-subtext">
                (Optional) Leaves current images untouched if empty.
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

            {/* New replacement previews */}
            {newImages.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-200)', marginBottom: '0.4rem' }}>
                  New photos to upload on save ({newImages.length}/5):
                </div>
                <div className="previews-grid">
                  {newImages.map((img, idx) => (
                    <div key={idx} className="preview-thumb-wrap">
                      <img src={img.previewUrl} alt={`New upload ${idx + 1}`} className="preview-thumb-img" />
                      {idx === 0 && <span className="preview-badge-cover">New Cover</span>}
                      <button
                        type="button"
                        className="preview-remove-btn"
                        onClick={() => handleRemoveNewImage(idx)}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="form-group">
            <div className="input-with-counter">
              <label className="form-label" htmlFor="edit-title">Listing Title *</label>
              <span className={`char-counter ${title.length > 90 ? 'limit-near' : ''}`}>
                {title.length} / 100
              </span>
            </div>
            <input
              id="edit-title"
              type="text"
              className={`form-input ${fieldErrors.title ? 'error' : ''}`}
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
            <div className="form-group">
              <label className="form-label" htmlFor="edit-category">Category *</label>
              <select
                id="edit-category"
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
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-price">Price (₹) *</label>
              <div className="price-input-wrapper">
                <span className="price-currency-sign">₹</span>
                <input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="1"
                  className={`form-input ${fieldErrors.price ? 'error' : ''}`}
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
              <label className="form-label" htmlFor="edit-desc">Description *</label>
              <span className={`char-counter ${description.length > 900 ? 'limit-near' : ''}`}>
                {description.length} / 1000
              </span>
            </div>
            <textarea
              id="edit-desc"
              className={`form-textarea ${fieldErrors.description ? 'error' : ''}`}
              rows={5}
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

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <Link to="/my-listings" className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 2 }}
            >
              {submitting ? (
                <>
                  <Sparkles size={18} className="spin-icon" /> Saving Updates...
                </>
              ) : (
                <>
                  <Save size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
