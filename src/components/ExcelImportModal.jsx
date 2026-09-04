import { useState } from 'react';
import { X, Upload, Download } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const COLOR_NAME_MAP = {
  '#00338d': 'Primary Blue',
  '#1e49e2': 'Cobalt Blue',
  '#0c233c': 'Dark Blue',
  '#aceaff': 'Light Blue',
  '#00b8f5': 'Pacific Blue',
  '#7213ea': 'Purple',
  '#fd349c': 'Pink',
};

const COLOR_MAP = {
  'primary blue': '#00338d',
  'primary_blue': '#00338d',
  'cobalt blue': '#1e49e2',
  'cobalt_blue': '#1e49e2',
  'dark blue': '#0c233c',
  'dark_blue': '#0c233c',
  'light blue': '#aceaff',
  'light_blue': '#aceaff',
  'pacific blue': '#00b8f5',
  'pacific_blue': '#00b8f5',
  'purple': '#7213ea',
  'pink': '#fd349c',
};

const formatColorForExcel = (val) => {
  if (!val) return 'Primary Blue';
  const s = String(val).trim().toLowerCase();
  if (COLOR_MAP[s]) return COLOR_NAME_MAP[COLOR_MAP[s]] || 'Primary Blue';
  if (COLOR_NAME_MAP[s]) return COLOR_NAME_MAP[s];
  return val;
};

const parseColor = (val) => {
  if (!val) return undefined;
  const s = String(val).trim().toLowerCase();
  if (COLOR_MAP[s]) return COLOR_MAP[s];
  if (s.startsWith('#')) return String(val).trim();
  return undefined;
};

function parseDateObject(val, XLSX) {
  if (val === null || val === undefined || val === '') return null;

  // 1. If val is a Date object (from XLSX cellDates or JS)
  if (val instanceof Date && !isNaN(val.getTime())) {
    // Extract exact UTC components if UTC midnight, or local components
    const yr = val.getUTCFullYear();
    const mo = val.getUTCMonth();
    const da = val.getUTCDate();
    return new Date(yr, mo, da);
  }

  // 2. If val is an Excel Serial Number (e.g. 46285 for 9/20/2026)
  if (typeof val === 'number' && val > 1000) {
    if (XLSX && XLSX.SSF) {
      const parsed = XLSX.SSF.parse_date(val);
      if (parsed) {
        return new Date(parsed.y, parsed.m - 1, parsed.d);
      }
    }
    // Fallback formula for Excel Epoch (1899-12-30)
    // Excel counts 1900-01-01 as 1, and includes non-existent 1900-02-29 (leap year bug)
    // 25569 days between 1899-12-30 and 1970-01-01
    const dayCount = Math.floor(val);
    const utcMs = (dayCount - 25569) * 86400 * 1000;
    const d = new Date(utcMs);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }

  const str = String(val).trim();
  if (!str) return null;

  // 3. String like "9/20/2026", "20/09/2026", "09/20/2026"
  const m1 = str.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (m1) {
    let p1 = parseInt(m1[1], 10);
    let p2 = parseInt(m1[2], 10);
    let yr = parseInt(m1[3], 10);
    let month, day;
    if (p1 > 12) {
      day = p1;
      month = p2 - 1;
    } else if (p2 > 12) {
      month = p1 - 1;
      day = p2;
    } else {
      month = p1 - 1;
      day = p2;
    }
    return new Date(yr, month, day);
  }

  // 4. String like "2026-09-20" or "September 2026"
  const m2 = str.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})$/);
  if (m2) {
    return new Date(parseInt(m2[1], 10), parseInt(m2[2], 10) - 1, parseInt(m2[3], 10));
  }

  // 5. String like "19 September 2026" or "September 2026"
  const tokens = str.split(/[\s,/-]+/).filter(Boolean);
  if (tokens.length >= 2) {
    let day = parseInt(tokens[0]);
    let monthToken = tokens[1].toLowerCase();
    let year = parseInt(tokens[2] || tokens[1]);

    if (isNaN(day)) {
      monthToken = tokens[0].toLowerCase();
      day = parseInt(tokens[1]) || 1;
      year = parseInt(tokens[2]) || 2026;
    }

    let mIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === monthToken.slice(0, 3));
    if (mIdx === -1) mIdx = FULL_MONTH_NAMES.findIndex(m => m.toLowerCase().startsWith(monthToken));

    if (mIdx !== -1 && !isNaN(year)) {
      return new Date(year, mIdx, isNaN(day) ? 1 : day);
    }
  }

  return null;
}

