import { useState, useEffect } from 'react'
import Header from './components/Header'
import CalendarGrid from './components/CalendarGrid'
import EventModal from './components/EventModal'
import LoginPage from './components/LoginPage'
import { useAuth } from './context/AuthContext'

function App() {
  const { isAdmin, isLoggedIn } = useAuth()

  const [activeTab, setActiveTab]     = useState('Finance')
  const [selectedYear, setSelectedYear] = useState(2026)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [events, setEvents]           = useState([])
  const [activities, setActivities]   = useState([])
  const [editingEvent, setEditingEvent] = useState(null)

  // ── Initialization ────────────────────────────────────────────────
  useEffect(() => {
    // Fetch directly from public folder (bypassing build bundle)
    fetch('/events.json?t=' + Date.now())
      .then(res => res.json())
      .then(serverData => {
        const savedEvents = localStorage.getItem('calendarEvents')
        const savedActivities = localStorage.getItem('calendarActivities')
        const savedTimestamp = localStorage.getItem('calendarLastUpdated') || 0

        const serverTime = serverData.lastUpdated || 1

        // If local draft is newer than or same as server file, use local draft
        if (savedEvents && savedActivities && parseInt(savedTimestamp) >= serverTime) {
          setEvents(JSON.parse(savedEvents))
          setActivities(JSON.parse(savedActivities))
        } else {
          // Server file is newer (Admin uploaded it), so overwrite local drafts
          setEvents(serverData.events)
          setActivities(serverData.activities)
          localStorage.setItem('calendarLastUpdated', serverTime.toString())
        }
      })
      .catch(err => {
        console.error("Failed to load events.json", err)
        // Fallback to local storage if offline
        const savedEvents = localStorage.getItem('calendarEvents')
        const savedActivities = localStorage.getItem('calendarActivities')
        if (savedEvents) setEvents(JSON.parse(savedEvents))
        if (savedActivities) setActivities(JSON.parse(savedActivities))
      })
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
    localStorage.setItem('calendarLastUpdated', Date.now().toString())
    setIsModalOpen(false)
  }

  const handleDeleteEvent = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId))
    localStorage.setItem('calendarLastUpdated', Date.now().toString())
    setIsModalOpen(false)
  }

  const handleExportData = () => {
    const dataToExport = {
      lastUpdated: Date.now(),
      activities,
      events
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'events.json'
    document.body.appendChild(a)
    a.click()
    
    // Cleanup
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // ── Render ────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <LoginPage />
  }

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddEvent={handleAddEvent}
        onExport={handleExportData}
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
