import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  GraduationCap, Search, Plus, Heart, MessageCircle,
  User, LogOut, LayoutList, Menu, X, ChevronDown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar({ onSearch }) {
  const { user, logout }   = useAuth()
  const navigate           = useNavigate()
  const location           = useLocation()
  const [menuOpen,    setMenuOpen]    = useState(false) // mobile drawer
  const [dropOpen,    setDropOpen]    = useState(false) // user dropdown
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    setDropOpen(false)
    setMenuOpen(false)
    navigate('/')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch) onSearch(searchQuery)
    else navigate(`/?search=${encodeURIComponent(searchQuery)}`)
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <GraduationCap size={22} />
          <span>Campus<strong>Marketplace</strong></span>
        </Link>

        {/* ── Search bar (desktop) ──────────────────────────────── */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <Search size={16} className="search-icon" />
          <input
            type="search"
            placeholder="Search listings…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        {/* ── Desktop Nav ───────────────────────────────────────── */}
        <nav className="navbar-links">
          {!user ? (
            <>
              <Link to="/login"    className={`nav-link ${isActive('/login')    ? 'active' : ''}`}>Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          ) : (
            <>
              <Link to="/create-listing" className="btn btn-primary btn-sm" title="Create listing">
                <Plus size={15} /> Sell
              </Link>

              <Link to="/favorites" className={`nav-icon-btn ${isActive('/favorites') ? 'active' : ''}`} title="Favorites">
                <Heart size={19} />
              </Link>

              <Link to="/messages" className={`nav-icon-btn ${isActive('/messages') ? 'active' : ''}`} title="Messages">
                <MessageCircle size={19} />
              </Link>

              {/* User dropdown */}
              <div className="nav-dropdown-wrap">
                <button
                  className="nav-user-btn"
                  onClick={() => setDropOpen(o => !o)}
                  aria-expanded={dropOpen}
                  aria-haspopup="true"
                >
                  <div className="user-avatar">{user.name?.[0]?.toUpperCase() ?? 'U'}</div>
                  <span className="user-name-short">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`dropdown-arrow ${dropOpen ? 'open' : ''}`} />
                </button>

                {dropOpen && (
                  <>
                    <div className="dropdown-overlay" onClick={() => setDropOpen(false)} />
                    <div className="nav-dropdown glass-card">
                      <div className="dropdown-header">
                        <p className="dropdown-name">{user.name}</p>
                        <p className="dropdown-email">{user.email}</p>
                      </div>
                      <div className="dropdown-divider" />
                      <Link to="/my-listings" className="dropdown-item" onClick={() => setDropOpen(false)}>
                        <LayoutList size={15} /> My Listings
                      </Link>
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropOpen(false)}>
                        <User size={15} /> Profile & Settings
                      </Link>
                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={handleLogout}>
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </nav>

        {/* ── Mobile hamburger ─────────────────────────────────── */}
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile Drawer ────────────────────────────────────────── */}
      {menuOpen && (
        <div className="mobile-drawer">
          <form className="navbar-search mobile-search" onSubmit={(e) => { handleSearch(e); setMenuOpen(false) }}>
            <Search size={16} className="search-icon" />
            <input
              type="search"
              placeholder="Search listings…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </form>

          {!user ? (
            <>
              <Link to="/login"    className="mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Create Account</Link>
            </>
          ) : (
            <>
              <div className="mobile-user">
                <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <div>
                  <p style={{ fontWeight: 600 }}>{user.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.Reg_No}</p>
                </div>
              </div>
              <Link to="/create-listing" className="mobile-link"  onClick={() => setMenuOpen(false)}><Plus size={15} /> Sell an item</Link>
              <Link to="/favorites"      className="mobile-link"  onClick={() => setMenuOpen(false)}><Heart size={15} /> Favorites</Link>
              <Link to="/messages"       className="mobile-link"  onClick={() => setMenuOpen(false)}><MessageCircle size={15} /> Messages</Link>
              <Link to="/my-listings"    className="mobile-link"  onClick={() => setMenuOpen(false)}><LayoutList size={15} /> My Listings</Link>
              <Link to="/profile"        className="mobile-link"  onClick={() => setMenuOpen(false)}><User size={15} /> Profile</Link>
              <button className="mobile-link danger"              onClick={handleLogout}><LogOut size={15} /> Sign Out</button>
            </>
          )}
        </div>
      )}
    </header>
  )
}
