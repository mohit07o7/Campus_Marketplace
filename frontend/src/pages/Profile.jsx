import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Mail,
  Hash,
  ShieldCheck,
  Lock,
  Package,
  Heart,
  Save,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound
} from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()

  // Profile fields state
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [regNo, setRegNo] = useState(user?.Reg_No || '')

  // Password fields state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Metrics state
  const [listingCount, setListingCount] = useState(0)
  const [favCount, setFavCount] = useState(0)

  // Feedback & Loading State
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Fetch fresh profile data and counts on mount
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [profileRes, listingsRes, favsRes] = await Promise.allSettled([
          api.get('/users/profile'),
          api.get('/users/my-listings'),
          api.get('/favorites')
        ])

        if (!isMounted) return

        if (profileRes.status === 'fulfilled') {
          const p = profileRes.value.data
          setName(p.name || '')
          setEmail(p.email || '')
          setRegNo(p.Reg_No || '')
          updateUser(p)
        }

        if (listingsRes.status === 'fulfilled') {
          setListingCount(listingsRes.value.data.count ?? (listingsRes.value.data.listings?.length || 0))
        }

        if (favsRes.status === 'fulfilled') {
          setFavCount(favsRes.value.data.count ?? (favsRes.value.data.listings?.length || 0))
        }
      } catch (err) {
        console.error('Failed to load profile metrics:', err)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  // Handle Profile Info Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (!name.trim()) {
      setProfileError('Name cannot be empty.')
      return
    }
    if (!regNo.trim()) {
      setProfileError('Registration number is required.')
      return
    }

    setLoadingProfile(true)
    try {
      const { data } = await api.put('/users/profile', {
        name: name.trim(),
        Reg_No: regNo.trim()
      })

      updateUser({
        name: data.name,
        email: data.email,
        Reg_No: data.Reg_No
      })

      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      setProfileSuccess('Profile details updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3500)
    } catch (err) {
      console.error('Profile update error:', err)
      setProfileError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoadingProfile(false)
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!password) {
      setPasswordError('Please enter a new password.')
      return
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setLoadingPassword(true)
    try {
      const { data } = await api.put('/users/profile', {
        password
      })

      if (data.token) {
        localStorage.setItem('token', data.token)
      }

      setPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Password changed securely!')
      setTimeout(() => setPasswordSuccess(''), 3500)
    } catch (err) {
      console.error('Password change error:', err)
      setPasswordError(err.response?.data?.message || 'Failed to update password.')
    } finally {
      setLoadingPassword(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = (name || 'Student')[0].toUpperCase()

  return (
    <div className="profile-container page-enter">
      {/* ── Top Hero Card ─────────────────────────────────────── */}
      <div className="glass-card profile-hero-card">
        <div className="profile-hero-main">
          <div className="profile-big-avatar">{initials}</div>

          <div className="profile-hero-meta">
            <div className="profile-name-row">
              <h1>{name || 'Campus Student'}</h1>
              <span className="student-badge">
                <ShieldCheck size={14} /> Verified Campus Student
              </span>
            </div>

            <div className="profile-sub-info">
              <span>
                <Mail size={15} color="var(--primary-500)" /> {email}
              </span>
              <span>
                <Hash size={15} color="var(--primary-500)" /> Reg No: {regNo || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="profile-stats-bar">
          <Link to="/my-listings" className="profile-stat-box" style={{ textDecoration: 'none' }}>
            <div className="stat-icon blue">
              <Package size={20} />
            </div>
            <div className="stat-info-text">
              <span className="num">{listingCount}</span>
              <span className="label">Items for Sale</span>
            </div>
          </Link>

          <Link to="/favorites" className="profile-stat-box" style={{ textDecoration: 'none' }}>
            <div className="stat-icon pink">
              <Heart size={20} />
            </div>
            <div className="stat-info-text">
              <span className="num">{favCount}</span>
              <span className="label">Saved in Wishlist</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Forms Grid ────────────────────────────────────────── */}
      <div className="profile-sections-grid">
        {/* Left: Edit Credentials */}
        <div className="glass-card profile-form-card">
          <div className="card-title-row">
            <User size={20} color="var(--primary-500)" />
            <h2>Student Details</h2>
          </div>

          {profileSuccess && (
            <div className="toast-notice" style={{ position: 'static', animation: 'none', background: 'rgba(16,185,129,0.15)', border: '1px solid var(--success)' }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="form-banner-error">
              <AlertCircle size={16} />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Campus Email</label>
              <div className="readonly-input-wrap">
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  disabled
                />
              </div>
              <span className="input-helper-note">
                Email is tied to your student account and cannot be modified.
              </span>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="profile-reg">Registration Number (Reg No)</label>
              <input
                id="profile-reg"
                type="text"
                className="form-input"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value)}
                required
              />
              <span className="input-helper-note">
                Displayed on your item listings so students can verify campus authenticity.
              </span>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loadingProfile}
              style={{ marginTop: '0.5rem' }}
            >
              {loadingProfile ? 'Saving...' : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Change Password */}
        <div className="glass-card profile-form-card">
          <div className="card-title-row">
            <KeyRound size={20} color="var(--primary-500)" />
            <h2>Security & Password</h2>
          </div>

          {passwordSuccess && (
            <div className="toast-notice" style={{ position: 'static', animation: 'none', background: 'rgba(16,185,129,0.15)', border: '1px solid var(--success)' }}>
              <CheckCircle2 size={16} color="var(--success)" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="form-banner-error">
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="new-password">New Password</label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-secondary"
              disabled={loadingPassword || !password}
              style={{ marginTop: '0.5rem' }}
            >
              {loadingPassword ? 'Updating Password...' : (
                <>
                  <Lock size={16} /> Update Password
                </>
              )}
            </button>
          </form>

          {/* Danger Zone: Log out */}
          <div className="danger-zone" style={{ marginTop: 'auto' }}>
            <div className="danger-zone-text">
              <h4>Session Management</h4>
              <p>Log out of your current session on this browser.</p>
            </div>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleLogout}
            >
              <LogOut size={15} /> Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
