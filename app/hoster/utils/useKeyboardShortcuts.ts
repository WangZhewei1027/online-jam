"use client";
import { useEffect, useRef, useState } from "react";

interface Store {
  nodes: any[];
  undo: () => void;
  redo: () => void;
}

type UpdateFunction = () => void;

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

function applyKeyDownToMIDIInputs(store: Store, frequency: string) {
  const midiInputs = store.nodes.filter((node) => node.type === "midiinput");
  console.log("MIDI Inputs:", midiInputs);
  midiInputs.forEach((node) => {
    if (node.data.handleKeyDownFunction) {
      node.data.handleKeyDownFunction(frequency);
    }
  });
}

function applyKeyUpToMIDIInputs(store: Store) {
  const midiInputs = store.nodes.filter((node) => node.type === "midiinput");
  console.log("MIDI Inputs:", midiInputs);
  midiInputs.forEach((node) => {
    if (node.data.handleKeyUpFunction) {
      node.data.handleKeyUpFunction();
    }
  });
}

const midiToFrequency = (midiNote: number): number =>
  440 * Math.pow(2, (midiNote - 69) / 12);

export function useKeyboardShortcuts(store: Store, update: UpdateFunction) {
  const pressedKeysRef = useRef(new Set<string>());
  const [octaveOffset, setOctaveOffset] = useState(0);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const key = event.key.toLowerCase();

      // 检查是否已经记录按下的键，若已记录则跳过处理
      if (pressedKeysRef.current.has(key)) return;
      pressedKeysRef.current.add(key); // 添加到 pressedKeys 集合

      if (
        (isMac && event.metaKey && key === "s") ||
        (!isMac && event.ctrlKey && key === "s")
      ) {
        event.preventDefault();
        update();
      }
      if (
        (isMac && event.metaKey && key === "z" && !event.shiftKey) ||
        (!isMac && event.ctrlKey && key === "z" && !event.shiftKey)
      ) {
        event.preventDefault();
        store.undo();
      }
      if (
        (isMac && event.metaKey && key === "z" && event.shiftKey) ||
        (!isMac && event.ctrlKey && key === "y")
      ) {
        event.preventDefault();
        store.redo();
      }

      if (key === "z") {
        setOctaveOffset((prev) => Math.max(prev - 1, -2)); // Minimum offset -2
      } else if (key === "x") {
        setOctaveOffset((prev) => Math.min(prev + 1, 2)); // Maximum offset +2
      } else if (whiteKeys[key]) {
        console.log("White key pressed:", key);
        applyKeyDownToMIDIInputs(
          store,
          midiToFrequency(whiteKeys[key] + octaveOffset * 12)
            .toFixed(2)
            .toString()
        );
      } else if (blackKeys[key]) {
        applyKeyDownToMIDIInputs(
          store,
          midiToFrequency(blackKeys[key] + octaveOffset * 12)
            .toFixed(2)
            .toString()
        );
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      pressedKeysRef.current.delete(key); // 从 pressedKeys 集合中移除键

      if (whiteKeys[key]) {
        console.log("White key released:", key);
        applyKeyUpToMIDIInputs(store);
      } else if (blackKeys[key]) {
        applyKeyUpToMIDIInputs(store);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [store, update]);
}
