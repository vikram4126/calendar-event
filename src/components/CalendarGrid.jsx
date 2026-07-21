import { useMemo, useState, useCallback } from 'react'
import { CalendarDays } from 'lucide-react'
import EventPopup from './EventPopup'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Layout constants ─────────────────────────────────────────────
const LABEL_H   = 4    // small top padding
const LANE_H    = 34   // px per lane
const ROW_PAD_T = 14   // top padding inside row
const ROW_PAD_B = 8    // bottom padding

// ─── Greedy lane-assignment ───────────────────────────────────────
// Uses startDay/endDay for weekly view, startMonth/endMonth for monthly
function assignLanes(events, isWeekly = false) {
  const getStart = (ev) => isWeekly
    ? (ev.startDay !== undefined ? ev.startDay : ev.startMonth % 7)
    : ev.startMonth
  const getEnd = (ev) => isWeekly
    ? (ev.endDay !== undefined ? ev.endDay : ev.endMonth % 7)
    : ev.endMonth

  const sorted = [...events].sort((a, b) => getStart(a) - getStart(b))
  const laneEnd = []
  const result  = []

  for (const ev of sorted) {
    const start = getStart(ev)
    const end   = Math.max(getEnd(ev), start) // prevent negative width

    let lane = -1
    for (let i = 0; i < laneEnd.length; i++) {
      if (start > laneEnd[i]) { lane = i; break }
    }
    if (lane === -1) { lane = laneEnd.length; laneEnd.push(-1) }
    laneEnd[lane] = end
    result.push({ ...ev, lane, _start: start, _end: end })
  }

  return { laned: result, laneCount: Math.max(laneEnd.length, 1) }
}

// ─── Bar inline styles ─────────────────────────────────────────────
// isDashed: true  → dashed left border (dotted line effect)
// isTextOnly: true → transparent bar, only text label visible
function getBarStyle(event) {
  const c = event.color || '#2563eb'
  const borderC = event.borderColor || c
  const lightBg = c.length === 7 ? `${c}26` : 'rgba(0,0,0,0.05)'

  if (event.isTextOnly) {
    return {
      height: 24,
      background: 'transparent',
      border: 'none',
      borderRadius: '4px',
      color: borderC,
    }
  }

  if (event.isDashed) {
    return {
      height: 24,
      background: lightBg,
      border: 'none',
      borderLeft: `4px dashed ${borderC}`,
      borderRadius: '4px',
      color: '#111',
    }
  }

  // Default solid style
  return {
    height: 24,
    background: lightBg,
    border: 'none',
    borderLeft: `4px solid ${borderC}`,
    borderRadius: '4px',
    color: '#111',
  }
}

// ─── Component ────────────────────────────────────────────────────
function CalendarGrid({ events, activities, activeTab, year, viewMode, currentWeekStart }) {
  const [popup, setPopup] = useState(null) // { event, anchorRect }

  const tabActivities = useMemo(
    () => activities.filter(a => a.calendarType === activeTab),
    [activities, activeTab]
  )

  const activeEvents = useMemo(
    () => events.filter(e => {
      const matchesActivity = tabActivities.some(a => a.id === e.activityId);
      if (!matchesActivity) return false;

      if (viewMode === 'Weekly') {
        const weekStart = new Date(currentWeekStart);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const evStart = new Date(e.year, e.startMonth, 1);
        const evEnd = new Date(e.year, e.endMonth + 1, 0); 
        evEnd.setHours(23, 59, 59, 999);

        return weekStart <= evEnd && weekEnd >= evStart;
      }
      
      return e.year === year;
    }),
    [events, year, tabActivities, viewMode, currentWeekStart]
  )

  const visibleActivities = useMemo(
    () => tabActivities.filter(a => activeEvents.some(e => e.activityId === a.id)),
    [tabActivities, activeEvents]
  )

  const handleBarClick = useCallback((e, event) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    setPopup(prev => prev?.event.id === event.id ? null : { event, anchorRect: rect })
  }, [])

  const isWeekly = viewMode === 'Weekly'
  const numCols = isWeekly ? 7 : 12
  const colHeaders = isWeekly
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : MONTHS.map(m => `${m} ${String(year).slice(-2)}`)

  if (visibleActivities.length === 0) {
    return (
      <div className="calendar-grid-wrapper empty-state">
        <div className="empty-state-icon"><CalendarDays size={28} /></div>
        <div className="empty-state-title">No events found</div>
        <div className="empty-state-sub">
          There are no events for the <strong>{activeTab}</strong> calendar in <strong>{year}</strong>.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="calendar-grid-wrapper" style={{ overflowX: 'auto' }} onClick={() => setPopup(null)}>
        <table className="calendar-table" style={{ minWidth: isWeekly ? '800px' : 'auto' }}>
          <thead>
            <tr>
              <th className="activity-col">Activity</th>
              {colHeaders.map((header, i) => <th key={i}>{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {visibleActivities.map(activity => {
              const rowEvents = activeEvents.filter(e => e.activityId === activity.id)
              const { laned, laneCount } = assignLanes(rowEvents, isWeekly)
              const rowH = ROW_PAD_T + laneCount * LANE_H + ROW_PAD_B

              return (
                <tr key={activity.id}>
                  <td className="activity-name" style={{ height: rowH }}>{activity.name}</td>

                  <td colSpan={numCols} style={{ padding: 0, position: 'relative', height: rowH }}>

                    {/* Column grid lines */}
                    <div style={{ display: 'flex', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                      {Array.from({ length: numCols }).map((_, i) => (
                        <div key={i} style={{ flex: 1, borderRight: i < numCols - 1 ? '1px solid var(--grid-line)' : 'none' }} />
                      ))}
                    </div>

                    {/* Lane dividers */}
                    {laneCount > 1 && Array.from({ length: laneCount - 1 }, (_, i) => {
                      const divY = ROW_PAD_T + (i + 1) * LANE_H - 6
                      return (
                        <div key={i} style={{
                          position: 'absolute', left: 0, right: 0,
                          top: divY, height: 1,
                          background: 'var(--grid-line)', opacity: 0.6,
                          pointerEvents: 'none'
                        }} />
                      )
                    })}

                    {/* Events */}
                    {laned.map(event => {
                      // _start/_end are precomputed by assignLanes (view-mode aware, no overlap)
                      const startVal = event._start
                      const endVal   = event._end

                      const leftPct  = (startVal / numCols) * 100
                      const widthPct = ((endVal - startVal + 1) / numCols) * 100
                      const barStyle = getBarStyle(event)
                      const laneTop  = ROW_PAD_T + event.lane * LANE_H + LABEL_H
                      const isActive = popup?.event.id === event.id

                      return (
                        <div
                          key={event.id}
                          className="event-bar"
                          onClick={(e) => handleBarClick(e, event)}
                          style={{
                            position: 'absolute',
                            left:   `calc(${leftPct}% + 4px)`,
                            width:  `calc(${widthPct}% - 8px)`,
                            top:    laneTop,
                            cursor: 'pointer',
                            outline: isActive ? `2px solid ${event.borderColor || event.color}` : 'none',
                            outlineOffset: '1px',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            ...barStyle,
                          }}
                        >
                          <div className="event-label">
                            {event.label.replace(/\\n/g, ' ')}
                          </div>
                        </div>
                      )
                    })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Popup portal */}
      {popup && (
        <EventPopup
          event={popup.event}
          anchorRect={popup.anchorRect}
          onClose={() => setPopup(null)}
        />
      )}
    </>
  )
}

export default CalendarGrid
