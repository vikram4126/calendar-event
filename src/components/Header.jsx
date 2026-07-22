import { useState } from 'react'
import { Download, Upload } from 'lucide-react'
import ExcelImportModal from './ExcelImportModal'

function Header({ onExport }) {
  const [isImportOpen, setIsImportOpen] = useState(false);

  return (
    <header className="header">
      {/* ── Left: Logo ── */}
      <div className="header-left">
        <div className="header-logo">
          <img src="/kpmg-logo.svg" alt="KPMG Logo" />
        </div>
      </div>

      {/* ── Right: Export Data ── */}
      <div className="header-right" style={{ display: 'flex', gap: '8px' }}>
        {import.meta.env.DEV && (
          <button className="export-btn" onClick={() => setIsImportOpen(true)} title="Import data from Excel">
            <Upload size={15} style={{ marginRight: '6px' }} /> Import Excel
          </button>
        )}
        {import.meta.env.DEV && (
          <button className="export-btn" onClick={onExport} title="Download current data as JSON">
            <Download size={15} style={{ marginRight: '6px' }} /> Export JSON
          </button>
        )}
      </div>

      <ExcelImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </header>
  )
}

export default Header
