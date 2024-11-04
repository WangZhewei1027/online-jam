"use client";
import React, { useEffect, useRef } from "react";

interface SineWaveProps {
  amplitude?: number;
  frequency: number;
  phase?: number;
  width: number;
  height: number;
  numPoints?: number;
}

const SineWave: React.FC<SineWaveProps> = ({
  amplitude = 50,
  frequency,
  phase = 0,
  width,
  height,
  numPoints = 600,
}) => {
  const pathRef = useRef<SVGPathElement>(null);

  // 生成正弦波路径的函数
  const generateSineWavePath = () => {
    let pathData = `M 0 ${height / 2}`;
    for (let x = 0; x <= numPoints; x++) {
      const y =
        amplitude * Math.sin(frequency * (x / width) * 2 * Math.PI + phase) +
        height / 2;
      pathData += ` L ${x * (width / numPoints)} ${y}`;
    }
    return pathData;
  };

  // 在组件加载时更新路径
  useEffect(() => {
    if (pathRef.current) {
      pathRef.current.setAttribute("d", generateSineWavePath());
    }
  }, [amplitude, frequency, phase, width, height, numPoints]); // 依赖项更新时重绘路径

  return (
    <svg width={width} height={height}>
      <path ref={pathRef} fill="none" stroke="blue" strokeWidth="2" />
    </svg>
  );
};

export default SineWave;
