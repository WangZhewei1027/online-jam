"use client";
import React, { useEffect, useRef } from "react";
import * as Tone from "tone";

function drawCircle(ctx: any, x: any, y: any, r: any) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI); // Draw the circle
  ctx.fillStyle = "rgba(255,255,255,0.8)"; // Fill color
  ctx.fill(); // Fill the circle
  ctx.strokeStyle = "white"; // Stroke color
  ctx.lineWidth = 1; // Line width
  ctx.stroke(); // Draw the outline
}

const CircularFFTAnalyzer = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fftRef = useRef<Tone.FFT | null>(null);

  useEffect(() => {
    // Initialize Tone.js FFT
    fftRef.current = new Tone.FFT(1024); // Adjust bins for circular detail
    Tone.Master.connect(fftRef.current);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      if (!fftRef.current || !ctx) return;

      // Get FFT values and normalize
      const values = fftRef.current.getValue();
      const numValues = values.length;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const radius = Math.min(canvasWidth, canvasHeight) / 7; // Base radius of the circle

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Background style
      // ctx.fillStyle = "#000";
      // ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw circular FFT visualization
      //ctx.beginPath();
      values.forEach((value, i) => {
        //console.log(value);
        var amplitude = 200 - Math.abs(value as number); // Normalize
        if (amplitude < 0) {
          amplitude = 0;
        }
        const angle = (i / numValues) * 2 * Math.PI; // Map to 360 degrees
        const distance = radius + 2 * amplitude; // Map amplitude to radius

        const x = centerX + distance * Math.cos(angle); // Polar to Cartesian
        const y = centerY + distance * Math.sin(angle);

        drawCircle(ctx, x, y, 1);

        // if (i === 0) {
        //   ctx.moveTo(x, y);
        // } else {
        //   ctx.lineTo(x, y);
        // }
      });
      //ctx.closePath();

      // // Gradient stroke for the circle
      // const gradient = ctx.createRadialGradient(
      //   centerX,
      //   centerY,
      //   radius,
      //   centerX,
      //   centerY,
      //   radius * 1.5
      // );
      // gradient.addColorStop(0, "hsl(200, 100%, 50%)");
      // gradient.addColorStop(0.5, "hsl(340, 100%, 50%)");
      // gradient.addColorStop(1, "hsl(60, 100%, 50%)");
      // ctx.strokeStyle = gradient;
      // ctx.lineWidth = 4;
      // ctx.stroke();

      // Request next animation frame
      requestAnimationFrame(render);
    };

    // Start rendering loop
    render();

    return () => {
      // Cleanup on unmount
      if (fftRef.current) {
        Tone.Master.disconnect(fftRef.current);
        fftRef.current.dispose();
        fftRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "transparent", // Transparent background
          pointerEvents: "none", // Allow click-through
          zIndex: "1000",
        }}
      />
      {/* <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50" /> */}
    </>
  );
};

export default CircularFFTAnalyzer;
