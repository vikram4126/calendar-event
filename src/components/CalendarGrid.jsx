import { useMemo, useState, useCallback } from 'react'
import { CalendarDays } from 'lucide-react'
import EventPopup from './EventPopup'
import { ActivityIcon } from './icons'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const LABEL_OFFSET = 4
const LANE_HEIGHT = 34
const ROW_PADDING_TOP = 14
const ROW_PADDING_BOTTOM = 8

function assignLanes(events) {
  const sorted = [...events].sort((a, b) => a._start - b._start)
  const laneEnd = []
  const result  = []

  for (const ev of sorted) {
    const start = ev._start
    const end   = Math.max(ev._end, start)

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

function CalendarGrid({ events, activities, activeTab, year, viewMode, currentWeekStart }) {
  const [popup, setPopup] = useState(null)

  const tabActivities = useMemo(
    () => activities.filter(a => a.calendarType === activeTab),
    [activities, activeTab]
  )

  const activeEvents = useMemo(
    () => {
      const tabActivitiesIds = new Set(tabActivities.map(a => a.id));

      if (viewMode === 'Weekly') {
        const currentYear = currentWeekStart.getFullYear();
        const currentMonth = currentWeekStart.getMonth() + 1;
        const currentDay = currentWeekStart.getDate();
        const currentWeekIdx = Math.ceil(currentDay / 7);

        const filtered = [];
        for (const e of events) {
          if (!tabActivitiesIds.has(e.activityId)) continue;
          if (e.year !== currentYear) continue;

          const startMonth = e.startMonth;
          const endMonth = e.endMonth || startMonth;
          const startWeek = e.startWeek !== undefined ? parseInt(e.startWeek) : 1;
          const endWeek = e.endWeek !== undefined ? parseInt(e.endWeek) : 5;

          const isAfterStart = currentMonth > startMonth || (currentMonth === startMonth && currentWeekIdx >= startWeek);
          const isBeforeEnd = currentMonth < endMonth || (currentMonth === endMonth && currentWeekIdx <= endWeek);

          if (isAfterStart && isBeforeEnd) {
            filtered.push({
              ...e,
              _start: 0,
              _end: 4
            });
          }
        }
        return filtered;
      }

      return events
        .filter(e => {
          if (!tabActivitiesIds.has(e.activityId)) return false;
          return e.year === year;
        })
        .map(e => ({
          ...e,
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
              const rowH = ROW_PADDING_TOP + laneCount * LANE_HEIGHT + ROW_PADDING_BOTTOM

              return (
                <tr key={activity.id}>
                  <td className="activity-name" style={{ height: rowH }}>
                    <span className="activity-icon">
                      <ActivityIcon id={activity.id} />
                    </span>
                    {activity.name}
                  </td>

                  <td colSpan={numCols} style={{ padding: 0, position: 'relative', height: rowH }}>
                    <div style={{ display: 'flex', position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                      {Array.from({ length: numCols }).map((_, i) => (
                        <div key={i} style={{ flex: 1, borderRight: i < numCols - 1 ? '1px solid var(--grid-line)' : 'none' }} />
                      ))}
                    </div>

                    {laned.map(event => {
                      const startVal = event._start
                      const endVal   = event._end

                      const leftPct  = (startVal / numCols) * 100
                      const widthPct = ((endVal - startVal + 1) / numCols) * 100
                      const barStyle = getBarStyle(event)
                      const laneTop  = ROW_PADDING_TOP + event.lane * LANE_HEIGHT + LABEL_OFFSET
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
