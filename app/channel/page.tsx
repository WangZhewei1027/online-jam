"use client";

import { useEffect, useState } from "react";

// Create AudioContext globally
const audioContext = new (window.AudioContext || window.AudioContext)();

interface SwitchProps {
  onStateChange?: (state: boolean) => void;
  clock: number;
  index: number;
  instrument: number;
  audioBuffers: { [key: string]: AudioBuffer };
}

const Switch: React.FC<SwitchProps> = ({
  onStateChange,
  clock,
  index,
  instrument,
  audioBuffers,
}) => {
  const [enabled, setEnabled] = useState(false);

  const toggleSwitch = () => {
    const newState = !enabled;
    if (onStateChange) {
      onStateChange(newState);
    }
    setEnabled(newState);
  };

  // Play the preloaded sound buffer
  const playSound = (audioBuffer: AudioBuffer) => {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0); // Play immediately
  };

  const handlePlay = (index: number) => {
    const instrument =
      index === 0
        ? "kick"
        : index === 1
          ? "snare"
          : index === 2
            ? "hihat"
            : "crash";

    const buffer = audioBuffers[instrument];
    if (buffer) {
      playSound(buffer); // Play the preloaded sound
    }
  };

  useEffect(() => {
    if (clock === index && enabled) {
      handlePlay(instrument);
    }
  }, [clock, enabled, index, instrument]); // Add all necessary dependencies here

  return (
    <div
      className={`flex items-center justify-center ${
        enabled ? "bg-green-500" : "bg-gray-200"
      } border border-gray-300 p-2 cursor-pointer w-12 h-14 hover:border-4 rounded-lg`}
      onMouseDown={toggleSwitch}
    ></div>
  );
};

export default function PlayTone() {
  const [clock, setClock] = useState(0);
  const [audioBuffers, setAudioBuffers] = useState<{
    [key: string]: AudioBuffer;
  }>({});
  const maxClock = 16;

  // Preload the sounds once
  useEffect(() => {
    const loadSound = async (url: string): Promise<AudioBuffer> => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      return await audioContext.decodeAudioData(arrayBuffer);
    };

    const loadAllSounds = async () => {
      const kick = await loadSound("/drum/kick.wav");
      const snare = await loadSound("/drum/snare.wav");
      const hihat = await loadSound("/drum/hihat.wav");
      const crash = await loadSound("/drum/crash.wav");

      // Cache all the sounds in a single object
      setAudioBuffers({
        kick,
        snare,
        hihat,
        crash,
      });
    };

    loadAllSounds(); // Preload sounds on component mount
  }, []);

  function sequencer() {
    setClock((prev) => (prev + 1) % maxClock);
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      sequencer();
    }, 200);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array to run only once when component mounts

  useEffect(() => {
    console.log("Current Clock: " + clock); // Logging whenever the clock changes
  }, [clock]); // Add clock as dependency here

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-rows-4 grid-flow-col gap-2">
        <div>Kick</div>
        <div>Snare</div>
        <div>HiHat</div>
        <div>Crash</div>
        {[...Array(64)].map((_, index) => (
          <Switch
            key={index} // Add a key to avoid React warning
            clock={clock}
            index={Math.floor(index / 4)}
            instrument={index % 4}
            audioBuffers={audioBuffers} // Pass down preloaded audio buffers
          />
        ))}
      </div>
    </div>
  );
}
