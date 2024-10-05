"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { updateBpm } from "./utils";

export default function Metronome({ roomId }: { roomId: string }) {
  const [bpm, setBpm] = useState(120); // default BPM is 120
  const [isFlashing, setIsFlashing] = useState(false);
  const lastTimeRef = useRef<number>(performance.now()); // Track the last time a tick occurred
  const requestIdRef = useRef<number | null>(null); // Store requestAnimationFrame ID

  const interval = 60000 / bpm; // Calculate the interval based on the BPM

  // Function to play the metronome sound and trigger flash
  const playMetronome = () => {
    setIsFlashing(true);
    const audio = new Audio("/click.mp3"); // Path to your metronome sound
    audio.play();
    setTimeout(() => setIsFlashing(false), 100); // Flash for a short time
  };

  // Function to handle the ticking logic using requestAnimationFrame
  const tick = (currentTime: number) => {
    const delta = currentTime - lastTimeRef.current; // Time since the last tick
    if (delta >= interval) {
      playMetronome();
      lastTimeRef.current = currentTime; // Update the last time a tick occurred
    }
    requestIdRef.current = requestAnimationFrame(tick); // Schedule the next frame
  };

  // Use effect to handle the start/stop of the metronome
  useEffect(() => {
    lastTimeRef.current = performance.now(); // Reset the timer
    requestIdRef.current = requestAnimationFrame(tick); // Start the ticking

    // Update BPM in the database
    updateBpm(roomId, bpm);

    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current); // Stop the metronome on cleanup
      }
    };
  }, [bpm]);

  const increaseBpm = () => {
    setBpm((prevBpm) => (prevBpm < 300 ? prevBpm + 1 : prevBpm)); // Prevent going over 300
  };

  const decreaseBpm = () => {
    setBpm((prevBpm) => (prevBpm > 40 ? prevBpm - 1 : prevBpm)); // Prevent going below 40
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8">
      <div className="block border p-4 w-[300px] rounded-lg">
        <h1 className="text-2xl font-bold mb-4 font-serif text-center">
          Metronome
        </h1>
        <div className="flex items-center justify-center mb-4">
          <Button onClick={decreaseBpm}>-</Button>
          <span className="text-2xl mx-6">{bpm} BPM</span>
          <Button onClick={increaseBpm}>+</Button>
        </div>
        <div className="flex items-center justify-center">
          <div
            className={`w-12 h-12 rounded-full ${
              isFlashing ? "bg-red-500" : "bg-gray-300"
            } transition-all`}
          ></div>
        </div>
      </div>
    </div>
  );
}