function formatDateForDisplay(d) {
  if (!d || isNaN(d.getTime())) return '';
  const day = d.getDate();
  const monthStr = FULL_MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${monthStr} ${year}`;
}

function extractEventDates(startVal, endVal, fallbackYear = 2026, XLSX = null) {
  const startDate = parseDateObject(startVal, XLSX);
  const endDate = parseDateObject(endVal, XLSX) || startDate;

  if (startDate) {
    const sYr = startDate.getFullYear();
    const sMo = startDate.getMonth() + 1; // 1-indexed (1-12)
    const sDa = WEEKDAYS[startDate.getDay()];
    const sWk = Math.min(5, Math.ceil(startDate.getDate() / 7));

    const eYr = endDate ? endDate.getFullYear() : sYr;
    const eMo = endDate ? endDate.getMonth() + 1 : sMo;
    const eDa = endDate ? WEEKDAYS[endDate.getDay()] : sDa;
    const eWk = endDate ? Math.min(5, Math.ceil(endDate.getDate() / 7)) : sWk;

    return {
      year: sYr,
      startMonth: sMo,
      endMonth: eMo,
      startDay: sDa,
      endDay: eDa,
      startWeek: sWk,
      endWeek: eWk,
      startDateStr: formatDateForDisplay(startDate),
      endDateStr: formatDateForDisplay(endDate || startDate)
    };
  }

  return {
    year: fallbackYear,
    startMonth: 1,
    endMonth: 1,
    startDay: 'Monday',
    endDay: 'Friday',
    startWeek: 1,
    endWeek: 2,
    startDateStr: String(startVal || ''),
    endDateStr: String(endVal || startVal || '')
  };
}

export default function ExcelImportModal({ isOpen, onClose, events = [], activities = [] }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const downloadTemplate = async () => {
    setError(null);
    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      const wsEvents = workbook.addWorksheet('Events');

      // Define single sheet columns
      wsEvents.columns = [
        { header: 'Calender type', key: 'calendarType', width: 16 },
        { header: 'Activity name', key: 'activityName', width: 25 },
        { header: 'Icon', key: 'icon', width: 18 },
        { header: 'Event name', key: 'eventName', width: 25 },
        { header: 'Start date', key: 'startDate', width: 20 },
        { header: 'End date', key: 'endDate', width: 20 },
        { header: 'Color', key: 'color', width: 16 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'CTA text', key: 'ctaText', width: 18 },
        { header: 'CTA link', key: 'ctaLink', width: 30 }
      ];

      // Populate sheet with active events & activities
      const actMap = {};
      (activities || []).forEach(a => { actMap[a.id] = a; });

      if (events && events.length > 0) {
        events.forEach(ev => {
          const act = actMap[ev.activityId] || {};
          const actName = act.name || ev.activityName || ev.category || 'General';
          const calType = act.calendarType || ev.calendarType || 'Finance';
          const iconName = act.icon || ev.icon || '';

          const sMoStr = FULL_MONTH_NAMES[(ev.startMonth || 1) - 1] || 'August';
          const eMoStr = FULL_MONTH_NAMES[(ev.endMonth || ev.startMonth || 1) - 1] || sMoStr;
          const yr = ev.year || 2026;
          const sDayNum = Math.min(28, Math.max(1, ((ev.startWeek || 1) - 1) * 7 + 1));
          const eDayNum = Math.min(28, Math.max(1, ((ev.endWeek || ev.startWeek || 1) - 1) * 7 + 5));

          const sDateStr = ev.startDateStr || `${sDayNum} ${sMoStr} ${yr}`;
          const eDateStr = ev.endDateStr || `${eDayNum} ${eMoStr} ${yr}`;

          wsEvents.addRow({
            calendarType: calType,
            activityName: actName,
            icon: iconName,
            eventName: ev.label ? ev.label.replace(/\\n/g, '\n') : '',
            startDate: sDateStr,
            endDate: eDateStr,
            color: formatColorForExcel(ev.color),
            description: ev.description || '',
            ctaText: ev.ctaText || ev.cta_text || '',
            ctaLink: ev.ctaLink || ev.cta_link || ev.ctaUrl || ev.link || ''
          });
        });
      } else {
        wsEvents.addRow({
          calendarType: 'Finance',
          activityName: 'Communications',
          icon: 'MessageSquare',
          eventName: 'Q1 Comm Plan',
          startDate: '17 August 2026',
          endDate: '20 September 2026',
          color: 'Primary Blue',
          description: 'Initial planning for Q1.',
          ctaText: 'View Details',
          ctaLink: 'https://example.com/details'
        });
      }

      // Style header row (Cobalt Blue background, White text, 30px height)
      const headerRow = wsEvents.getRow(1);
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E49E2' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });

      // Data validation dropdown lists
      const calendarTypeListString = '"Finance,Learning"';
      const colorListString = '"Primary Blue,Cobalt Blue,Dark Blue,Light Blue,Pacific Blue,Purple,Pink"';

      // Apply Calender type validation (Column A)
      wsEvents.dataValidations.add('A2:A100', {
        type: 'list',
        allowBlank: true,
        formulae: [calendarTypeListString]
      });

      // Apply Color validation (Column G)
      wsEvents.dataValidations.add('G2:G100', {
        type: 'list',
        allowBlank: true,
        formulae: [colorListString]
      });

      // Apply Excel Conditional Formatting preview on Color column (G2:G100)
      try {
        const COLOR_PALETTE = [
          { name: 'Primary Blue', hex: 'FF00338D' },
          { name: 'Cobalt Blue', hex: 'FF1E49E2' },
          { name: 'Dark Blue', hex: 'FF0C233C' },
          { name: 'Light Blue', hex: 'FFACEAFF' },
          { name: 'Pacific Blue', hex: 'FF00B8F5' },
          { name: 'Purple', hex: 'FF7213EA' },
          { name: 'Pink', hex: 'FFFD349C' },
        ];

        COLOR_PALETTE.forEach(c => {
          wsEvents.addConditionalFormatting({
            ref: 'G2:G100',
            rules: [
              {
                type: 'cellIs',
                operator: 'equal',
                formulae: [`"${c.name}"`],
                style: {
                  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: c.hex }, bgColor: { argb: c.hex } },
                  font: { color: { argb: c.name === 'Light Blue' ? 'FF0C233C' : 'FFFFFFFF' }, bold: true }
                }
              }
            ]
          });
        });
      } catch (cfError) {
        console.warn("Conditional formatting skipped:", cfError);
      }

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
      setError(err?.message || "Failed to load Excel generator.");
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
        // cellDates: false ensures date numbers or formatted date strings (.w) are kept as-is without UTC shift
        const workbook = XLSX.read(data, { type: 'binary', cellDates: false, cellText: true, cellNF: true });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        if (!sheet) {
          throw new Error("Excel file has no valid sheet.");
        }

        // Read sheet as raw formatted text object array to prevent SheetJS cell value conversions
        const rows = XLSX.utils.sheet_to_json(sheet, { raw: false, dateNF: 'yyyy-mm-dd' });

        if (!rows || rows.length === 0) {
          throw new Error("No data rows found in the uploaded Excel sheet.");
        }

        // Group & extract unique Activities from single sheet rows
        const activityMap = new Map();
        rows.forEach(r => {
          const actName = String(r['Activity name'] || r.activityName || r.activity || r.name || 'General').trim();
          if (!actName) return;
          const calType = String(r['Calender type'] || r.calendarType || r.calendar_type || 'Finance').trim();
          const iconName = String(r['Icon'] || r.icon || '').trim();

          const actId = 'act-' + actName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          if (!activityMap.has(actId)) {
            activityMap.set(actId, {
              id: actId,
              name: actName,
              calendarType: ['Finance', 'Learning'].includes(calType) ? calType : 'Finance',
              icon: iconName || 'Tag'
            });
          } else if (iconName && (!activityMap.get(actId).icon || activityMap.get(actId).icon === 'Tag')) {
            activityMap.get(actId).icon = iconName;
          }
        });
        const formattedActivities = Array.from(activityMap.values());

        // Map events from single sheet rows with auto 1-based indexing for event ID (e.g. ev-1, ev-2)
        const formattedEvents = rows.map((row, idx) => {
          const actName = String(row['Activity name'] || row.activityName || row.activity || 'General').trim();
          const actId = 'act-' + actName.toLowerCase().replace(/[^a-z0-9]/g, '-');

          const startVal = row['Start date'] || row.startDate || row.start_date;
          const endVal = row['End date'] || row.endDate || row.end_date || startVal;

          const dateInfo = extractEventDates(startVal, endVal, 2026, XLSX);
          const parsedColor = parseColor(row['Color'] || row.color);
          const mainColor = parsedColor || '#00338d';

          return {
            id: `ev-${idx + 1}`,
            activityId: actId,
            activityName: actName,
            calendarType: String(row['Calender type'] || row.calendarType || 'Finance').trim(),
            label: String(row['Event name'] || row.eventName || row.label || 'Untitled Event').trim(),
            startMonth: dateInfo.startMonth,
            endMonth: dateInfo.endMonth,
            startDay: dateInfo.startDay,
            endDay: dateInfo.endDay,
            startWeek: dateInfo.startWeek,
            endWeek: dateInfo.endWeek,
            year: dateInfo.year,
            startDateStr: dateInfo.startDateStr,
            endDateStr: dateInfo.endDateStr,
            color: mainColor,
            borderColor: mainColor,
            lineStyle: 'solid',
            isDashed: false,
            isTextOnly: false,
            description: String(row['Description'] || row.description || '').trim(),
            ctaText: String(row['CTA text'] || row.ctaText || '').trim(),
            ctaLink: String(row['CTA link'] || row.ctaLink || '').trim(),
            category: actName
          };
        });

        const finalJson = {
          lastUpdated: Date.now(),
          activities: formattedActivities,
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
