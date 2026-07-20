import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

function YearSelector({ selectedYear, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // A standard block of years usually has 12 years in a 4x3 grid
  // We'll calculate the block based on the currently viewed block year
  const [blockStartYear, setBlockStartYear] = useState(Math.floor(selectedYear / 12) * 12);
  
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const years = Array.from({ length: 12 }, (_, i) => blockStartYear + i);
  const blockEndYear = blockStartYear + 11;

  const handlePrevBlock = (e) => {
    e.stopPropagation();
    setBlockStartYear(prev => prev - 12);
  };

  const handleNextBlock = (e) => {
    e.stopPropagation();
    setBlockStartYear(prev => prev + 12);
  };

  const handleYearClick = (year) => {
    onChange(year);
    setIsOpen(false);
  };

  return (
    <div className="year-selector-container" ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="year-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'transparent',
          border: 'none',
          fontSize: '14px',
          color: '#666',
          cursor: 'pointer',
          padding: 0
        }}
      >
        <span>{selectedYear}</span>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isOpen && (
        <div 
          className="year-dropdown-menu" 
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '8px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #eee',
            padding: '16px',
            zIndex: 100,
            width: '260px'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
              onClick={() => setIsOpen(false)}
            >
              <span>{blockStartYear} - {blockEndYear}</span>
              <ChevronUp size={14} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handlePrevBlock} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextBlock} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center' }}>
            {years.map(year => (
              <div 
                key={year}
                onClick={() => handleYearClick(year)}
                style={{
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: '6px 4px',
                  borderRadius: '16px',
                  background: year === selectedYear ? 'var(--kpmg-primary-blue)' : 'transparent',
                  color: year === selectedYear ? 'white' : 'var(--text-main)',
                  fontWeight: year === selectedYear ? '600' : '400'
                }}
              >
                {year}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default YearSelector;
