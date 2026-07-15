import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ─── Layout constants ─────────────────────────────────────────────
const LABEL_H   = 28   // px above bar reserved for label (supports 2 lines)
const BAR_H     = 5    // px bar thickness (for text-only = 0 effective)
const LANE_H    = 42   // px per lane (label + bar + gap)
const ROW_PAD_T = 14   // top padding inside row
const ROW_PAD_B = 8    // bottom padding

// ─── Greedy lane-assignment ───────────────────────────────────────
// Two events overlap when one starts before the other finishes.
function assignLanes(events) {
  const sorted = [...events].sort((a, b) => a.startMonth - b.startMonth)
  const laneEnd = []   // last endMonth currently occupying each lane
  const result  = []

  for (const ev of sorted) {
    let lane = -1
    for (let i = 0; i < laneEnd.length; i++) {
      if (ev.startMonth > laneEnd[i]) { lane = i; break }
    }
    if (lane === -1) { lane = laneEnd.length; laneEnd.push(-1) }
    laneEnd[lane] = ev.endMonth
    result.push({ ...ev, lane })
  }

  return { laned: result, laneCount: Math.max(laneEnd.length, 1) }
}

// ─── Bar inline styles per lineStyle ─────────────────────────────
function getBarStyle(event) {
  const s = event.lineStyle || (event.isDashed ? 'dashed' : event.isTextOnly ? 'text' : 'solid')
  const c = event.color
  switch (s) {
    case 'dashed':   return { height: 2, border: 'none', borderTop: `2px dashed ${c}`, background: 'transparent', borderRadius: 0 }
    case 'dotted':   return { height: 2, border: 'none', borderTop: `2px dotted ${c}`, background: 'transparent', borderRadius: 0 }
    case 'gradient': return { height: 5, background: `linear-gradient(to right,${c},transparent)`, borderRadius: 3 }
    case 'outline':  return { height: 5, background: 'transparent', border: `1.5px solid ${c}`, borderRadius: 3 }
    case 'text':     return { height: 0, background: 'transparent', border: 'none' }
    default:         return { height: 5, background: c, borderRadius: 3 }
  }
}

function showDots(event) {
  const s = event.lineStyle || (event.isDashed ? 'dashed' : event.isTextOnly ? 'text' : 'solid')
  return s !== 'text' && s !== 'gradient'
}

// ─── Component ────────────────────────────────────────────────────
function CalendarGrid({ events, activities, activeTab, year, onEventClick, isAdmin }) {
  const tabActivities = useMemo(
    () => activities.filter(a => a.calendarType === activeTab),
    [activities, activeTab]
  )

  const activeEvents = useMemo(
    () => events.filter(e => e.year === year && tabActivities.some(a => a.id === e.activityId)),
    [events, year, tabActivities]
  )

  const visibleActivities = useMemo(
    () => tabActivities.filter(a => activeEvents.some(e => e.activityId === a.id)),
    [tabActivities, activeEvents]
  )

  if (visibleActivities.length === 0) {
    return (
      <div className="calendar-grid-wrapper empty-state">
        <div className="empty-state-icon"><CalendarDays size={28} /></div>
        <div className="empty-state-title">No events found</div>
        <div className="empty-state-sub">
          There are no events for the <strong>{activeTab}</strong> calendar in <strong>{year}</strong>.
          {isAdmin && <> Click <strong>"+ Add Event"</strong> to get started.</>}
        </div>
      </div>
    )
  }

  return (
    <div className="calendar-grid-wrapper">
      <table className="calendar-table">
        <thead>
          <tr>
            <th className="activity-col">Activity</th>
            {MONTHS.map(m => <th key={m}>{m} {String(year).slice(-2)}</th>)}
          </tr>
        </thead>
        <tbody>
          {visibleActivities.map(activity => {
            const rowEvents = activeEvents.filter(e => e.activityId === activity.id)
            const { laned, laneCount } = assignLanes(rowEvents)
            const rowH = ROW_PAD_T + laneCount * LANE_H + ROW_PAD_B

            return (
              <tr key={activity.id}>
                <td className="activity-name" style={{ height: rowH }}>{activity.name}</td>

                {/* Single spanning cell for all 12 months */}
                <td colSpan={12} style={{ padding: 0, position: 'relative', height: rowH }}>

                  {/* Column grid lines */}
                  <div style={{ display: 'flex', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {MONTHS.map((_, i) => (
                      <div key={i} style={{ flex: 1, borderRight: i < 11 ? '1px solid var(--grid-line)' : 'none' }} />
                    ))}
                  </div>

                  {/* Lane dividers (subtle, only when >1 lane) */}
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
                    const leftPct  = (event.startMonth / 12) * 100
                    const widthPct = ((event.endMonth - event.startMonth + 1) / 12) * 100
                    const barStyle = getBarStyle(event)

                    // Vertical position for this lane
                    const laneTop = ROW_PAD_T + event.lane * LANE_H + LABEL_H

                    return (
                      <div
                        key={event.id}
                        className="event-bar"
                        style={{
                          position: 'absolute',
                          left:      `calc(${leftPct}%  + 4px)`,
                          width:     `calc(${widthPct}% - 8px)`,
                          top:       laneTop,
                          transform: 'none',
                          cursor:    isAdmin ? 'pointer' : 'default',
                          ...barStyle,
                        }}
                        onClick={() => isAdmin && onEventClick(event)}
                      >
                        {/* Custom Tooltip */}
                        <div className="event-tooltip">
                          <div className="tooltip-title">{event.label.replace(/\\n/g, ' ')}</div>
                          <div className="tooltip-date">
                            {event.startMonth === event.endMonth 
                              ? `${MONTHS[event.startMonth]} ${event.year}`
                              : `${MONTHS[event.startMonth]} - ${MONTHS[event.endMonth]} ${event.year}`}
                          </div>
                        </div>

                        {showDots(event) && barStyle.height > 0 && (
                          <>
                            <div className="event-dot"     style={{ backgroundColor: event.color }} />
                            <div className="event-dot end" style={{ backgroundColor: event.color }} />
                          </>
                        )}
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
  )
}

export default CalendarGrid
