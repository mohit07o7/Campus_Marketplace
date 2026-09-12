import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, BadgeCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import '../styles/auth.css'

export default function Register() {
  const navigate      = useNavigate()
  const { register }  = useAuth()

  const [form, setForm] = useState({
    name: '', email: '', Reg_No: '', password: '', confirmPassword: ''
  })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, email, Reg_No, password, confirmPassword } = form

    if (!name || !email || !Reg_No || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password, Reg_No)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page page-enter">
      <div className="auth-card glass-card">

        <div className="auth-header">
          <div className="auth-icon-wrap">
            <UserPlus size={24} />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Join the campus marketplace today</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full name</label>
            <div className="input-icon-wrap">
              <User size={16} className="input-icon" />
              <input id="name" name="name" type="text" className="form-input with-icon"
                placeholder="Mohit Yadav" value={form.name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <div className="input-icon-wrap">
              <Mail size={16} className="input-icon" />
              <input id="email" name="email" type="email" className="form-input with-icon"
                placeholder="you@srm.edu.in" value={form.email} onChange={handleChange}
                autoComplete="email" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="Reg_No">Registration number</label>
            <div className="input-icon-wrap">
              <BadgeCheck size={16} className="input-icon" />
              <input id="Reg_No" name="Reg_No" type="text" className="form-input with-icon"
                placeholder="RA2111003010" value={form.Reg_No} onChange={handleChange} />
            </div>
          </div>

          <div className="auth-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input id="password" name="password" type="password" className="form-input with-icon"
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange}
                  autoComplete="new-password" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
              <div className="input-icon-wrap">
                <Lock size={16} className="input-icon" />
                <input id="confirmPassword" name="confirmPassword" type="password"
                  className="form-input with-icon" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={handleChange}
                  autoComplete="new-password" />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <span className="spinner" /> : <UserPlus size={17} />}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
