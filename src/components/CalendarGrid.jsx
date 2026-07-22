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
function assignLanes(events) {
  const sorted = [...events].sort((a, b) => a._start - b._start)
  const laneEnd = []
  const result  = []

  for (const ev of sorted) {
    const start = ev._start
    const end   = Math.max(ev._end, start) // prevent negative width

    let lane = -1
    for (let i = 0; i < laneEnd.length; i++) {
      if (start > laneEnd[i]) { lane = i; break }
    }
    if (lane === -1) { lane = laneEnd.length; laneEnd.push(-1) }
    laneEnd[lane] = end
    result.push({ ...ev, lane })
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

// ─── Placeholder SVG icons per activity (user will replace SVG content later) ────
// Each icon is 20x20 and uses currentColor so it inherits the activity-name colour.
const ACTIVITY_ICONS = {
  // Finance
  a1: ( // Communications
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  a2: ( // Audit process
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  a3: ( // Forecasting/Budget
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  a4: ( // Long term planning
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M17.5 14v7M14 17.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  a5: ( // People
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 21v-1a7 7 0 0 1 14 0v1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M19 8c1.1 0 2 .9 2 2s-.9 2-2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M22 21v-.5a3.5 3.5 0 0 0-3-3.47" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  a6: ( // Empowered
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  a7: ( // Ops Exec
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  a8: ( // Audit Committee
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  // Learning
  l1: ( // Onboarding
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M14 12H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  l2: ( // Leadership Development
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  l3: ( // Technical Skills
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="16 18 22 12 16 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="8 6 2 12 8 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  l4: ( // Compliance Training
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  l5: ( // Soft Skills
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  ),
  l6: ( // Digital Upskilling
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
}

// ─── Component ────────────────────────────────────────────────────
function CalendarGrid({ events, activities, activeTab, year, viewMode, currentWeekStart }) {
  const [popup, setPopup] = useState(null) // { event, anchorRect }

  const tabActivities = useMemo(
    () => activities.filter(a => a.calendarType === activeTab),
    [activities, activeTab]
  )

  const activeEvents = useMemo(
    () => {
      const tabActivitiesIds = new Set(tabActivities.map(a => a.id));

      if (viewMode === 'Weekly') {
        const currentYear = currentWeekStart.getFullYear();
        const currentMonth = currentWeekStart.getMonth() + 1; // 1-indexed (1 to 12)
        const currentDay = currentWeekStart.getDate();
        const currentWeekIdx = Math.ceil(currentDay / 7); // 1 to 5

        const filtered = [];
        for (const e of events) {
          if (!tabActivitiesIds.has(e.activityId)) continue;

          // Check if year matches
          if (e.year !== currentYear) continue;

          // Check if current week falls within the event's month and week range
          const startMonth = e.startMonth;
          const endMonth = e.endMonth || startMonth;
          const startWeek = e.startWeek !== undefined ? parseInt(e.startWeek) : 1;
          const endWeek = e.endWeek !== undefined ? parseInt(e.endWeek) : 5;

          const isAfterStart = currentMonth > startMonth || (currentMonth === startMonth && currentWeekIdx >= startWeek);
          const isBeforeEnd = currentMonth < endMonth || (currentMonth === endMonth && currentWeekIdx <= endWeek);

          if (isAfterStart && isBeforeEnd) {
            // Renders across columns 0 to 4 (Monday to Friday) by default for week-based scheduling
            filtered.push({
              ...e,
              _start: 0,
              _end: 4
            });
          }
        }
        return filtered;
      }

      // Monthly View
      return events
        .filter(e => {
          if (!tabActivitiesIds.has(e.activityId)) return false;
          return e.year === year;
        })
        .map(e => ({
          ...e,
          // Precompute start/end months as 0-indexed columns (0 to 11)
          _start: e.startMonth - 1,
          _end: (e.endMonth || e.startMonth) - 1
        }));
    },
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
              const { laned, laneCount } = assignLanes(rowEvents)
              const rowH = ROW_PAD_T + laneCount * LANE_H + ROW_PAD_B

              return (
                <tr key={activity.id}>
                  <td className="activity-name" style={{ height: rowH }}>
                    <span className="activity-icon">{ACTIVITY_ICONS[activity.id]}</span>
                    {activity.name}
                  </td>

                  <td colSpan={numCols} style={{ padding: 0, position: 'relative', height: rowH }}>

                    {/* Column grid lines */}
                    <div style={{ display: 'flex', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                      {Array.from({ length: numCols }).map((_, i) => (
                        <div key={i} style={{ flex: 1, borderRight: i < numCols - 1 ? '1px solid var(--grid-line)' : 'none' }} />
                      ))}
                    </div>

                    {/* No inter-lane dividers — multiple events in same row share the row space cleanly */}

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
