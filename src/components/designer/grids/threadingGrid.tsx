import React, { useRef, useEffect } from 'react';
import type { WifState } from '../../../types/wifData';

interface ThreadingGridProps {
  wifState: WifState;
  onThreadingUpdate?: (threadIndex: number, shaftIndex: number | null) => void;
}

function ThreadingGrid({ wifState, onThreadingUpdate }: ThreadingGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const shafts = wifState.sections.weaving?.shafts || 4;
  // Determine number of threads from the threading data itself
  const threadingData = wifState.sections.threading || {};
  const threadNumbers = Object.keys(threadingData).map(k => parseInt(k));
  const threads = threadNumbers.length > 0 ? Math.max(...threadNumbers) : (wifState.sections.warp?.threads || 20);

  const CELL_SIZE = 15;
  
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Read threading data directly from wifState inside the function
    const currentThreadingData = wifState.sections.threading || {};
    
    for (let shaft = 0; shaft < shafts; shaft++) {
      for (let visualCol = 0; visualCol < threads; visualCol++) {
        const x = visualCol * CELL_SIZE;
        const y = shaft * CELL_SIZE;
        
        // Convert visual position back to WIF coordinates to check if filled
        // visualCol 0 = leftmost, threads-1 = rightmost
        // Thread 1 should be rightmost, so: wifThreadNumber = threads - visualCol
        const wifThreadNumber = threads - visualCol;
        
        // shaft 0 = top row = shaft 4, shaft 3 = bottom row = shaft 1
        // So: wifShaftNumber = shafts - shaft
        const wifShaftNumber = shafts - shaft;
        
        const shouldFill = currentThreadingData[wifThreadNumber.toString()] === wifShaftNumber;
        
        if (shouldFill) {
          ctx.fillStyle = '#007bff';
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        }
        
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
      }
    }
  };
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert click position to visual coordinates
    const visualCol = Math.floor(x / CELL_SIZE); // 0 = leftmost, threads-1 = rightmost
    const displayRow = Math.floor(y / CELL_SIZE); // 0 = top, shafts-1 = bottom
    
    if (visualCol >= 0 && visualCol < threads && displayRow >= 0 && displayRow < shafts) {
      // Convert visual coordinates to WIF coordinates
      const wifThreadNumber = threads - visualCol; // Convert visual column to thread number
      const wifShaftNumber = shafts - displayRow; // Convert visual row to shaft number
      
      // Convert to 0-indexed for callback
      const threadIndex = wifThreadNumber - 1; // 0-indexed thread
      const shaftIndex = wifShaftNumber - 1; // 0-indexed shaft
      
      // Read fresh threading data from wifState
      const currentThreadingData = wifState.sections.threading || {};
      const isCurrentlyFilled = currentThreadingData[wifThreadNumber.toString()] === wifShaftNumber;
      
      onThreadingUpdate?.(threadIndex, isCurrentlyFilled ? null : shaftIndex);
    }
  };
  
  useEffect(() => {
    drawGrid();
  }, [wifState.sections.threading, shafts, threads]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={threads * CELL_SIZE}
        height={shafts * CELL_SIZE}
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