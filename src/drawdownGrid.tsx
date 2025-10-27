import React, { useRef, useEffect } from 'react';
import type { WifState } from './types/wifData';

interface DrawdownGridProps {
  wifState: WifState;
}

function DrawdownGrid({ wifState }: DrawdownGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const weftThreads = wifState.sections.weft?.threads || 20;
  
  // Determine number of warp threads from the threading data itself (matching threadingGrid.tsx)
  const threadingData = wifState.sections.threading || {};
  const threadNumbers = Object.keys(threadingData).map(k => parseInt(k));
  const warpThreads = threadNumbers.length > 0 ? Math.max(...threadNumbers) : (wifState.sections.warp?.threads || 20);
  
  const cellSize = 15;

  // Calculate drawdown pattern from threading, tieup, and treadling data
  const getSelectedCells = (): Set<string> => {
    const threadingData = wifState.sections.threading || {};
    const tieupData = wifState.sections.tieup || {};
    const treadlingData = wifState.sections.treadling || {};
    
    console.log('DrawdownGrid getSelectedCells: threadingData =', threadingData);
    console.log('DrawdownGrid getSelectedCells: tieupData =', tieupData);
    console.log('DrawdownGrid getSelectedCells: treadlingData =', treadlingData);
    
    const newSelectedCells = new Set<string>();
    
    // For each weft shot (row in drawdown)
    for (let weftShot = 1; weftShot <= weftThreads; weftShot++) {
      // Get which treadle this weft shot uses
      const treadleUsed = treadlingData[weftShot.toString()] as number;
      if (!treadleUsed) continue; // Skip if no treadle assigned
      
      // Get which shafts this treadle engages
      const engagedShafts = tieupData[treadleUsed.toString()] as number[] || [];
      if (engagedShafts.length === 0) continue; // Skip if treadle engages no shafts
      
      // For each warp thread (column in drawdown)  
      for (let warpThread = 1; warpThread <= warpThreads; warpThread++) {
        // Get which shaft this warp thread is on
        const threadShaft = threadingData[warpThread.toString()] as number;
        if (!threadShaft) continue; // Skip if thread has no shaft assignment
        
        // Check if this thread's shaft is engaged by the treadle
        if (engagedShafts.includes(threadShaft)) {
          // Use 1-indexed cell IDs to match WIF format
          // cellId format: "weftShot-warpThread" (both 1-indexed)
          const cellId = `${weftShot}-${warpThread}`;
          
          // Only add if within valid ranges
          if (weftShot >= 1 && weftShot <= weftThreads && 
              warpThread >= 1 && warpThread <= warpThreads) {
            newSelectedCells.add(cellId);
          }
        }
      }
    }
    
    return newSelectedCells;
  };
  
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get current selected cells from WifState calculation
    const selectedCells = getSelectedCells();
    console.log('DrawdownGrid drawGrid: selectedCells =', Array.from(selectedCells));
    
    // Draw cells
    for (let weftThread = 0; weftThread < weftThreads; weftThread++) {
      for (let visualCol = 0; visualCol < warpThreads; visualCol++) {
        const x = visualCol * cellSize;
        const y = weftThread * cellSize;
        
        // Convert display positions to 1-indexed WIF coordinates
        const weftShotNumber = weftThread + 1; // Convert to 1-indexed
        // For right-to-left display: rightmost col = warp thread 1
        const warpThreadNumber = warpThreads - visualCol; // Convert visual position to thread number
        const cellId = `${weftShotNumber}-${warpThreadNumber}`;
        
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
  
  // const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;
    
  //   const rect = canvas.getBoundingClientRect();
  //   const x = event.clientX - rect.left;
  //   const y = event.clientY - rect.top;
    
  //   const treadle = Math.floor(x / cellSize);
  //   const thread = Math.floor(y / cellSize);

  //   if (treadle >= 0 && treadle < treadles && thread >= 0 && thread < threads) {
  //     const cellId = `${thread}-${treadle}`;
  //     const newSelected = new Set(selectedCells);
      
  //     // Remove any existing selection in this column (thread)
  //     for (let t = 0; t < treadles; t++) {
  //       const existingCellId = `${thread}-${t}`;
  //       newSelected.delete(existingCellId);
  //     }
      
  //     // If clicking the same cell that was selected, leave it unselected
  //     // Otherwise, select the new cell
  //     if (!selectedCells.has(cellId)) {
  //       newSelected.add(cellId);
  //     }
      
  //     setSelectedCells(newSelected);
  //   }
  // };
  
  useEffect(() => {
    console.log('DrawdownGrid: WifState changed, recalculating drawdown...');
    drawGrid();
  }, [wifState.sections.threading, wifState.sections.tieup, wifState.sections.treadling, weftThreads, warpThreads]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={warpThreads * cellSize}
        height={weftThreads * cellSize}
        // onClick={handleCanvasClick}
        style={{ 
          border: '1px solid #ccc', 
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

export default DrawdownGrid;