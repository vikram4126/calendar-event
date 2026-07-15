import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    // small delay for demo feel
    await new Promise(r => setTimeout(r, 400))
    const result = login(email, password)
    setLoading(false)
    if (!result.success) setError(result.error)
  }

  const fillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@kpmg.com')
      setPassword('admin123')
    } else {
      setEmail('ses.kumar@kpmg.com')
      setPassword('user123')
    }
    setError('')
  }

  return (
    <div className="login-page">
      {/* Background geometric shapes */}
      <div className="login-bg-shape shape-1" />
      <div className="login-bg-shape shape-2" />
      <div className="login-bg-shape shape-3" />

      <div className="login-card">
        {/* Logo & Branding */}
        <div className="login-brand">
          <img src="/kpmg-logo.svg" alt="KPMG" className="login-logo" />
          <div className="login-brand-divider" />
          <span className="login-app-name">Finance &amp; Learning Calendar</span>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to access your calendar</p>

        {/* Quick fill demo buttons */}
        <div className="demo-pills">
          <span className="demo-label">Quick demo:</span>
          <button type="button" className="demo-pill pill-user" onClick={() => fillDemo('user')}>
            👤 User login
          </button>
          <button type="button" className="demo-pill pill-admin" onClick={() => fillDemo('admin')}>
            🔑 Admin login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@kpmg.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="login-footer">
          Demo credentials are pre-filled. Admin can edit events; Users can only view.
        </p>
      </div>
    </div>
  )
}
