import { BarChart3, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-icon-wrapper">
          <BarChart3 size={32} color="#00338d" strokeWidth={2.5} />
        </div>
        
        <h1 className="login-title">Finance & Learning Calendar</h1>
        <p className="login-subtitle">
          Sign in with your organisational account to access the calendar.
        </p>
        
        <button className="ms-login-btn" onClick={login}>
          <svg className="ms-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
            <path fill="#f25022" d="M1 1h9v9H1z"/>
            <path fill="#00a4ef" d="M1 11h9v9H1z"/>
            <path fill="#7fba00" d="M11 1h9v9h-9z"/>
            <path fill="#ffb900" d="M11 11h9v9h-9z"/>
          </svg>
          Sign in with Microsoft
        </button>
        
        <div className="demo-alert">
          <AlertTriangle size={16} className="alert-icon" />
          <div className="alert-text">
            <strong>Demo Mode:</strong> Azure AD not configured yet.<br />
            Replace AZURE_CONFIG values for real SSO.<br />
            Click above to log in and test the app.
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
