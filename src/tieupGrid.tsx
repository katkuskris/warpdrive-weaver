import React, { useRef, useEffect, useState } from 'react';
import type { WifState } from './types/wifData';

interface TieupGridProps {
  wifState: WifState;
}

function TieupGrid({ wifState }: TieupGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  
  const shafts = wifState.sections.weaving?.shafts || 4;
  const treadles = wifState.sections.weaving?.treadles || 4;
  const cellSize = 15;

  // Load tieup data from WIF state on mount or when wifState changes
  useEffect(() => {
    const tieupData = wifState.sections.tieup;
    if (!tieupData) return;

    const newSelectedCells = new Set<string>();
    
    // Convert tieup data to selected cells
    // Tieup format: { "1": [2, 4], "2": [1], "3": [], "4": [1, 3] }
    // Where key is treadle number (1-indexed) and value is array of shaft numbers (1-indexed)
    // Use 1-indexed cell IDs: "shaftNum-treadleNum"
    Object.entries(tieupData).forEach(([treadleStr, shaftArray]) => {
      const wifTreadleNum = parseInt(treadleStr); // 1-indexed from WIF
      const shaftNumbers = shaftArray as number[]; // Array of 1-indexed shaft numbers
      
      // Process each shaft in the array
      shaftNumbers.forEach(wifShaftNum => {
        // Use 1-indexed cell IDs to match WIF format
        const cellId = `${wifShaftNum}-${wifTreadleNum}`;
        
        // Only add if within valid ranges
        if (wifTreadleNum >= 1 && wifTreadleNum <= treadles && 
            wifShaftNum >= 1 && wifShaftNum <= shafts) {
          newSelectedCells.add(cellId);
        }
      });
    });
    
    setSelectedCells(newSelectedCells);
  }, [wifState.sections.tieup, shafts, treadles]);
  
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw cells
    for (let shaft = 0; shaft < shafts; shaft++) {
      for (let treadle = 0; treadle < treadles; treadle++) {
        const x = treadle * cellSize;
        const y = shaft * cellSize;
        
        // Convert display positions to 1-indexed WIF coordinates
        // Shafts: bottom-up (bottom shaft = shaft 1)
        const shaftNumber = shafts - shaft; // Convert bottom-up
        const treadleNumber = treadle + 1; // Convert to 1-indexed
        const cellId = `${shaftNumber}-${treadleNumber}`;
        
        // Fill cell if selected
        if (selectedCells.has(cellId)) {
          ctx.fillStyle = '#007bff';
          ctx.fillRect(x, y, cellSize, cellSize);
        }
        
        // Draw cell border
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  };
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const treadleIndex = Math.floor(x / cellSize);
    const shaftIndex = Math.floor(y / cellSize);

    if (treadleIndex >= 0 && treadleIndex < treadles && shaftIndex >= 0 && shaftIndex < shafts) {
      // Convert to 1-indexed WIF coordinates
      const shaftNumber = shafts - shaftIndex; // Bottom-up: bottom = shaft 1
      const treadleNumber = treadleIndex + 1; // Convert to 1-indexed
      const cellId = `${shaftNumber}-${treadleNumber}`;
      
      const newSelected = new Set(selectedCells);
      
      // Toggle cell selection
      if (selectedCells.has(cellId)) {
        newSelected.delete(cellId);
      } else {
        newSelected.add(cellId);
      }
      
      setSelectedCells(newSelected);
    }
  };
  
  useEffect(() => {
    drawGrid();
  }, [selectedCells, shafts, treadles]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={treadles * cellSize}
        height={shafts * cellSize}
        onClick={handleCanvasClick}
        style={{ 
          border: '1px solid #ccc', 
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

export default TieupGrid;