import { useState } from 'react';
import { X, Upload, Download } from 'lucide-react';

export default function ExcelImportModal({ isOpen, onClose }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const downloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();

      const activitiesData = [
        { id: 'a1', name: 'Communications', calendarType: 'Finance' },
        { id: 'l1', name: 'Onboarding', calendarType: 'Learning' }
      ];

      const eventsData = [
        {
          id: 'ev-1',
          activityId: 'a1',
          label: 'Q1 Comm Plan',
          startMonth: 0,
          endMonth: 2,
          startDay: 0,
          endDay: 4,
          year: 2024,
          color: '#22c55e',
          borderColor: '#16a34a',
          lineStyle: 'solid',
          isDashed: false,
          isTextOnly: false,
          category: 'Planning',
          owner: 'John Doe',
          description: 'Initial planning for Q1.'
        }
      ];

      const wsActivities = XLSX.utils.json_to_sheet(activitiesData);
      const wsEvents = XLSX.utils.json_to_sheet(eventsData);

      XLSX.utils.book_append_sheet(wb, wsActivities, 'Activities');
      XLSX.utils.book_append_sheet(wb, wsEvents, 'Events');

      XLSX.writeFile(wb, 'Calendar_Template.xlsx');
    } catch (err) {
      console.error(err);
      setError("Failed to load Excel generator.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import('xlsx');
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const activitiesSheet = workbook.Sheets['Activities'];
        const eventsSheet = workbook.Sheets['Events'];

        if (!activitiesSheet || !eventsSheet) {
          throw new Error("Missing 'Activities' or 'Events' sheet in the uploaded Excel file.");
        }

        const activities = XLSX.utils.sheet_to_json(activitiesSheet);
        const events = XLSX.utils.sheet_to_json(eventsSheet);

        // Transform boolean/empty values to correct types if necessary
        const formattedEvents = events.map(event => ({
          ...event,
          isDashed: event.isDashed === true || event.isDashed === 'true' || event.isDashed === 'TRUE',
          isTextOnly: event.isTextOnly === true || event.isTextOnly === 'true' || event.isTextOnly === 'TRUE',
          startMonth: parseInt(event.startMonth) || 0,
          endMonth: parseInt(event.endMonth) || 0,
          startDay: event.startDay !== undefined ? parseInt(event.startDay) : undefined,
          endDay: event.endDay !== undefined ? parseInt(event.endDay) : undefined,
          year: parseInt(event.year) || new Date().getFullYear(),
        }));

        const finalJson = {
          lastUpdated: Date.now(),
          activities: activities,
          events: formattedEvents
        };

        const blob = new Blob([JSON.stringify(finalJson, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'events.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setSuccess(true);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to process the Excel file.');
        setSuccess(false);
      }
    };
    reader.onerror = () => {
      setError("Error reading the file.");
      setSuccess(false);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-color, white)', color: 'var(--text-color, black)',
        padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', 
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit'
        }}>
          <X size={24} />
        </button>
        
        <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>Import Excel Data</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Step 1: Download Template
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', opacity: 0.8 }}>
              Download the Excel template. Fill your activities in the "Activities" sheet and events in the "Events" sheet.
            </p>
            <button 
              onClick={downloadTemplate}
              style={{
                background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', 
                borderRadius: '4px', cursor: 'pointer', fontWeight: '500'
              }}
            >
              Download Template
            </button>
          </div>

          <div style={{ padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} /> Step 2: Upload Excel
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', opacity: 0.8 }}>
              Upload the filled Excel file. A new <code>events.json</code> file will be downloaded. 
              Replace the old <code>public/events.json</code> with this new file.
            </p>
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ width: '100%' }}
            />
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</div>}
          {success && <div style={{ color: '#22c55e', fontSize: '14px', marginTop: '8px' }}>Successfully generated events.json! Check your downloads.</div>}
        </div>
      </div>
    </div>
  );
}
