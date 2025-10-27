import React, { useRef, useEffect } from 'react';
import type { WifState } from '../../../types/wifData';

interface TreadlingGridProps {
  wifState: WifState;
  onTreadlingUpdate?: (weftIndex: number, treadleIndex: number | null) => void;
}

function TreadlingGrid({ wifState, onTreadlingUpdate }: TreadlingGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const CELL_SIZE = 15;

  const treadles = wifState.sections.weaving?.treadles || 4;
  
  // Determine weft threads from treadling data (not threading data)
  const treadlingData = wifState.sections.treadling || {};
  const weftNumbers = Object.keys(treadlingData).map(k => parseInt(k));
  const threads = weftNumbers.length > 0 ? Math.max(...weftNumbers) : (wifState.sections.weft?.threads || 20);
  
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Read treadling data directly from wifState inside the function
    const currentTreadlingData = wifState.sections.treadling || {};
    console.log('🎨 DRAWING treadling grid - drawGrid called with data:', {
      treadlingData: currentTreadlingData,
      treadlingKeys: Object.keys(currentTreadlingData),
      threads: threads,
      treadles: treadles,
      timestamp: new Date().toISOString()
    });
    
    for (let thread = 0; thread < threads; thread++) {
      for (let treadle = 0; treadle < treadles; treadle++) {
        const x = treadle * CELL_SIZE;
        const y = thread * CELL_SIZE;
        
        const weftThreadNumber = thread + 1;
        const treadleNumber = treadle + 1;
        
        const shouldFill = currentTreadlingData[weftThreadNumber.toString()] === treadleNumber;
        
        // Debug cell filling
        if (weftThreadNumber <= 3 && treadleNumber <= 3) { // Only log first few cells to avoid spam
          console.log(`🔍 Cell [${weftThreadNumber},${treadleNumber}]: data=${currentTreadlingData[weftThreadNumber.toString()]}, shouldFill=${shouldFill}`);
        }
        
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
    
    const treadleIndex = Math.floor(x / CELL_SIZE);
    const threadIndex = Math.floor(y / CELL_SIZE);

    if (treadleIndex >= 0 && treadleIndex < treadles && threadIndex >= 0 && threadIndex < threads) {
      const weftThreadNumber = threadIndex + 1;
      const treadleNumber = treadleIndex + 1;
      
      // Read fresh treadling data from wifState
      const currentTreadlingData = wifState.sections.treadling || {};
      const isCurrentlyFilled = currentTreadlingData[weftThreadNumber.toString()] === treadleNumber;
      
      console.log('🖱️ TreadlingGrid click:', {
        weftThreadNumber,
        treadleNumber,
        threadIndex,
        treadleIndex,
        isCurrentlyFilled,
        willSetTo: isCurrentlyFilled ? null : treadleIndex,
        currentData: currentTreadlingData[weftThreadNumber.toString()]
      });
      
      onTreadlingUpdate?.(threadIndex, isCurrentlyFilled ? null : treadleIndex);
    }
  };
  
  useEffect(() => {
    console.log('🔥 TreadlingGrid useEffect FIRED:', {
      treadling: wifState.sections.treadling,
      threads: threads,
      treadles: treadles,
      timestamp: new Date().toISOString()
    });
    drawGrid();
  }, [wifState.sections.treadling, threads, treadles]);

  // Add another useEffect to watch the entire wifState for debugging
  useEffect(() => {
    console.log('🌟 TreadlingGrid wifState changed (any part):', wifState);
  }, [wifState]);

  return (
    <canvas
      ref={canvasRef}
      width={treadles * CELL_SIZE}
      height={threads * CELL_SIZE}
      onClick={handleCanvasClick}
      style={{ 
        border: '1px solid #ccc', 
        cursor: 'pointer',
      }}
    />
  );
}

export default TreadlingGrid;