import React, { useEffect, useState } from "react";

export default function MasterVolumeControl({ Tone }: { Tone: any }) {
  const [volume, setVolume] = useState(0.5); // Default volume (50%)
  const [gainNode, setGainNode] = useState<Tone.Gain | null>(null);

  // Initialize the Tone.js Gain node and connect to destination (speakers)
  useEffect(() => {
    const masterGain = new Tone.Gain(volume).toDestination();
    setGainNode(masterGain);

    // Cleanup on unmount
    return () => {
      masterGain.dispose();
    };
  }, []);

  // Handle volume change
  const handleVolumeChange = (event: { target: { value: string } }) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);

    if (gainNode) {
      gainNode.gain.value = newVolume;
    }
  };

  return (
    <div className="p-4">
      <label
        htmlFor="volume-slider"
        className="block text-sm font-medium text-gray-700"
      >
        Master Volume
      </label>
      <input
        id="volume-slider"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
      <div className="text-center mt-2 text-gray-700">
        Volume: {(volume * 100).toFixed(0)}%
      </div>
    </div>
  );
}
