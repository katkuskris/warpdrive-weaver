import { useRef, useEffect } from 'react';
import type { WifState } from '../../../types/wifData';
import { useGridSettings } from '../../../contexts/GridSettingsContext';

interface DrawdownGridProps {
  wifState: WifState;
}

function DrawdownGrid({ wifState }: DrawdownGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cellSize } = useGridSettings();

  const weftThreads = wifState.sections.weft?.threads || 20;
  
  // Use warp thread count from WIF state, not from threading data
  const warpThreads = wifState.sections.warp?.threads || 20;


  
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Read WIF data directly inside the function
    const threadingData = wifState.sections.threading || {};
    const tieupData = wifState.sections.tieup || {};
    const treadlingData = wifState.sections.treadling || {};
    
    for (let weftThread = 0; weftThread < weftThreads; weftThread++) {
      for (let visualCol = 0; visualCol < warpThreads; visualCol++) {
        const x = visualCol * cellSize;
        const y = weftThread * cellSize;
        
        // Calculate if this cell should be filled based on weaving logic
        const weftShot = weftThread + 1; // Convert 0-indexed to 1-indexed
        const warpThread = warpThreads - visualCol; // Right-to-left thread numbering
        
        // Get which treadle this weft shot uses
        const treadleUsed = treadlingData[weftShot.toString()] as number;
        
        // Get which shafts this treadle engages
        const engagedShafts = tieupData[treadleUsed?.toString()] as number[] || [];
        
        // Get which shaft this warp thread is on
        const threadShaft = threadingData[warpThread.toString()] as number;
        
        // Fill if thread's shaft is engaged by the treadle
        const shouldFill = treadleUsed && threadShaft && engagedShafts.includes(threadShaft);
        
        if (shouldFill) {
          ctx.fillStyle = '#007bff';
          ctx.fillRect(x, y, cellSize, cellSize);
        }
        
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    }
  };
  
  
  useEffect(() => {
    drawGrid();
  }, [wifState.sections.threading, wifState.sections.tieup, wifState.sections.treadling, weftThreads, warpThreads, cellSize]);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={warpThreads * cellSize}
        height={weftThreads * cellSize}
        style={{ 
          border: '1px solid #ccc',
        }}
      />
    </div>
  );
}

export default DrawdownGrid;