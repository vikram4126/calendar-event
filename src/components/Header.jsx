import { useState, useRef, useEffect } from 'react'
import { Plus, ChevronDown, Check, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function Header({ activeTab, onTabChange, onAddEvent, onExport }) {
  const { currentUser, isAdmin, users, switchUser } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSwitch = (userId) => {
    switchUser(userId)
    setDropdownOpen(false)
  }

  return (
    <header className="header">
      {/* ── Left: Logo + Tabs ── */}
      <div className="header-left">
        <div className="header-logo">
          <img src="/kpmg-logo.svg" alt="KPMG Logo" />
        </div>
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'Finance' ? 'active' : ''}`}
            onClick={() => onTabChange('Finance')}
          >
            Finance Calendar
          </button>
          <button
            className={`tab ${activeTab === 'Learning' ? 'active' : ''}`}
            onClick={() => onTabChange('Learning')}
          >
            Learning Calendar
          </button>
        </div>
      </div>

      {/* ── Right: Add Event + User Switcher ── */}
      <div className="header-right">
        {isAdmin && (
          <div className="admin-actions" style={{ display: 'flex', gap: '10px' }}>
            <button className="export-btn" onClick={onExport} title="Download current data as JSON">
              <Download size={15} style={{ marginRight: '6px' }} /> Export JSON
            </button>
            <button className="add-event-btn" onClick={onAddEvent}>
              <Plus size={15} strokeWidth={3} /> Add Event
            </button>
          </div>
        )}

        {/* User Switcher Dropdown */}
        <div className="user-switcher" ref={dropdownRef}>
          <button
            className="user-switcher-trigger"
            onClick={() => setDropdownOpen(o => !o)}
            aria-expanded={dropdownOpen}
          >
            <div className="user-avatar">{currentUser?.avatar}</div>
            <div className="user-details">
              <span className="user-name">{currentUser?.name}</span>
            </div>
            <ChevronDown
              size={14}
              className="switcher-chevron"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
          </button>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="user-dropdown-label">Switch Account</div>
              {users.map(u => (
                <button
                  key={u.id}
                  className={`user-dropdown-item ${u.id === currentUser?.id ? 'active' : ''}`}
                  onClick={() => handleSwitch(u.id)}
                >
                  <div className={`user-dropdown-avatar ${u.role === 'admin' ? 'avatar-admin' : 'avatar-user'}`}>
                    {u.avatar}
                  </div>
                  <div className="user-dropdown-info">
                    <span className="user-dropdown-name">{u.name}</span>
                  </div>
                  {u.id === currentUser?.id && (
                    <Check size={14} className="dropdown-check" />
                  )}
                </button>
              ))}
              {/* ── API note ── */}
              <div className="user-dropdown-footer">
                Demo only — API will auto-detect role
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
