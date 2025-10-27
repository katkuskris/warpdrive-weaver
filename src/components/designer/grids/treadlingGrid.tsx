import React, { useRef, useEffect } from 'react';
import type { WifState } from '../../../types/wifData';
import { useGridSettings } from '../../../contexts/GridSettingsContext';

interface TreadlingGridProps {
  wifState: WifState;
  onTreadlingUpdate?: (weftIndex: number, treadleIndex: number | null) => void;
}

function TreadlingGrid({ wifState, onTreadlingUpdate }: TreadlingGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cellSize } = useGridSettings();

  const treadles = wifState.sections.weaving?.treadles || 4;
  
  // Use weft thread count from WIF state, not from treadling data
  const threads = wifState.sections.weft?.threads || 20;
  
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
        const x = treadle * cellSize;
        const y = thread * cellSize;
        
        const weftThreadNumber = thread + 1;
        const treadleNumber = treadle + 1;
        
        const shouldFill = currentTreadlingData[weftThreadNumber.toString()] === treadleNumber;
        
        // Debug cell filling
        if (weftThreadNumber <= 3 && treadleNumber <= 3) { // Only log first few cells to avoid spam
          console.log(`🔍 Cell [${weftThreadNumber},${treadleNumber}]: data=${currentTreadlingData[weftThreadNumber.toString()]}, shouldFill=${shouldFill}`);
        }
        
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
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const treadleIndex = Math.floor(x / cellSize);
    const threadIndex = Math.floor(y / cellSize);

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
  }, [wifState.sections.treadling, threads, treadles, cellSize]);

  // Add another useEffect to watch the entire wifState for debugging
  useEffect(() => {
    console.log('🌟 TreadlingGrid wifState changed (any part):', wifState);
  }, [wifState]);

  return (
    <canvas
      ref={canvasRef}
      width={treadles * cellSize}
      height={threads * cellSize}
      onClick={handleCanvasClick}
      style={{ 
        border: '1px solid #ccc', 
        cursor: 'pointer',
      }}
    />
  );
}

export default TreadlingGrid;