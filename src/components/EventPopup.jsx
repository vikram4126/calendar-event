import { useEffect, useRef } from 'react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function EventPopup({ event, anchorRect, onClose }) {
  const popupRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!event || !anchorRect) return null

  // Position popup below or above the event bar based on viewport space
  const viewportH = window.innerHeight
  const viewportW = window.innerWidth
  const estimatedH = 180
  const gap = 8

  const flipAbove = anchorRect.bottom + estimatedH + gap > viewportH

  let top = flipAbove ? anchorRect.top - gap : anchorRect.bottom + gap
  let left = anchorRect.left

  const popupW = 300
  if (left + popupW > viewportW - 16) {
    left = viewportW - popupW - 16
  }
  if (left < 16) {
    left = 16
  }

  const dateStr = event.startMonth === event.endMonth
    ? `${MONTHS[event.startMonth]} ${event.year}`
    : `${MONTHS[event.startMonth]} – ${MONTHS[event.endMonth]} ${event.year}`

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
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '10px 8px', fontSize: '13px' }}>

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
