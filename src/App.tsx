import { useState } from "react";
import "./App.css";
import Uploader from "./uploader";

function App() {
  const [output, setOutput] = useState<string | null>(null);

  const handleOutputChange = (newOutput: string | null) => {
    setOutput(newOutput);
  };

  return (
    <div className="root">
      <Uploader 
        onOutputChange={handleOutputChange}
      />
      {output && (<Canvas />}
      {output && (
        <div style={{ marginTop: "1em" }}>
          <h3>Parsed WIF Data:</h3>
          <pre style={{ background: "#f5f5f5", padding: "1em", borderRadius: "4px" }}>
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
