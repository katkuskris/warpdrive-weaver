import React, { createContext, useContext, useState } from 'react';

interface GridSettings {
  cellSize: number;
  setCellSize: (size: number) => void;
}

const GridSettingsContext = createContext<GridSettings | undefined>(undefined);

export const useGridSettings = () => {
  const context = useContext(GridSettingsContext);
  if (!context) {
    throw new Error('useGridSettings must be used within GridSettingsProvider');
  }
  return context;
};

export const GridSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cellSize, setCellSize] = useState(15); // Default size matching current grids

  return (
    <GridSettingsContext.Provider value={{ cellSize, setCellSize }}>
      {children}
    </GridSettingsContext.Provider>
  );
};