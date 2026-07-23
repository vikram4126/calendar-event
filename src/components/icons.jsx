import React from 'react'

export function NavTabIcon({ type }) {
  if (type === 'Finance') {
    return (
      <svg className="nav-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth="1.8" />
        <path d="M3 9h18" strokeWidth="1.8" />
        <path d="M8 4v5M16 4v5" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 13h4M8 17h8" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (type === 'Learning') {
    return (
      <svg className="nav-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 3L2 8l10 5 10-5-10-5z" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M2 8v6" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6 10.5v5.5a6 6 0 0 0 12 0v-5.5" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  }

  return null
}

export function ActivityIcon({ id }) {
  switch (id) {
    case 'a1':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )
    case 'a2':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 11l3 3L22 4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )
    case 'a3':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
          <path d="M12 6v6l4 2" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'a4':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.8" />
          <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.8" />
          <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.8" />
          <path d="M17.5 14v7M14 17.5h7" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'a5':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="9" cy="7" r="4" strokeWidth="1.8" />
          <path d="M2 21v-1a7 7 0 0 1 14 0v1" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19 8c1.1 0 2 .9 2 2s-.9 2-2 2" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 21v-.5a3.5 3.5 0 0 0-3-3.47" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'a6':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'a7':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth="1.8" />
          <path d="M8 21h8M12 17v4" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'a8':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="9" cy="7" r="4" strokeWidth="1.8" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'l1':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M14 12H3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'l2':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )
    case 'l3':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="16 18 22 12 16 6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="8 6 2 12 8 18" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'l4':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )
    case 'l5':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )
    case 'l6':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
          <line x1="2" y1="12" x2="22" y2="12" strokeWidth="1.8" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="1.8" />
        </svg>
      )
    default:
      return null
  }
}
