import { useState, useEffect } from 'react'
import Header from './components/Header'
import CalendarGrid from './components/CalendarGrid'
import YearSelector from './components/YearSelector'

import { NavTabIcon } from './components/icons'

function App() {
  const [activeTab, setActiveTab]     = useState('Finance')
  const [viewMode, setViewMode]       = useState('Monthly')
  const [selectedYear, setSelectedYear] = useState(2024)
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date(2024, 0, 15)) // Jan 15 is Monday

  const [events, setEvents]           = useState([])
  const [activities, setActivities]   = useState([])

  // ── Initialization ────────────────────────────────────────────────
  useEffect(() => {
    import('../public/events.json').then(defaultEvents => {
      // Fetch using relative path so it works on subdirectories
      fetch('./events.json?t=' + Date.now())
        .then(res => {
          if (!res.ok) throw new Error("Not OK")
          return res.json()
        })
        .then(serverData => {
          setEvents(serverData.events || [])
          setActivities(serverData.activities || [])
        })
        .catch(err => {
          console.warn("Failed to fetch external events.json (expected if running via file://), using bundled data.", err)
          setEvents(defaultEvents.default?.events || defaultEvents.events || [])
          setActivities(defaultEvents.default?.activities || defaultEvents.activities || [])
        })
    }).catch(err => console.error("Error loading bundled events:", err))
  }, [])

  // Handlers

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear)
    if (currentWeekStart.getFullYear() !== newYear) {
      const nextDate = new Date(currentWeekStart)
      nextDate.setFullYear(newYear)
      setCurrentWeekStart(nextDate)
    }
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

  const changeWeek = (days) => {
    const nextDate = new Date(currentWeekStart)
    nextDate.setDate(nextDate.getDate() + days)
    setCurrentWeekStart(nextDate)
    
    const nextYear = nextDate.getFullYear()
    if (nextYear !== selectedYear) {
      setSelectedYear(nextYear)
    }
  }

  const formatWeekRange = (start) => {
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const options = { month: 'short', day: 'numeric' }
    return `Week of ${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${start.getFullYear()}`
  }

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      <Header onExport={handleExportData} />

      <main className="calendar-main">
        <div className="main-nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'Finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('Finance')}
          >
            <NavTabIcon type="Finance" />
            Finance Calender
          </button>
          <button
            className={`nav-tab ${activeTab === 'Learning' ? 'active' : ''}`}
            onClick={() => setActiveTab('Learning')}
          >
            <NavTabIcon type="Learning" />
            Learning Calender
          </button>
        </div>

        <div className="calendar-header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: viewMode === 'Weekly' ? '12px' : '20px' }}>
          <div className="header-left-col" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="calendar-title" style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{activeTab} Calender</h1>
            <YearSelector selectedYear={selectedYear} onChange={handleYearChange} />
          </div>
          
          <div className="header-right-col">
            <div className="view-mode-tabs tabs">
              <button
                className={`tab ${viewMode === 'Monthly' ? 'active' : ''}`}
                onClick={() => setViewMode('Monthly')}
              >
                Monthly
              </button>
              <button
                className={`tab ${viewMode === 'Weekly' ? 'active' : ''}`}
                onClick={() => setViewMode('Weekly')}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'Weekly' && (
          <div className="week-navigator" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => changeWeek(-7)} style={{ background: 'var(--bg-color)', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>&lt;</button>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{formatWeekRange(currentWeekStart)}</span>
            <button onClick={() => changeWeek(7)} style={{ background: 'var(--bg-color)', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>&gt;</button>
          </div>
        )}

        <CalendarGrid
          events={events}
          activities={activities}
          activeTab={activeTab}
          year={selectedYear}
          viewMode={viewMode}
          currentWeekStart={currentWeekStart}
        />
      </main>
    </div>
  )
}

export default App
