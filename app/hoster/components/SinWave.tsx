"use client";
import React, { useEffect, useRef, useState } from "react";

const SineWave = ({ frequency }: { frequency: number }) => {
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

  // Generate sine wave path
  const generateSineWavePath = (): string => {
    const amplitude = height / 2 - 10; // Wave amplitude
    const centerY = height / 2; // Vertical center
    const points = 100; // Number of points to render
    const step = width / points; // Horizontal step size

    let path = `M0,${centerY}`;

    for (let i = 0; i <= points; i++) {
      const x = i * step;
      const y = centerY + amplitude * Math.sin((x * 2 * Math.PI) / wavelength);
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
        {/* Background grid (optional) */}
        <rect width="100%" height="100%" fill="transparent" />
        {/* Sine wave */}
        <path
          d={generateSineWavePath()}
          stroke="#000"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default SineWave;
