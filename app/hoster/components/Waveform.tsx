"use client";
import React, { useEffect, useRef, useState } from "react";
import "@/app/globals.css";

const Waveform = ({
  frequency,
  waveform,
}: {
  frequency: number;
  waveform: "sine" | "square" | "triangle" | "sawtooth";
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 100 });

  // Map frequency (20-2000 Hz) to a wavelength (pixels per cycle)
  const mapFrequencyToWavelength = (freq: number): number => {
    const minFreq = 20;
    const maxFreq = 2000;
    const minWavelength = 20; // Shortest wavelength
    const maxWavelength = 100; // Longest wavelength
    return (
      maxWavelength -
      ((freq - minFreq) / (maxFreq - minFreq)) * (maxWavelength - minWavelength)
    );
  };

  const wavelength = mapFrequencyToWavelength(frequency);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const { width, height } = dimensions;

  // Generate path for the selected waveform
  const generateWaveformPath = (): string => {
    const amplitude = height / 2 - 10; // Wave amplitude
    const centerY = height / 2; // Vertical center
    const points = 100; // Number of points to render
    const step = width / points; // Horizontal step size

    let path = `M0,${centerY}`;

    for (let i = 0; i <= points; i++) {
      const x = i * step;
      let y = centerY;

      // Compute y based on waveform type
      const phase = (x * 2 * Math.PI) / wavelength;
      switch (waveform) {
        case "sine":
          y = centerY + amplitude * Math.sin(phase);
          break;
        case "square":
          y =
            phase % (2 * Math.PI) < Math.PI
              ? centerY - amplitude
              : centerY + amplitude;
          break;
        case "triangle":
          y = centerY + amplitude * (2 / Math.PI) * Math.asin(Math.sin(phase));
          break;
        case "sawtooth":
          y =
            centerY +
            amplitude *
              (2 *
                (phase / (2 * Math.PI) -
                  Math.floor(phase / (2 * Math.PI) + 0.5)));
          break;
        default:
          y = centerY;
      }

      path += ` L${x},${y}`;
    }

    return path;
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        <rect width="100%" height="100%" fill="transparent" />
        <path
          d={generateWaveformPath()}
          strokeWidth="2"
          fill="none"
          stroke="hsl(var(--primary))"
        />
      </svg>
    </div>
  );
};

export default Waveform;
