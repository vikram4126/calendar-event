import { useState } from 'react';
import { X, Upload, Download } from 'lucide-react';

export default function ExcelImportModal({ isOpen, onClose }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const downloadTemplate = async () => {
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      const wsActivities = workbook.addWorksheet('Activities');
      const wsEvents = workbook.addWorksheet('Events');

      // Define columns for Activities
      wsActivities.columns = [
        { header: 'id', key: 'id', width: 10 },
        { header: 'name', key: 'name', width: 25 },
        { header: 'calendarType', key: 'calendarType', width: 15 }
      ];
      
      wsActivities.addRows([
        { id: 'a1', name: 'Communications', calendarType: 'Finance' },
        { id: 'l1', name: 'Onboarding', calendarType: 'Learning' }
      ]);

      // Define columns for Events
      wsEvents.columns = [
        { header: 'id', key: 'id', width: 12 },
        { header: 'activityId', key: 'activityId', width: 12 },
        { header: 'label', key: 'label', width: 25 },
        { header: 'startMonth', key: 'startMonth', width: 15 },
        { header: 'endMonth', key: 'endMonth', width: 15 },
        { header: 'startDay', key: 'startDay', width: 15 },
        { header: 'endDay', key: 'endDay', width: 15 },
        { header: 'startWeek', key: 'startWeek', width: 12 },
        { header: 'endWeek', key: 'endWeek', width: 12 },
        { header: 'year', key: 'year', width: 10 },
        { header: 'color', key: 'color', width: 16 },
        { header: 'borderColor', key: 'borderColor', width: 16 },
        { header: 'lineStyle', key: 'lineStyle', width: 12 },
        { header: 'isDashed', key: 'isDashed', width: 12 },
        { header: 'isTextOnly', key: 'isTextOnly', width: 12 },
        { header: 'category', key: 'category', width: 15 },
        { header: 'owner', key: 'owner', width: 15 },
        { header: 'description', key: 'description', width: 30 }
      ];

      // Add a sample row in Events
      wsEvents.addRow({
        id: 'ev-1',
        activityId: 'a1',
        label: 'Q1 Comm Plan',
        startMonth: 'Jan',
        endMonth: 'Mar',
        startDay: 'Monday',
        endDay: 'Friday',
        startWeek: 1,
        endWeek: 3,
        year: 2024,
        color: 'Teal Green',
        borderColor: 'Dark Green',
        lineStyle: 'solid',
        isDashed: false,
        isTextOnly: false,
        category: 'Planning',
        owner: 'John Doe',
        description: 'Initial planning for Q1.'
      });

      // Style header rows (Cobalt Blue background, White text, 30px height)
      const formatHeaderRow = (sheet) => {
        const headerRow = sheet.getRow(1);
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
          cell.font = {
            bold: true,
            color: { argb: 'FFFFFFFF' },
            size: 11
          };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E49E2' }
          };
          cell.alignment = {
            vertical: 'middle',
            horizontal: 'center'
          };
        });
      };

      formatHeaderRow(wsActivities);
      formatHeaderRow(wsEvents);

      // Data validation dropdown lists
      const monthListString = '"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec"';
      const dayListString = '"Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"';
      const weekListString = '"1,2,3,4,5"';
      const colorListString = '"Primary Blue,Cobalt Blue,Dark Blue,Pacific Blue,Purple,Pink,Teal Green,Dark Green"';

      // Apply Month validations to rows 2 to 100 in Events (columns D and E)
      wsEvents.dataValidations.add('D2:D100', {
        type: 'list',
        allowBlank: true,
        formulae: [monthListString]
      });
      wsEvents.dataValidations.add('E2:E100', {
        type: 'list',
        allowBlank: true,
        formulae: [monthListString]
      });

      // Apply Weekday Name validations to rows 2 to 100 in Events (columns F and G)
      wsEvents.dataValidations.add('F2:F100', {
        type: 'list',
        allowBlank: true,
        formulae: [dayListString]
      });
      wsEvents.dataValidations.add('G2:G100', {
        type: 'list',
        allowBlank: true,
        formulae: [dayListString]
      });

      // Apply Week Number validations to rows 2 to 100 in Events (columns H and I)
      wsEvents.dataValidations.add('H2:H100', {
        type: 'list',
        allowBlank: true,
        formulae: [weekListString]
      });
      wsEvents.dataValidations.add('I2:I100', {
        type: 'list',
        allowBlank: true,
        formulae: [weekListString]
      });

      // Apply Color validations to rows 2 to 100 in Events (columns K and L)
      wsEvents.dataValidations.add('K2:K100', {
        type: 'list',
        allowBlank: true,
        formulae: [colorListString]
      });
      wsEvents.dataValidations.add('L2:L100', {
        type: 'list',
        allowBlank: true,
        formulae: [colorListString]
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Calendar_Template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
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

        const parseMonth = (val) => {
          if (val === undefined || val === null || val === '') return 1;
          if (typeof val === 'string') {
            const s = val.trim().toLowerCase();
            const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const longMonths = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            
            let idx = shortMonths.indexOf(s);
            if (idx !== -1) return idx + 1; // 1-indexed
            
            idx = longMonths.indexOf(s);
            if (idx !== -1) return idx + 1; // 1-indexed
            
            const num = parseInt(s);
            if (!isNaN(num)) {
              return num >= 1 && num <= 12 ? num : (num >= 0 && num <= 11 ? num + 1 : 1);
            }
            return 1;
          }
          if (typeof val === 'number') {
            return val >= 1 && val <= 12 ? val : (val >= 0 && val <= 11 ? val + 1 : 1);
          }
          return 1;
        };

        const parseWeek = (val) => {
          if (val === undefined || val === null || val === '') return undefined;
          if (typeof val === 'string') {
            const s = val.trim();
            const num = parseInt(s);
            return !isNaN(num) && num >= 1 && num <= 5 ? num : undefined;
          }
          if (typeof val === 'number') {
            return val >= 1 && val <= 5 ? val : undefined;
          }
          return undefined;
        };

        const COLOR_MAP = {
          'primary blue': '#00338d',
          'blue': '#00338d',
          'cobalt blue': '#1e49e2',
          'dark blue': '#0c233c',
          'pacific blue': '#00b8f5',
          'purple': '#7213ea',
          'pink': '#fd349c',
          'teal green': '#00c0ae',
          'dark green': '#098e7e',
        };

        const parseColor = (val) => {
          if (!val) return undefined;
          const s = String(val).trim().toLowerCase();
          if (COLOR_MAP[s]) return COLOR_MAP[s];
          if (s.startsWith('#')) return String(val).trim();
          return undefined;
        };

        const parseDay = (val) => {
          if (val === undefined || val === null || val === '') return undefined;
          const s = String(val).trim();
          const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const found = validDays.find(d => d.toLowerCase() === s.toLowerCase());
          if (found) return found;
          return s;
        };

        // Transform data to 1-indexed calendar structure
        const formattedEvents = events.map(event => {
          const startMonthVal = parseMonth(event.startMonth);
          const endMonthVal = parseMonth(event.endMonth || event.startMonth);

          const parsedColor = parseColor(event.color);
          const parsedBorderColor = parseColor(event.borderColor);

          return {
            ...event,
            isDashed: event.isDashed === true || event.isDashed === 'true' || event.isDashed === 'TRUE',
            isTextOnly: event.isTextOnly === true || event.isTextOnly === 'true' || event.isTextOnly === 'TRUE',
            startMonth: startMonthVal,
            endMonth: endMonthVal,
            startDay: parseDay(event.startDay),
            endDay: parseDay(event.endDay || event.startDay),
            startWeek: parseWeek(event.startWeek),
            endWeek: parseWeek(event.endWeek || event.startWeek),
            color: parsedColor || event.color || '#00338d',
            borderColor: parsedBorderColor || event.borderColor || parsedColor || event.color || '#00338d',
            year: parseInt(event.year) || new Date().getFullYear(),
          };
        });

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

          <div style={{ padding: '16px', background: 'rgba(0, 192, 174, 0.1)', borderRadius: '6px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Upload size={18} /> Step 2: Upload Excel
            </h3>
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{ width: '100%' }}
            />
          </div>

          {error && <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</div>}
          {success && <div style={{ color: '#098e7e', fontSize: '14px', marginTop: '8px' }}>Successfully generated events.json! Check your downloads.</div>}
        </div>
      </div>
    </div>
  );
}
