
import { useState, useEffect } from 'react';
import ThreadingGrid from './grids/threadingGrid';
import TreadlingGrid from './grids/treadlingGrid';
import DrawdownGrid from './grids/drawdownGrid';
import TieupGrid from './grids/tieupGrid';
import GridSettings from './GridSettings';
import type { WifState } from '../../types/wifData';


interface DesignerProps {
  wifState: WifState;
}

function Designer({ wifState: initialWifState }: DesignerProps) {
  // Manage WifState locally in Designer
  const [wifState, setWifState] = useState<WifState>(initialWifState);

  // Update local state when props change (e.g., new file loaded)
  useEffect(() => {
    setWifState(initialWifState);
  }, [initialWifState]);

  // Centralized WifState updater - handles nested object creation automatically
  const updateWifSection = (
    sectionName: keyof WifState['sections'],
    updater: (currentSection: any) => any
  ) => {
    setWifState(prevState => ({
      ...prevState,
      sections: {
        ...prevState.sections,
        [sectionName]: updater(prevState.sections[sectionName] || {})
      }
    }));
  };

  // Treadling update handler
  const handleTreadlingUpdate = (weftIndex: number, treadleIndex: number | null) => {
    console.log(`🎯 Designer handleTreadlingUpdate called: weftIndex=${weftIndex}, treadleIndex=${treadleIndex}`);
    const newWifState = { 
      ...wifState,
      sections: {
        ...wifState.sections,
        treadling: { ...wifState.sections.treadling } // Create a new treadling object
      }
    };
    
    // Ensure treadling section exists
    if (!newWifState.sections.treadling) {
      newWifState.sections.treadling = {};
    }
    
    const weftNumber = (weftIndex + 1).toString(); // Convert 0-indexed to 1-indexed string
    
    console.log(`🔄 Before update: weftNumber=${weftNumber}, oldValue=${wifState.sections.treadling?.[weftNumber]}`);
    
    if (treadleIndex === null) {
      // Remove treadling for this weft shot
      delete newWifState.sections.treadling[weftNumber];
      console.log(`🗑️ Removed treadling for weft ${weftNumber}`);
    } else {
      // Set treadling for this weft shot
      const treadleNumber = treadleIndex + 1; // Convert 0-indexed to 1-indexed
      newWifState.sections.treadling[weftNumber] = treadleNumber;
      console.log(`✅ Set treadling for weft ${weftNumber} to treadle ${treadleNumber}`);
    }
    
    console.log(`🆕 New treadling section:`, newWifState.sections.treadling);
    console.log(`🔍 Reference check: old=${wifState.sections.treadling === newWifState.sections.treadling ? 'SAME' : 'DIFFERENT'}`);
    setWifState(newWifState);
  };

  // Threading update handler
  const handleThreadingUpdate = (threadIndex: number, shaftIndex: number | null) => {
    console.log(`🎯 Designer handleThreadingUpdate called: threadIndex=${threadIndex}, shaftIndex=${shaftIndex}`);
    const threadNumber = (threadIndex + 1).toString(); // Convert 0-indexed to 1-indexed string
    
    updateWifSection('threading', (currentThreading) => {
      const newThreading = { ...currentThreading };
      
      if (shaftIndex === null) {
        // Remove threading for this thread
        delete newThreading[threadNumber];
        console.log(`🗑️ Removed threading for thread ${threadNumber}`);
      } else {
        // Set threading for this thread
        const shaftNumber = shaftIndex + 1; // Convert 0-indexed to 1-indexed
        newThreading[threadNumber] = shaftNumber;
        console.log(`✅ Set threading for thread ${threadNumber} to shaft ${shaftNumber}`);
      }
      
      console.log(`🆕 New threading section:`, newThreading);
      return newThreading;
    });
  };

  // Tieup update handler
  const handleTieupUpdate = (treadleIndex: number, shaftIndex: number, isSelected: boolean) => {
    console.log(`🎯 Designer handleTieupUpdate called: treadleIndex=${treadleIndex}, shaftIndex=${shaftIndex}, isSelected=${isSelected}`);
    const treadleNumber = (treadleIndex + 1).toString(); // Convert 0-indexed to 1-indexed string
    const shaftNumber = shaftIndex + 1; // Convert 0-indexed to 1-indexed
    
    updateWifSection('tieup', (currentTieup) => {
      const newTieup = { ...currentTieup };
      const currentShafts = (newTieup[treadleNumber] as number[]) || [];
      
      if (isSelected) {
        // Add shaft to treadle if not already present
        if (!currentShafts.includes(shaftNumber)) {
          newTieup[treadleNumber] = [...currentShafts, shaftNumber].sort();
          console.log(`✅ Added shaft ${shaftNumber} to treadle ${treadleNumber}`);
        }
      } else {
        // Remove shaft from treadle
        newTieup[treadleNumber] = currentShafts.filter(s => s !== shaftNumber);
        console.log(`🗑️ Removed shaft ${shaftNumber} from treadle ${treadleNumber}`);
      }
      
      console.log(`🆕 New tieup section:`, newTieup);
      return newTieup;
    });
  };

    return (
        <div>
            <h2>Weaving Designer</h2>
            <GridSettings />
            <div className="weaving-draft-layout">
                {/* Top Row */}
                <div className="top-row">
                    <div className="threading-section">
                        <ThreadingGrid 
                            wifState={wifState} 
                            onThreadingUpdate={handleThreadingUpdate}
                        />
                    </div>
                    <div className="tieup-section">
                        <TieupGrid 
                            wifState={wifState} 
                            onTieupUpdate={handleTieupUpdate}
                        />
                    </div>
                </div>
                
                {/* Bottom Row */}
                <div className="bottom-row">
                    <div className="drawdown-section">
                        <DrawdownGrid wifState={wifState} />
                    </div>
                    <div className="treadling-section">
                        <TreadlingGrid 
                            wifState={wifState} 
                            onTreadlingUpdate={handleTreadlingUpdate}
                        />
                    </div>
                </div>
            </div>
            
            {/* WifState Debug Display */}
            <div style={{ marginTop: '2em', padding: '1em', border: '1px solid #ccc', borderRadius: '4px' }}>
                <h3>Current WifState</h3>
                <pre style={{ 
                    backgroundColor: '#242424', 
                    padding: '1em', 
                    borderRadius: '4px', 
                    overflow: 'auto', 
                    maxHeight: '300px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    {JSON.stringify(wifState, null, 2)}
                </pre>
            </div>
        </div>
    );
}

export default Designer;