"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { updateBpm, updateMetronome, updateClockStartTime } from "../utils";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

export default function Metronome({
  roomId,
  setBpmCallback,
}: {
  roomId: string;
  setBpmCallback: (bpm: number) => void;
}) {
  const [bpm, setBpm] = useState(120); // default BPM is 120
  const [isFlashing, setIsFlashing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0); // The time for the next click
  const lookAhead = 0.1; // How far ahead to schedule (in seconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio events

  const interval = 60 / bpm; // Calculate the interval (in seconds)

  // Function to play the "click" sound using Web Audio API
  const playClick = (time: number) => {
    if (!audioContextRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    osc.frequency.value = 1000; // Frequency of the "click"
    gainNode.gain.setValueAtTime(1, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gainNode).connect(audioContextRef.current.destination);
    osc.start(time);
    console.log(time);
    osc.stop(time + 0.05);
  };

  // Scheduler function that schedules clicks in advance
  const schedule = () => {
    if (!audioContextRef.current) return;

    while (
      nextNoteTimeRef.current <
      audioContextRef.current.currentTime + scheduleAheadTime
    ) {
      playClick(nextNoteTimeRef.current); // Schedule the click
      setIsFlashing(true); // Flash for UI feedback
      setTimeout(() => setIsFlashing(false), 100); // Flash for a short time
      nextNoteTimeRef.current += interval; // Move to the next beat
    }

    setTimeout(schedule, lookAhead * 1000); // Check every 100ms
  };

  // Start the metronome
  const startMetronome = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    nextNoteTimeRef.current = audioContextRef.current.currentTime; // Set the first note time
    schedule(); // Start scheduling clicks
    setIsPlaying(true);
    updateMetronome(roomId, true);
  };

  // Stop the metronome
  const stopMetronome = () => {
    setIsPlaying(false);
    updateMetronome(roomId, false);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // Update BPM and restart scheduling if the metronome is playing
  useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }

    // Update BPM in the database
    if (roomId) {
      //updateBpm(roomId, bpm);
    }

    // Call the callback function with the new BPM
    setBpmCallback(bpm);
  }, [bpm]);

  const increaseBpm = () => {
    setBpm((prevBpm) => (prevBpm < 300 ? prevBpm + 1 : prevBpm)); // Prevent going over 300
  };

  const decreaseBpm = () => {
    setBpm((prevBpm) => (prevBpm > 40 ? prevBpm - 1 : prevBpm)); // Prevent going below 40
  };

  const handleSliderChange = (value: number[]) => {
    setBpm(value[0]);
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
        <div className="flex items-center justify-center my-8 px-4">
          <Slider
            value={[bpm]} // Slider accepts an array of values
            min={40} // Minimum BPM
            max={300} // Maximum BPM
            step={1} // Step size
            onValueChange={handleSliderChange} // Update BPM on change
          />
        </div>
        <div className="flex items-center justify-center mb-4">
          <Button onClick={isPlaying ? stopMetronome : startMetronome}>
            {isPlaying ? <VolumeOffIcon /> : <VolumeUpIcon />}
          </Button>
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
