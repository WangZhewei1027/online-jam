import React, { useEffect, useRef, useState } from "react";

const ADSRGraph = ({
  attack,
  decay,
  sustain,
  release,
}: {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the parent container
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 }); // Initial dimensions

  // ResizeObserver to track parent size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height }); // Update dimensions
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;

  // Time scaling
  const totalTime = 2 * 4;
  const attackX = (attack / totalTime) * width; // Pixel-based positioning
  const decayX = attackX + (decay / totalTime) * width;
  const sustainX = decayX + (2 / totalTime) * width; // Assume sustain lasts 20% of width
  const releaseX = sustainX + (release / totalTime) * width;

  // Vertical scaling
  const peakY = 0.1 * height; // Top (10% of height)
  const sustainY = height - sustain * (height * 0.8); // Sustain level (0-100)
  const bottomY = height; // Bottom (max Y)

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
    >
      <svg width={width} height={height}>
        {/* ADSR Path */}
        <path
          d={`M0,${bottomY} 
             L${attackX},${peakY} 
             L${decayX},${sustainY} 
             L${sustainX},${sustainY} 
             L${releaseX},${bottomY}`}
          stroke="#171717" // Black line
          strokeWidth="2"
          fill="none" // Transparent fill
        />
      </svg>
    </div>
  );
};

export default ADSRGraph;
