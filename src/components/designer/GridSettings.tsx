import React from 'react';
import { useGridSettings } from '../../contexts/GridSettingsContext';

function GridSettings() {
  const { cellSize, setCellSize } = useGridSettings();
  
  return (
    <div style={{ 
      padding: '1rem', 
      border: '1px solid #ccc', 
      borderRadius: '4px',
      marginBottom: '1rem'
    }}>
      <h3>Grid Settings</h3>
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Cell Size: 
          <input 
            type="range" 
            min="10" 
            max="30" 
            value={cellSize}
            onChange={(e) => setCellSize(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: '3rem' }}>{cellSize}px</span>
        </label>
      </div>
    </div>
  );
}

export default GridSettings;