import { useState, useEffect } from 'react'
import Header from './components/Header'
import CalendarGrid from './components/CalendarGrid'
import EventModal from './components/EventModal'
import { useAuth } from './context/AuthContext'
import initialData from './data/events.json'

// Bump this version whenever you push new seed data.
// A version mismatch clears localStorage and reloads from JSON.
const DATA_VERSION = 'v6'

function App() {
  const { isAdmin } = useAuth()

  const [activeTab, setActiveTab]     = useState('Finance')
  const [selectedYear, setSelectedYear] = useState(2026)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [events, setEvents]           = useState([])
  const [activities, setActivities]   = useState([])
  const [editingEvent, setEditingEvent] = useState(null)

  // ── Seed / restore data ───────────────────────────────────────────
  useEffect(() => {
    const storedVersion    = localStorage.getItem('calendarDataVersion')
    const savedEvents      = localStorage.getItem('calendarEvents')
    const savedActivities  = localStorage.getItem('calendarActivities')

    if (storedVersion === DATA_VERSION && savedEvents && savedActivities) {
      // Use the user's saved (possibly edited) data
      setEvents(JSON.parse(savedEvents))
      setActivities(JSON.parse(savedActivities))
    } else {
      // Fresh load from JSON (version mismatch or first run)
      setEvents(initialData.events)
      setActivities(initialData.activities)
      localStorage.setItem('calendarDataVersion', DATA_VERSION)
      localStorage.setItem('calendarEvents', JSON.stringify(initialData.events))
      localStorage.setItem('calendarActivities', JSON.stringify(initialData.activities))
    }
  }, [])

  // ── Persist on change ─────────────────────────────────────────────
  useEffect(() => {
    if (events.length === 0 && activities.length === 0) return
    localStorage.setItem('calendarEvents', JSON.stringify(events))
    localStorage.setItem('calendarActivities', JSON.stringify(activities))
  }, [events, activities])

  // ── Handlers (admin only) ─────────────────────────────────────────
  const handleAddEvent = () => {
    if (!isAdmin) return
    setEditingEvent(null)
    setIsModalOpen(true)
  }

  const handleEditEvent = (event) => {
    if (!isAdmin) return   // viewers can't edit
    setEditingEvent(event)
    setIsModalOpen(true)
  }

  const handleSaveEvent = (eventData, isNewCategory, newCategoryName) => {
    let currentActivities = [...activities]
    let activityId = eventData.activityId

    if (isNewCategory && newCategoryName) {
      activityId = `a${Date.now()}`
      currentActivities.push({
        id: activityId,
        name: newCategoryName,
        calendarType: activeTab,
      })
      setActivities(currentActivities)
    }

    const eventToSave = { ...eventData, activityId }

    if (editingEvent) {
      setEvents(events.map(e =>
        e.id === editingEvent.id ? { ...eventToSave, id: editingEvent.id } : e
      ))
    } else {
      setEvents([...events, { ...eventToSave, id: `e${Date.now()}` }])
    }
    setIsModalOpen(false)
  }

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId))
    setIsModalOpen(false)
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddEvent={handleAddEvent}
      />

      <main className="calendar-main">
        <div className="calendar-header-top">
          <h1 className="calendar-title">{activeTab} Calendar</h1>
          <div className="year-selector">
            <button className="year-btn" onClick={() => setSelectedYear(y => y - 1)}>&lt;</button>
            <span className="year-display">{selectedYear}</span>
            <button className="year-btn" onClick={() => setSelectedYear(y => y + 1)}>&gt;</button>
          </div>
        </div>

        <CalendarGrid
          events={events}
          activities={activities}
          activeTab={activeTab}
          year={selectedYear}
          onEventClick={handleEditEvent}
          isAdmin={isAdmin}
        />
      </main>

      {isModalOpen && isAdmin && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={editingEvent}
          activities={activities.filter(a => a.calendarType === activeTab)}
          currentYear={selectedYear}
        />
      )}
    </div>
  )
}

export default App
