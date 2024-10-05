"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateBpm } from "./utils";

export default function Metronome({ roomId }: { roomId: string }) {
  const [bpm, setBpm] = useState(120); // default BPM is 120
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const interval = 60000 / bpm; // Calculate interval based on BPM
    const delayInterval = Date.now() % interval; // Delay to sync with the beat
    var metronomeInterval: NodeJS.Timeout;
    var delay: NodeJS.Timeout;
    metronomeInterval = setInterval(() => {
      setIsFlashing(true);
      const audio = new Audio("/click.mp3"); // Path to your metronome sound
      audio.play();
      setTimeout(() => setIsFlashing(false), 100); // Flash for a short time
    }, interval);

    // Update BPM in the database
    updateBpm(roomId, bpm);

    return () => {
      clearInterval(metronomeInterval);
      clearTimeout(delay);
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
