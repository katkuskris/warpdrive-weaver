import { useRef, useState } from "react";

interface UploaderProps {
  onOutputChange?: (output: string | null) => void;
}

function Uploader({ onOutputChange }: UploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleButtonClick = () => {
    setError(null); // Only clear error, keep output
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check extension (case-insensitive)
    if (!file.name.toLowerCase().endsWith(".wif")) {
      setError("Please upload a .wif file.");
      setOutput(null); // Clear previous output on error
      onOutputChange?.(null); // Clear output in parent
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const response = await fetch("http://localhost:3001/parse", {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: text,
        });
        if (!response.ok) {
          // Try to extract error message from response
          try {
            const errorData = await response.json();
            const errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
            setError(errorMessage);
            setOutput(null); // Clear previous output on error
            onOutputChange?.(null); // Clear output in parent
          } catch {
            // If response isn't JSON, use status text or generic message
            setError(`Server error: ${response.status} ${response.statusText || 'Unknown error'}`);
            setOutput(null); // Clear previous output on error
            onOutputChange?.(null); // Clear output in parent
          }
          return;
        }
        const data = await response.json();
        const jsonOutput = JSON.stringify(data, null, 2);
        setOutput(jsonOutput); // Only clear error on success
        setError(null);
        onOutputChange?.(jsonOutput); // Pass output back to parent
      } catch (error) {
        // Handle network errors or other exceptions
        if (error instanceof Error) {
          setError(`Failed to parse file: ${error.message}`);
        } else {
          setError("Failed to parse file.");
        }
        setOutput(null); // Clear previous output on error
        onOutputChange?.(null); // Clear output in parent
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setOutput(null); // Clear previous output on error
      onOutputChange?.(null); // Clear output in parent
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    event.target.value = "";
  };

  return (
    <>
      <div className="card">
        <button
          type="button"
          onClick={handleButtonClick}
          style={{
            padding: "0.5em 1.5em",
            fontSize: "1em",
            borderRadius: "4px",
            border: "1px solid #ccc",
            background: "#000",
            cursor: "pointer",
          }}
        >
          Upload WIF File
        </button>
        <input
          type="file"
          accept=".wif"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {output && (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              maxHeight: "300px",
              overflowY: "auto",
              marginTop: "1em",
              background: "#242424",
              padding: "1em",
              borderRadius: "4px",
              border: "1px solid #eee",
            }}
          >
            {output}
          </pre>
        )}
      </div>
      {error && <div style={{ color: "red", marginTop: "1em" }}>{error}</div>}
    </>
  );
}

export default Uploader;
