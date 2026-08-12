# KPMG Calendar Events Application

A modern, highly customizable interactive calendar web application built for managing **Finance** and **Learning** events across **Monthly** and **Weekly** grid views. Designed to work seamlessly both as a standalone React app and embedded within dialog applications, web parts, or single-file HTML wrappers across all major browsers including Microsoft Edge and Google Chrome.

---

## 🌟 Key Features

- **Dual Calendar Tabs**: Switch effortlessly between **Finance Calendar** and **Learning Calendar**.
- **Flexible View Modes**: Toggle between **Monthly View** (12-month overview) and **Weekly View** (7-day Monday–Sunday timeline with week-range navigation).
- **Interactive Event Popups**: Click any event bar to reveal a detailed card showing Category, Duration, Owner, and Description. Fully optimized for cross-browser click-outside dismissals (including Edge inside iframe / dialog containers).
- **12-Year Dropdown Navigator**: Easily jump between calendar years using an interactive 4×3 grid selector.
- **Excel Import & Export**: Download standard Excel template (`Calendar_Template.xlsx`), edit data with built-in data validation drop-downs, and upload to generate updated calendar events instantly.
- **Single-File Standalone Builds**: Includes standalone single-file HTML versions (`standalone.html` and `calendar-vanilla.html`) for deployment inside restricted environments or iframe embeds.

---

## 📁 Project Structure

```
calender-events/
├── public/
│   ├── events.json                 # Core calendar data (Activities & Events)
│   └── favicon.svg                 # App brand icon
├── src/
│   ├── components/
│   │   ├── CalendarGrid.jsx        # Grid rendering engine (Lanes, Bars, Month & Week views)
│   │   ├── EventPopup.jsx          # Interactive event details popup overlay
│   │   ├── Header.jsx              # App header, tab navigation, logo, and action buttons
│   │   ├── ExcelImportModal.jsx    # Excel template generator & file parser
│   │   ├── YearSelector.jsx        # Dropdown grid year picker
│   │   └── icons.jsx               # SVG icons for activities
│   ├── App.jsx                     # Top-level state and layout manager
│   ├── index.css                   # Custom CSS design system & tokens
│   └── main.jsx                    # React entry point
├── build_perfect_standalone.py     # Script to package dist build into standalone.html
├── calendar-vanilla.html           # Standalone Vanilla JS calendar implementation
├── standalone.html                 # Single-file bundled HTML application
├── package.json                    # Node dependencies and build scripts
├── EXCEL_GUIDE.md                  # Detailed Excel data update guide
└── README.md                       # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)
- **Python 3** (optional, for running standalone build packaging scripts)

### Installation & Local Development

1. **Clone or open the repository**:
   ```bash
   cd calender-events
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 🛠️ Build Commands

| Command | Action | Output |
| :--- | :--- | :--- |
| `npm run dev` | Starts Vite hot-reload development server | `http://localhost:5173` |
| `npm run build` | Builds bundled single-file distribution | `dist/index.html` |
| `python3 build_perfect_standalone.py` | Inlines bundled JS, CSS, and data into standalone HTML | `standalone.html` |

To create a fresh single-file distribution:
```bash
npm run build && python3 build_perfect_standalone.py
```

---

## 📊 Excel Template & Column Specification

The application supports importing events directly from an Excel file (`Calendar_Template.xlsx`). The Excel workbook consists of two sheets:

### Sheet 1: `Activities`
Defines the row headings on the calendar grid.

| Column Name | Key | Description | Allowed Values / Example |
| :--- | :--- | :--- | :--- |
| **id** | `id` | Unique Activity ID | `a1`, `a2`, `l1` |
| **name** | `name` | Name displayed on left column | `Communications`, `Onboarding` |
| **calendarType** | `calendarType` | Target calendar tab | `Finance`, `Learning` |

### Sheet 2: `Events`
Defines the event bars placed across the calendar.

| Column Name | Key | Mandatory? | Description & Allowed Values |
| :--- | :--- | :---: | :--- |
| **id** | `id` | **Yes** | Unique Event ID (e.g. `ev-101`) |
| **activityId** | `activityId` | **Yes** | Must match an `id` from `Activities` sheet |
| **label** | `label` | **Yes** | Text displayed inside the event bar |
| **startMonth** | `startMonth` | **Yes** | `Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec` (or `1`–`12`) |
| **endMonth** | `endMonth` | No | Ending month for multi-month events (Defaults to `startMonth`) |
| **startDay** | `startDay` | No | Day of week for Weekly view (`Monday` ... `Sunday`) |
| **endDay** | `endDay` | No | End day of week for Weekly view |
| **startWeek** | `startWeek` | No | Week index of the month (`1` to `5`) |
| **endWeek** | `endWeek` | No | End week index of the month (`1` to `5`) |
| **year** | `year` | **Yes** | 4-digit year (e.g. `2024`) |
| **color** | `color` | No | Main background color (`Primary Blue`, `Cobalt Blue`, `Dark Blue`, `Pacific Blue`, `Purple`, `Pink`, `Teal Green`, `Dark Green` or Hex `#00338d`) |
| **borderColor** | `borderColor` | No | Left accent border color |
| **lineStyle** | `lineStyle` | No | Border line style (`solid`, `dashed`, `dotted`, `gradient`) |
| **isDashed** | `isDashed` | No | `true` or `false` |
| **isTextOnly** | `isTextOnly` | No | `true` or `false` |
| **category** | `category` | No | Category name shown in popup |
| **owner** | `owner` | No | Responsible owner / team |
| **description** | `description` | No | Full event description text |

---

## 🌐 Browser & Dialog App Compatibility

- **Capture-Phase Pointer Event Listening**: Handles pointer interactions (`pointerdown`, `mousedown`, `click`, `touchstart`) in the root capture phase, ensuring event popups close reliably when switching tabs or clicking outside—even when embedded inside Microsoft Edge dialog apps, SharePoint web parts, or custom iframe containers.
- **Composed Path & Shadow DOM Support**: Uses `e.composedPath()` to resolve target elements across shadow DOM boundaries and retargeted dialog events.

---

## 📄 License

Internal KPMG Application / Proprietary.
