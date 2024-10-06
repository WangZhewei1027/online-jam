"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { updateBpm } from "../utils";
import { createClient } from "@supabase/supabase-js";
import { init } from "next/dist/compiled/webpack/webpack";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Metronome({ roomId }: { roomId: string }) {
  const [bpm, setBpm] = useState(120); // default BPM is 120
  const [isFlashing, setIsFlashing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0); // The time for the next click
  const lookAhead = 0.1; // How far ahead to schedule (in seconds)
  const scheduleAheadTime = 0.1; // How far ahead to schedule audio events
  const [audioEnabled, setAudioEnabled] = useState(false); // Track if AudioContext is enabled

  const interval = 60 / bpm; // Calculate the interval (in seconds)

  // Function to play the "click" sound using Web Audio API
  const playClick = (time: number) => {
    if (!audioContextRef.current) return;

    const osc = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    osc.frequency.value = 2000; // Frequency of the "click"
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
  };

  // Stop the metronome
  const stopMetronome = () => {
    setIsPlaying(false);
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
  }, [bpm]);

  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notes",
          filter: `room=eq.${roomId}`,
        },
        (payload) => {
          console.log("Received update:", payload);
          handlePayload(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // Function to initialize AudioContext
  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new window.AudioContext();
      console.log("AudioContext initialized");
      setAudioEnabled(true); // Mark AudioContext as enabled
    }
  };

  // Function to show alert and initialize AudioContext
  const requestAudioPermission = () => {
    const userConfirmed = window.confirm(
      "This app requires audio permission. Click OK to enable audio."
    );
    if (userConfirmed) {
      initializeAudioContext(); // Initialize AudioContext if user confirmed
      alert("Audio has been enabled. Enjoy!");
    } else {
      alert("Audio permission denied. The app may not function correctly.");
    }
  };

  // Trigger the alert window when the component is first mounted
  useEffect(() => {
    if (!audioEnabled) {
      requestAudioPermission(); // Only show alert if audio has not been enabled yet
    }
  }, [audioEnabled]);

  useEffect(() => {
    const startBackgroundSound = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new window.AudioContext();
      }

      const osc = audioContextRef.current.createOscillator(); // 创建振荡器
      const gainNode = audioContextRef.current.createGain(); // 创建增益节点来控制音量

      osc.frequency.value = 20; // 设置为非常低的频率，例如 20 Hz
      gainNode.gain.value = 0.0001; // 设置非常低的音量，几乎不可听到

      osc.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination); // 连接到音频输出

      osc.start(); // 开始振荡器
      osc.stop(audioContextRef.current.currentTime + 0.1); // 1 秒后停止振荡器
    };
    startBackgroundSound();
    setInterval(() => {
      audioContextRef.current?.resume();
      startBackgroundSound();
      console.log("Resumed");
    }, 500);
  }, []);

  async function handlePayload(payload: any) {
    setIsPlaying(payload.new.metronome);
    if (payload.new.metronome) {
      let interval = (60 / bpm) * 1000;
      const date = new Date(payload.new.clock_start_time);
      const milliseconds = date.getTime();
      console.log("Latency:", Date.now() - milliseconds);
      let timeout = interval - ((Date.now() - milliseconds) % interval);
      console.log("Timeout:", timeout);
      setTimeout(() => {
        stopMetronome();
        startMetronome();
      }, timeout);
    } else {
      stopMetronome();
    }
  }

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
          {/* <Button onClick={decreaseBpm}>-</Button> */}
          <span className="text-2xl mx-6">{bpm} BPM</span>
          {/* <Button onClick={increaseBpm}>+</Button> */}
        </div>
        {/* <div className="flex items-center justify-center mb-4">
          <Button onClick={isPlaying ? stopMetronome : startMetronome}>
            {isPlaying ? "Stop" : "Start"}
          </Button>
        </div> */}
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
