import React, { useRef, useEffect, useState } from 'react';
import type { WifState } from './types/wifData';

interface ThreadingGridProps {
  wifState: WifState;
}

function ThreadingGrid({ wifState }: ThreadingGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  
  const shafts = wifState.sections.weaving?.shafts || 4;
  // Determine number of threads from the threading data itself
  const threadingData = wifState.sections.threading || {};
  const threadNumbers = Object.keys(threadingData).map(k => parseInt(k));
  const threads = threadNumbers.length > 0 ? Math.max(...threadNumbers) : (wifState.sections.warp?.threads || 20);
  const cellSize = 15;

  // Load threading data from WIF state on mount or when wifState changes
  useEffect(() => {
    const threadingData = wifState.sections.threading;
    if (!threadingData) return;

    const newSelectedCells = new Set<string>();
    
    // Convert threading data to selected cells
    // Threading format: { "1": 2, "2": 1, "3": 4, ... }
    // Where key is thread number (1-indexed) and value is shaft number (1-indexed)
    // Use 1-indexed cell IDs to match WIF format
    Object.entries(threadingData).forEach(([threadStr, shaftNum]) => {
      const wifThreadNum = parseInt(threadStr); // 1-indexed from WIF
      const wifShaftNum = shaftNum as number; // 1-indexed from WIF
      
      // Use 1-indexed cell IDs: "shaftNum-threadNum"
      const cellId = `${wifShaftNum}-${wifThreadNum}`;
      
      // Only add if within valid ranges
      if (wifThreadNum >= 1 && wifThreadNum <= threads && 
          wifShaftNum >= 1 && wifShaftNum <= shafts) {
        newSelectedCells.add(cellId);
      }
    });
    
    setSelectedCells(newSelectedCells);
  }, [wifState.sections.threading, shafts, threads]);
  
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw cells
    for (let shaft = 0; shaft < shafts; shaft++) {
      for (let visualCol = 0; visualCol < threads; visualCol++) {
        const x = visualCol * cellSize;
        const y = shaft * cellSize;
        
        // Convert display positions to 1-indexed WIF coordinates
        const shaftNumber = shaft + 1; // Convert to 1-indexed
        // For right-to-left display: rightmost col = thread 1, leftmost = thread max
        const threadNumber = threads - visualCol; // Convert visual position to thread number
        const cellId = `${shaftNumber}-${threadNumber}`;
        
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
    
    const visualCol = Math.floor(x / cellSize); // 0 = leftmost, threads-1 = rightmost
    const displayRow = Math.floor(y / cellSize); // 0 = top shaft
    
    if (visualCol >= 0 && visualCol < threads && displayRow >= 0 && displayRow < shafts) {
      // Convert to 1-indexed WIF coordinates
      const shaftNumber = displayRow + 1; // Convert to 1-indexed
      const threadNumber = threads - visualCol; // Right-to-left: rightmost = thread 1
      const cellId = `${shaftNumber}-${threadNumber}`;
      
      const newSelected = new Set(selectedCells);
      
      // Remove any existing selection in this thread (column in WIF terms)
      for (let s = 1; s <= shafts; s++) {
        const existingCellId = `${s}-${threadNumber}`;
        newSelected.delete(existingCellId);
      }
      
      // If clicking different cell, select it
      if (!selectedCells.has(cellId)) {
        newSelected.add(cellId);
      }
      
      setSelectedCells(newSelected);
    }
  };
  
  useEffect(() => {
    drawGrid();
  }, [selectedCells, shafts, threads]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={threads * cellSize}
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

export default ThreadingGrid;