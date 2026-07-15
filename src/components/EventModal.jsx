import { useState, useEffect } from 'react'
import { CalendarPlus } from 'lucide-react'

// KPMG brand color swatches for event tagging
const COLORS = [
  '#00338d', // kpmg-primary-blue
  '#1e49e2', // kpmg-cobalt-blue
  '#0c233c', // kpmg-dark-blue
  '#00b8f5', // kpmg-pacific-blue
  '#aceaff', // kpmg-light-blue
  '#7213ea', // kpmg-purple
  '#fd349c', // kpmg-pink
  '#76d2ff', // secondary-blue
  '#510dbc', // secondary-dark-purple
  '#b497ff', // secondary-light-purple
  '#098e7e', // secondary-dark-green
  '#00c0ae', // secondary-green
  '#63ebda', // secondary-light-green
  '#ab0d82', // secondary-dark-pink
  '#ffa3da', // secondary-light-pink
  '#4b5e7a', // slate-grey
]

// Line style options — label, key, and a small CSS-based preview
const LINE_STYLES = [
  {
    key: 'solid',
    label: 'Solid',
    preview: (color) => ({
      height: '6px',
      borderRadius: '3px',
      background: color,
    }),
  },
  {
    key: 'dashed',
    label: 'Dashed',
    preview: (color) => ({
      height: '0px',
      borderTop: `3px dashed ${color}`,
    }),
  },
  {
    key: 'dotted',
    label: 'Dotted',
    preview: (color) => ({
      height: '0px',
      borderTop: `3px dotted ${color}`,
    }),
  },
  {
    key: 'gradient',
    label: 'Gradient',
    preview: (color) => ({
      height: '6px',
      borderRadius: '3px',
      background: `linear-gradient(to right, ${color}, transparent)`,
    }),
  },
  {
    key: 'outline',
    label: 'Outline',
    preview: (color) => ({
      height: '6px',
      borderRadius: '3px',
      border: `2px solid ${color}`,
      background: 'transparent',
    }),
  },
  {
    key: 'text',
    label: 'Text Only',
    preview: (color) => ({
      height: '6px',
      border: 'none',
      background: 'transparent',
      color,
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.05em',
      display: 'flex',
      alignItems: 'center',
      whiteSpace: 'nowrap',
    }),
    isText: true,
  },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function EventModal({ isOpen, onClose, onSave, onDelete, event, activities, currentYear }) {
  const [label, setLabel] = useState('')
  const [categoryType, setCategoryType] = useState('existing')
  const [activityId, setActivityId] = useState(activities.length > 0 ? activities[0].id : '')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [startMonth, setStartMonth] = useState(0)
  const [endMonth, setEndMonth] = useState(0)
  const [year, setYear] = useState(currentYear)
  const [color, setColor] = useState(COLORS[0])
  const [lineStyle, setLineStyle] = useState('solid')
  const [hasIcon, setHasIcon] = useState(false)

  useEffect(() => {
    if (event) {
      setLabel(event.label)
      setActivityId(event.activityId)
      setCategoryType('existing')
      setStartMonth(event.startMonth)
      setEndMonth(event.endMonth)
      setYear(event.year)
      setColor(event.color)
      setLineStyle(event.lineStyle || 'solid')
      setHasIcon(event.hasIcon || false)
    } else {
      setLabel('')
      setActivityId(activities.length > 0 ? activities[0].id : '')
      setCategoryType('existing')
      setNewCategoryName('')
      setStartMonth(0)
      setEndMonth(0)
      setYear(currentYear)
      setColor(COLORS[0])
      setLineStyle('solid')
      setHasIcon(false)
    }
  }, [event, currentYear, activities])

  if (!isOpen) return null

  const handleSave = () => {
    if (!label.trim()) {
      alert('Please enter an event label.')
      return
    }
    if (categoryType === 'new' && !newCategoryName.trim()) {
      alert('Please enter a name for the new category.')
      return
    }
    if (parseInt(endMonth, 10) < parseInt(startMonth, 10)) {
      alert('End month cannot be before start month.')
      return
    }

    onSave({
      activityId,
      label,
      startMonth: parseInt(startMonth, 10),
      endMonth: parseInt(endMonth, 10),
      year: parseInt(year, 10),
      color,
      lineStyle,
      hasIcon,
      // legacy compat
      isDashed: lineStyle === 'dashed',
      isTextOnly: lineStyle === 'text',
    }, categoryType === 'new', newCategoryName)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-header-icon">
            <CalendarPlus size={20} />
          </div>
          <h2 className="modal-title">{event ? 'Edit Event' : 'Add New Event'}</h2>
        </div>

        {/* Label */}
        <div className="form-group">
          <label className="form-label">Label (Use \n for line breaks)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Finance Newsletter"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-tabs">
            <button
              className={`cat-tab ${categoryType === 'existing' ? 'active' : ''}`}
              onClick={() => setCategoryType('existing')}
            >
              Existing
            </button>
            <button
              className={`cat-tab ${categoryType === 'new' ? 'active' : ''}`}
              onClick={() => setCategoryType('new')}
            >
              + New
            </button>
          </div>

          {categoryType === 'existing' ? (
            <select
              className="form-select"
              value={activityId}
              onChange={(e) => setActivityId(e.target.value)}
            >
              {activities.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              className="form-input"
              placeholder="New Category Name (e.g. Compliance)"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
          )}
        </div>

        {/* Start / End / Year */}
        <div className="row-group">
          <div className="form-group">
            <label className="form-label">Start</label>
            <select
              className="form-select"
              value={startMonth}
              onChange={e => {
                const val = parseInt(e.target.value, 10)
                setStartMonth(val)
                // auto-push end month forward if it's now before start
                if (parseInt(endMonth, 10) < val) setEndMonth(val)
              }}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">End</label>
            <select
              className={`form-select ${parseInt(endMonth,10) < parseInt(startMonth,10) ? 'input-error' : ''}`}
              value={endMonth}
              onChange={e => {
                const val = parseInt(e.target.value, 10)
                if (val < parseInt(startMonth, 10)) return   // silently block invalid selection
                setEndMonth(val)
              }}
            >
              {MONTHS.map((m, i) => (
                // disable months before start
                <option key={i} value={i} disabled={i < parseInt(startMonth, 10)}>
                  {m}{i < parseInt(startMonth, 10) ? ' ✕' : ''}
                </option>
              ))}
            </select>
            {parseInt(endMonth, 10) < parseInt(startMonth, 10) && (
              <span className="field-error">End must be after Start</span>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input
              type="number"
              className="form-input"
              value={year}
              onChange={e => setYear(e.target.value)}
              min="2000"
              max="2100"
            />
          </div>
        </div>

        {/* Color */}
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker">
            {COLORS.map(c => (
              <div
                key={c}
                className={`color-swatch ${color === c ? 'selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Line Style Visual Picker */}
        <div className="form-group">
          <label className="form-label">Line Style</label>
          <div className="line-style-grid">
            {LINE_STYLES.map(style => (
              <button
                key={style.key}
                className={`line-style-option ${lineStyle === style.key ? 'selected' : ''}`}
                onClick={() => setLineStyle(style.key)}
                title={style.label}
              >
                <div className="line-style-preview">
                  {style.isText ? (
                    <span style={{ ...style.preview(color), lineHeight: 1 }}>Aa</span>
                  ) : (
                    <div style={style.preview(color)} />
                  )}
                </div>
                <span className="line-style-label">{style.label}</span>
              </button>
            ))}
          </div>
        </div>


        {/* Actions */}
        <div className="modal-actions">
          <button className="btn btn-save" onClick={handleSave}>Save</button>
          <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
          {event && (
            <button className="btn btn-delete" onClick={() => onDelete(event.id)}>Delete</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventModal
