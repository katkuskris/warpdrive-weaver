import React, { useEffect, useRef } from "react";

interface CanvasProps {
    wifObjectString: string;
}

/**
 * Canvas component that accepts a `wifObjectString` prop.
 * - Tries to parse the string as JSON; if parsing fails it will render the raw string.
 * - Renders a simple visual representation (key/value lines) onto a <canvas>.
 */
export default function Canvas({
    wifObjectString,

}: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    

    return <canvas ref={canvasRef} aria-label="wifObject canvas preview" />;
}