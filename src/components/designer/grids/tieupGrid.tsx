import React, { useRef, useEffect } from 'react';
import type { WifState } from '../../../types/wifData';
import { useGridSettings } from '../../../contexts/GridSettingsContext';

interface TieupGridProps {
  wifState: WifState;
  onTieupUpdate?: (treadleIndex: number, shaftIndex: number, isSelected: boolean) => void;
}

function TieupGrid({ wifState, onTieupUpdate }: TieupGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { cellSize } = useGridSettings();
  
  const shafts = wifState.sections.weaving?.shafts || 4;
  const treadles = wifState.sections.weaving?.treadles || 4;


  
  const drawGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Read tieup data directly from wifState inside the function
    const currentTieupData = wifState.sections.tieup || {};
    
    for (let shaft = 0; shaft < shafts; shaft++) {
      for (let treadle = 0; treadle < treadles; treadle++) {
        const x = treadle * cellSize;
        const y = shaft * cellSize;
        
        // Convert visual position to WIF coordinates
        const wifTreadleNumber = treadle + 1; // Display column 0 = treadle 1
        const wifShaftNumber = shafts - shaft; // Display row 0 = top = shaft 4
        
        // Check if this treadle-shaft combination is selected in WifState
        const treadleShafts = currentTieupData[wifTreadleNumber.toString()] as number[] || [];
        const shouldFill = treadleShafts.includes(wifShaftNumber);
        
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
    
    const treadle = Math.floor(x / cellSize);
    const shaft = Math.floor(y / cellSize);

    if (treadle >= 0 && treadle < treadles && shaft >= 0 && shaft < shafts) {
      // Convert visual coordinates to WIF coordinates
      const wifTreadleNumber = treadle + 1; // Display column 0 = treadle 1
      const wifShaftNumber = shafts - shaft; // Display row 0 = top = shaft 4
      
      // Convert to 0-indexed for callback
      const treadleIndex = treadle; // Already 0-indexed
      const shaftIndex = wifShaftNumber - 1; // Convert 1-indexed shaft to 0-indexed
      
      // Read fresh tieup data from wifState
      const currentTieupData = wifState.sections.tieup || {};
      const treadleShafts = currentTieupData[wifTreadleNumber.toString()] as number[] || [];
      const isCurrentlySelected = treadleShafts.includes(wifShaftNumber);
      
      onTieupUpdate?.(treadleIndex, shaftIndex, !isCurrentlySelected);
    }
  };
  
  useEffect(() => {
    drawGrid();
  }, [wifState.sections.tieup, shafts, treadles, cellSize]);

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