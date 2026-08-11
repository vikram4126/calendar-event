import json
import os
import re

ROOT = '/Users/vikram/Desktop/Antigravity/calender-events'

def build_standalone():
    with open(os.path.join(ROOT, 'public/events.json'), 'r') as f:
        events_data = json.load(f)

    with open(os.path.join(ROOT, 'src/index.css'), 'r') as f:
        css = f.read()

    # We will build a vanilla JS version because converting 7 React components
    # to work without imports/exports in a single file via Babel is messy and slow.
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calendar - Single File Version</title>
    <style>
        {css}
        
        /* Additional overrides for vanilla JS version */
        .calendar-table {{ border-collapse: collapse; width: 100%; }}
        .calendar-table th {{ padding: 10px; border-bottom: 1px solid var(--border-color); text-align: left; color: var(--text-muted); font-size: 13px; }}
        .calendar-table td {{ border-bottom: 1px solid var(--grid-line); }}
        .activity-name {{ padding: 10px; font-weight: 600; font-size: 14px; width: 200px; }}
        .event-bar {{ display: flex; align-items: center; padding: 0 8px; font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }}
        .event-label {{ overflow: hidden; text-overflow: ellipsis; }}
    </style>
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <div class="header-logo">
                    <h2 style="margin:0;color:white;">Calendar App</h2>
                </div>
                <div class="tabs main-nav">
                    <button class="tab active" data-tab="Finance">Finance</button>
                    <button class="tab" data-tab="Learning">Learning</button>
                </div>
            </div>
        </header>

        <main class="calendar-main" style="padding: 24px; overflow-y: auto; flex: 1;">
            <div class="calendar-header-top" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px;">
                <div class="header-left-col" style="display: flex; flex-direction: column; gap: 4px;">
                    <h1 class="calendar-title" style="font-size: 18px; font-weight: bold; margin: 0;" id="tabTitle">Finance Calendar</h1>
                    <select id="yearSelect" style="padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                    </select>
                </div>
                <div class="header-right-col">
                    <div class="view-mode-tabs tabs">
                        <button class="tab active" data-view="Monthly">Monthly</button>
                    </div>
                </div>
            </div>

            <div class="calendar-grid-wrapper" style="overflow-x: auto;">
                <table class="calendar-table" style="min-width: 800px;">
                    <thead>
                        <tr id="calendarHeaders">
                            <!-- Headers injected via JS -->
                        </tr>
                    </thead>
                    <tbody id="calendarBody">
                        <!-- Content injected via JS -->
                    </tbody>
                </table>
            </div>
        </main>
    </div>

    <script>
        // ==========================================
        // UPDATE YOUR EVENTS DATA HERE
        // ==========================================
        const DATA = {json.dumps(events_data, indent=2)};

        // ==========================================
        // APPLICATION LOGIC
        // ==========================================
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let state = {{
            activeTab: 'Finance',
            year: 2024
        }};

        function render() {{
            document.getElementById('tabTitle').innerText = state.activeTab + ' Calendar';
            
            // Update tabs
            document.querySelectorAll('.main-nav .tab').forEach(btn => {{
                btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
            }});

            // Filter activities and events
            const tabActivities = DATA.activities.filter(a => a.calendarType === state.activeTab);
            const tabActivityIds = new Set(tabActivities.map(a => a.id));
            
            const activeEvents = DATA.events.filter(e => 
                tabActivityIds.has(e.activityId) && e.year === state.year
            ).map(e => ({{
                ...e,
                _start: e.startMonth - 1,
                _end: (e.endMonth || e.startMonth) - 1
            }}));

            const visibleActivities = tabActivities.filter(a => 
                activeEvents.some(e => e.activityId === a.id)
            );

            renderGrid(visibleActivities, activeEvents);
        }}

        function getBarStyle(event) {{
            const c = event.color || '#2563eb';
            const borderC = event.borderColor || c;
            const lightBg = c.length === 7 ? c + '26' : 'rgba(0,0,0,0.05)';

            if (event.isTextOnly) {{
                return `height: 24px; background: transparent; border: none; border-radius: 4px; color: ${{borderC}};`;
            }}
            if (event.isDashed) {{
                return `height: 24px; background: ${{lightBg}}; border: none; border-left: 4px dashed ${{borderC}}; border-radius: 4px; color: #111;`;
            }}
            return `height: 24px; background: ${{lightBg}}; border: none; border-left: 4px solid ${{borderC}}; border-radius: 4px; color: #111;`;
        }}

        function assignLanes(events) {{
            const sorted = [...events].sort((a, b) => a._start - b._start);
            const laneEnd = [];
            const result = [];

            for (const ev of sorted) {{
                const start = ev._start;
                const end = Math.max(ev._end, start);
                let lane = -1;
                for (let i = 0; i < laneEnd.length; i++) {{
                    if (start > laneEnd[i]) {{ lane = i; break; }}
                }}
                if (lane === -1) {{ lane = laneEnd.length; laneEnd.push(-1); }}
                laneEnd[lane] = end;
                result.push({{ ...ev, lane }});
            }}
            return {{ laned: result, laneCount: Math.max(laneEnd.length, 1) }};
        }}

        function renderGrid(activities, events) {{
            const headersRow = document.getElementById('calendarHeaders');
            const tbody = document.getElementById('calendarBody');
            
            // Render Headers
            headersRow.innerHTML = `<th class="activity-col">Activity</th>` + 
                MONTHS.map(m => `<th>${{m}} ${{String(state.year).slice(-2)}}</th>`).join('');

            // Render Body
            if (activities.length === 0) {{
                tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding: 40px; color: var(--text-muted);">No events found for ${{state.year}}.</td></tr>`;
                return;
            }}

            const ROW_PADDING_TOP = 14;
            const ROW_PADDING_BOTTOM = 8;
            const LANE_HEIGHT = 34;
            const LABEL_OFFSET = 4;
            const numCols = 12;

            let html = '';
            for (const activity of activities) {{
                const rowEvents = events.filter(e => e.activityId === activity.id);
                const {{ laned, laneCount }} = assignLanes(rowEvents);
                const rowH = ROW_PADDING_TOP + laneCount * LANE_HEIGHT + ROW_PADDING_BOTTOM;

                html += `<tr>
                    <td class="activity-name" style="height: ${{rowH}}px;">
                        ${{activity.name}}
                    </td>
                    <td colspan="12" style="padding: 0; position: relative; height: ${{rowH}}px;">
                        <div style="display: flex; position: absolute; inset: 0; pointer-events: none;">
                            ${{Array.from({{length: 12}}).map((_, i) => `<div style="flex: 1; border-right: ${{i < 11 ? '1px solid var(--grid-line)' : 'none'}};"></div>`).join('')}}
                        </div>`;

                for (const event of laned) {{
                    const startVal = event._start;
                    const endVal = event._end;
                    const leftPct = (startVal / numCols) * 100;
                    const widthPct = ((endVal - startVal + 1) / numCols) * 100;
                    const barStyle = getBarStyle(event);
                    const laneTop = ROW_PADDING_TOP + event.lane * LANE_HEIGHT + LABEL_OFFSET;

                    html += `
                        <div class="event-bar" style="position: absolute; left: calc(${{leftPct}}% + 4px); width: calc(${{widthPct}}% - 8px); top: ${{laneTop}}px; cursor: pointer; ${{barStyle}}" title="${{event.description || event.label}}">
                            <div class="event-label">${{event.label.replace(/\\n/g, ' ')}}</div>
                        </div>
                    `;
                }}

                html += `</td></tr>`;
            }}

            tbody.innerHTML = html;
        }}

        // Setup Event Listeners
        document.querySelectorAll('.main-nav .tab').forEach(btn => {{
            btn.addEventListener('click', (e) => {{
                state.activeTab = e.target.dataset.tab;
                render();
            }});
        }});

        document.getElementById('yearSelect').addEventListener('change', (e) => {{
            state.year = parseInt(e.target.value);
            render();
        }});

        // Initial render
        render();

    </script>
</body>
</html>
"""

    with open(os.path.join(ROOT, 'standalone.html'), 'w') as f:
        f.write(html)
    
    print("Standalone version created at standalone.html")

if __name__ == '__main__':
    build_standalone()
