"use client";
import React, { useEffect, useRef } from "react";
import * as Tone from "tone";

const Oscilloscope = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef(new Array(1024).fill(0));

  useEffect(() => {
    // 创建正弦波振荡器
    const oscillator = new Tone.Oscillator({
      frequency: 1, // 频率 440Hz
      type: "sine", // 正弦波
    });

    // 创建一个 Tone.js 的 AnalyserNode
    const analyser = new Tone.Analyser("waveform", 1024); // 1024个数据点的波形
    oscillator.connect(analyser); // 将振荡器连接到 AnalyserNode
    oscillator.toDestination(); // 输出到音频目的地（扬声器）

    oscillator.start(); // 启动振荡器

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 600;
    canvas.height = 300;

    // 绘制波形数据
    const drawWaveform = () => {
      requestAnimationFrame(drawWaveform);

      // 获取波形数据
      const waveform = analyser.getValue();

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制波形
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      for (let i = audioRef.current.length - 1; i > 0; i--) {
        audioRef.current[i] = audioRef.current[i - 1];
      }
      audioRef.current[0] = waveform[0];
      for (let i = 0; i < audioRef.current.length; i++) {
        const x = (i / audioRef.current.length) * canvas.width;
        const y = ((1 + audioRef.current[i]) * canvas.height) / 2; // scale [-1,1] to canvas height
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    drawWaveform(); // 开始绘制波形

    return () => {
      oscillator.stop();
      oscillator.disconnect();
    };
  }, []);

  const handleClick = () => {
    Tone.start();
  };

  const handleClick2 = () => {};

  return (
    <>
      <canvas ref={canvasRef} className="oscilloscope" />
      <button onClick={handleClick}>start</button>
      <button onClick={handleClick2}>start</button>
    </>
  );
};

export default Oscilloscope;
