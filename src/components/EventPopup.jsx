import { useEffect, useRef } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getMonthIndex(val) {
  if (val === undefined || val === null || val === '') return 0
  if (typeof val === 'number') {
    return val >= 1 && val <= 12 ? val - 1 : (val >= 0 && val <= 11 ? val : 0)
  }
  const s = String(val).trim().toLowerCase()
  const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const longMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

  let idx = shortMonths.indexOf(s.slice(0, 3))
  if (idx !== -1) return idx

  idx = longMonths.indexOf(s)
  if (idx !== -1) return idx

  const num = parseInt(s, 10)
  if (!isNaN(num)) {
    return num >= 1 && num <= 12 ? num - 1 : (num >= 0 && num <= 11 ? num : 0)
  }
  return 0
}

function EventPopup({ event, anchorRect, onClose }) {
  const popupRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!popupRef.current) return
      const path = e.composedPath ? e.composedPath() : []
      const isInsidePopup = popupRef.current.contains(e.target) || path.includes(popupRef.current)
      const isEventBar = e.target.closest && e.target.closest('.event-bar')

      if (!isInsidePopup && !isEventBar) {
        onClose()
      }
    }
    const handleClose = () => {
      onClose()
    }

    const events = ['pointerdown', 'mousedown', 'click', 'touchstart']
    events.forEach(evt => document.addEventListener(evt, handleClickOutside, true))

    window.addEventListener('blur', handleClose)
    window.addEventListener('resize', handleClose)
    window.addEventListener('scroll', handleClose, true)

    return () => {
      events.forEach(evt => document.removeEventListener(evt, handleClickOutside, true))
      window.removeEventListener('blur', handleClose)
      window.removeEventListener('resize', handleClose)
      window.removeEventListener('scroll', handleClose, true)
    }
  }, [onClose])

  if (!event || !anchorRect) return null

  // Position popup below or above the event bar based on viewport space
  const viewportH = window.innerHeight
  const viewportW = window.innerWidth
  const estimatedH = 220
  const gap = 8

  const flipAbove = anchorRect.bottom + estimatedH + gap > viewportH

  let top = flipAbove ? anchorRect.top - gap : anchorRect.bottom + gap
  let left = anchorRect.left

  const popupW = 310
  if (left + popupW > viewportW - 16) {
    left = viewportW - popupW - 16
  }
  if (left < 16) {
    left = 16
  }

  // Parse 0-indexed month array index accurately
  const startIdx = getMonthIndex(event.startMonth)
  const endIdx = getMonthIndex(event.endMonth || event.startMonth)
  const startMonthStr = MONTHS[startIdx]
  const endMonthStr = MONTHS[endIdx]

  const dateStr = startIdx === endIdx
    ? `${startMonthStr} ${event.year}`
    : `${startMonthStr} – ${endMonthStr} ${event.year}`

  const ctaLink = event.ctaLink || event.cta_link || event.ctaUrl || event.link
  const ctaText = event.ctaText || event.cta_text || 'View Link'

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: top,
        left: left,
        transform: flipAbove ? 'translateY(-100%)' : 'none',
        width: popupW,
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
        border: '1px solid #eee',
        zIndex: 9999,
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Color top bar */}
      <div style={{ height: '4px', background: event.borderColor || event.color }} />

      <div style={{ padding: '16px' }}>
        {/* Title */}
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '14px' }}>
          {event.label.replace(/\\n/g, ' ')}
        </div>

        {/* Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px 8px', fontSize: '13px', alignItems: 'center' }}>

          {event.category && (
            <>
              <span style={{ color: '#888' }}>Category</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: event.borderColor || event.color,
                  flexShrink: 0
                }} />
                {event.category}
              </span>
            </>
          )}

          <span style={{ color: '#888' }}>Duration</span>
          <span style={{ fontWeight: '500' }}>{dateStr}</span>

          {event.owner && (
            <>
              <span style={{ color: '#888' }}>Owner</span>
              <span style={{ fontWeight: '500' }}>{event.owner}</span>
            </>
          )}

          {ctaLink && (
            <>
              <span style={{ color: '#888' }}>URL</span>
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <a
                  href={ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#ffffff',
                    backgroundColor: event.borderColor || event.color || '#2563eb',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <span>{ctaText}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </span>
            </>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p style={{
            marginTop: '12px',
            fontSize: '12px',
            color: '#555',
            lineHeight: '1.5',
            borderTop: '1px solid #f0f0f0',
            paddingTop: '10px',
            marginBottom: 0
          }}>
            {event.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default EventPopup
