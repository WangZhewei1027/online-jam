"use client";
import { useEffect, useState, Profiler, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import {
  useStore,
  StoreState,
  getHandleConnections,
  getNodeData,
  updateNode,
} from "../store";
import { shallow } from "zustand/shallow";
import { PiPianoKeys } from "react-icons/pi";

// Store selector to subscribe to all necessary store properties
const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
});

// Map of keyboard keys to MIDI notes for white and black keys
const whiteKeys: Record<string, number> = {
  a: 60, // C4
  s: 62, // D4
  d: 64, // E4
  f: 65, // F4
  g: 67, // G4
  h: 69, // A4
  j: 71, // B4
  k: 72, // C5
};

const blackKeys: Record<string, number> = {
  w: 61, // C#4
  e: 63, // D#4
  t: 66, // F#4
  y: 68, // G#4
  u: 70, // A#4
};

// 定义 data 的类型，要求 label 是 string，midi 是 number
interface MIDIInputData extends Record<string, unknown> {
  label: string;
  midi: number;
}

// 扩展 NodeProps 以包含我们定义的 MIDIInputData 类型
interface MIDIInputProps extends NodeProps {
  data: MIDIInputData;
}

function MIDIInput({ id, data, selected, ...props }: MIDIInputProps) {
  const store = useStore(selector, shallow);

  // Add state for octave offset
  const [octaveOffset, setOctaveOffset] = useState(0);

  // Handle keyboard events to simulate MIDI input
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      let midiNote = null;

      const isMac = navigator.platform.toUpperCase().includes("MAC");

      if (
        (isMac && event.metaKey && key === "s") ||
        (!isMac && event.ctrlKey && key === "s")
      ) {
        return;
      }

      if (key === "z") {
        setOctaveOffset((prev) => Math.max(prev - 1, -2)); // Minimum offset -2
      } else if (key === "x") {
        setOctaveOffset((prev) => Math.min(prev + 1, 2)); // Maximum offset +2
      } else if (whiteKeys[key]) {
        midiNote = whiteKeys[key] + octaveOffset * 12;
      } else if (blackKeys[key]) {
        midiNote = blackKeys[key] + octaveOffset * 12;
      }

      if (midiNote !== null) {
        const frequency = midiToFrequency(midiNote).toFixed(2);
        console.log(`MIDI Note: ${midiNote}, Frequency: ${frequency} Hz`);
        updateNode(id, {
          midi: parseFloat(frequency),
        });
      }
    },
    [octaveOffset]
  );

  const midiToFrequency = (midiNote: number): number =>
    440 * Math.pow(2, (midiNote - 69) / 12);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [handleKeyDown]);

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <PiPianoKeys />
      <div className="text-[8px] text-center mt-1">{octaveOffset}</div>
      <Handle type="source" position={Position.Right} id="midi" />
      <div className="my-label">{data.label}</div>
    </div>
  );
}

export default MIDIInput;
