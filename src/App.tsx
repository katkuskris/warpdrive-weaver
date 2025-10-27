import { useState } from "react";
import "./App.css";
import Uploader from "./uploader";
import Designer from "./components/designer/designer";
import { WifObjectFactory } from "./utils/wifObjectFactory";
import type { WifState } from "./types/wifData";
import { GridSettingsProvider } from "./contexts/GridSettingsContext";

function App() {
  const [wifState, setWifState] = useState<WifState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOutputChange = (jsonOutput: string | null) => {
    if (!jsonOutput) {
      setWifState(null);
      setError(null);
      return;
    }

    try {
      const jsonData = JSON.parse(jsonOutput);
      const wifObject = WifObjectFactory.createFromJson(jsonData);
      setWifState(wifObject);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse WIF data');
      setWifState(null);
    }
  };

  return (
    <GridSettingsProvider>
      <div className="root">
        <Uploader 
          onOutputChange={handleOutputChange}
        />
        
        {error && (
          <div style={{ color: 'red', marginTop: '1em' }}>
            Error: {error}
          </div>
        )}
        
        {wifState && <Designer wifState={wifState} />}
      </div>
    </GridSettingsProvider>
  );
}

export default App;
