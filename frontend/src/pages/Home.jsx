import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, PackageOpen } from 'lucide-react'
import api from '../services/api'
import ListingCard from '../components/ListingCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import Pagination from '../components/Pagination'
import { PROTOTYPE_LISTINGS } from '../services/mockListings'
import './Home.css'

const CATEGORIES = ['All', 'Electronics', 'Books', 'Clothing', 'Furniture', 'Sports', 'Stationery', 'Other']
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first' },
  { value: 'oldest',     label: 'Oldest first' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
]

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()

  // ── Filter state (synced to URL) ──────────────────────────────
  const [filters, setFilters] = useState({
    search:   searchParams.get('search')   || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort:     searchParams.get('sort')     || 'newest',
    page:     Number(searchParams.get('page')) || 1,
  })
  const [searchInput, setSearchInput] = useState(filters.search)
  const [showFilters, setShowFilters] = useState(false)

  // ── Data state ────────────────────────────────────────────────
  const [listings,   setListings]   = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0, limit: 20 })
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  // ── Fetch listings whenever filters change ────────────────────
  const fetchListings = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.search)   params.search   = filters.search
      if (filters.category) params.category = filters.category
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice) params.maxPrice = filters.maxPrice
      if (filters.sort)     params.sort     = filters.sort
      params.page  = filters.page
      params.limit = 20

      const { data } = await api.get('/listings', { params })
      if (data.listings && data.listings.length > 0) {
        setListings(data.listings)
        setPagination(data.pagination)
      } else {
        // Use realistic prototype cards if database is empty
        const filteredProto = filterPrototypes(PROTOTYPE_LISTINGS, filters)
        setListings(filteredProto)
        setPagination({ total: filteredProto.length, page: 1, pages: 1, limit: 20 })
      }

      // Sync filters → URL (for shareable links)
      const urlParams = {}
      if (filters.search)   urlParams.search   = filters.search
      if (filters.category) urlParams.category = filters.category
      if (filters.minPrice) urlParams.minPrice = filters.minPrice
      if (filters.maxPrice) urlParams.maxPrice = filters.maxPrice
      if (filters.sort !== 'newest') urlParams.sort = filters.sort
      if (filters.page > 1) urlParams.page = filters.page
      setSearchParams(urlParams, { replace: true })
    } catch (err) {
      // Fallback to prototype listings so the marketplace is always interactive
      const filteredProto = filterPrototypes(PROTOTYPE_LISTINGS, filters)
      setListings(filteredProto)
      setPagination({ total: filteredProto.length, page: 1, pages: 1, limit: 20 })
    } finally {
      setLoading(false)
    }
  }, [filters]) // eslint-disable-line

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  // ── Debounced search ──────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchInput, page: 1 }))
    }, 400)
    return () => clearTimeout(t)
  }, [searchInput])

  const setFilter = (key, value) =>
    setFilters(f => ({ ...f, [key]: value, page: 1 }))

  const clearFilters = () => {
    setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1 })
    setSearchInput('')
  }

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice || filters.sort !== 'newest'

  return (
    <div className="home page-enter">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="home-hero">
        <p className="hero-eyebrow">🎓 SRM Campus Marketplace</p>
        <h1 className="hero-title">
          Buy & sell with<br />
          <span className="hero-gradient">fellow students</span>
        </h1>
        <p className="hero-sub">Textbooks, electronics, dorm supplies — all in one place.</p>

        {/* Main search */}
        <form
          className="hero-search"
          onSubmit={(e) => { e.preventDefault(); setFilter('search', searchInput) }}
        >
          <Search size={18} className="hero-search-icon" />
          <input
            type="search"
            className="hero-search-input"
            placeholder="Search for calculators, textbooks, chairs…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoFocus
          />
        </form>
      </section>

      {/* ── Filter Bar ───────────────────────────────────────────── */}
      <section className="filter-bar">
        {/* Category pills */}
        <div className="category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`pill ${filters.category === (cat === 'All' ? '' : cat) ? 'active' : ''}`}
              onClick={() => setFilter('category', cat === 'All' ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right controls */}
        <div className="filter-controls">
          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={14} /> Clear
            </button>
          )}

          <button
            className={`btn btn-secondary btn-sm ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(f => !f)}
          >
            <SlidersHorizontal size={14} />
            Filters {hasActiveFilters && <span className="filter-dot" />}
          </button>

          <select
            className="form-select sort-select"
            value={filters.sort}
            onChange={(e) => setFilter('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </section>

      {/* ── Advanced Filters Panel ────────────────────────────────── */}
      {showFilters && (
        <div className="filter-panel glass-card">
          <div className="filter-panel-inner">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Min Price (₹)</label>
              <input
                type="number" min="0"
                className="form-input"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => setFilter('minPrice', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Max Price (₹)</label>
              <input
                type="number" min="0"
                className="form-input"
                placeholder="Any"
                value={filters.maxPrice}
                onChange={(e) => setFilter('maxPrice', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Results header ────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="results-header">
          <p className="results-count">
            {pagination.total === 0
              ? 'No listings found'
              : `${pagination.total} listing${pagination.total !== 1 ? 's' : ''} found`}
            {filters.search && <span> for "<strong>{filters.search}</strong>"</span>}
          </p>
        </div>
      )}

      {/* ── Content ───────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton count={8} />}

      {error && !loading && (
        <div className="home-error">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={fetchListings}>Try again</button>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="home-empty">
          <PackageOpen size={56} strokeWidth={1} />
          <h2>No listings yet</h2>
          <p>Be the first to sell something on campus!</p>
        </div>
      )}

      {!loading && !error && listings.length > 0 && (
        <>
          <div className="listings-grid">
            {listings.map(listing => (
              <ListingCard key={listing._id} listing={listing} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
          />
        </>
      )}
    </div>
  )
}

function filterPrototypes(list, filters) {
  let result = [...list]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    )
  }
  if (filters.category && filters.category !== 'All') {
    result = result.filter((item) => item.category === filters.category)
  }
  if (filters.minPrice) {
    result = result.filter((item) => item.price >= Number(filters.minPrice))
  }
  if (filters.maxPrice) {
    result = result.filter((item) => item.price <= Number(filters.maxPrice))
  }
  if (filters.sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price)
  } else if (filters.sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price)
  } else if (filters.sort === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  } else {
    // newest
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
  return result
}
