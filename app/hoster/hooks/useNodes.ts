"use client";
import { nanoid } from "nanoid";
import { useStore } from "../utils/store";

export function useNodes() {
  const store = useStore();

  const addNode = (type: string, label: string) => {
    const newNode = {
      id: nanoid(6),
      type,
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label },
    };
    store.addNode(newNode);
  };

  return {
    addOscillator: () => addNode("oscillator", "Oscillator"),
    addRGBLight: () => addNode("rgbLight", "RGB Light"),
    addNumberInput: () => addNode("numberInput", "Number Input"),
    addDestination: () => addNode("destination", "Destination"),
    addAnalyser: () => addNode("analyser", "Analyser"),
    addSequencer: () => addNode("sequencer", "Sequencer"),
    addMIDIInput: () => addNode("midiinput", "MIDI Input"),
    addValue: () => addNode("value", "Value"),
    addGainNode: () => addNode("gainNode", "Gain Node"),
    addEnvelope: () => addNode("envelope", "Envelope"),
    addText: () => addNode("text", "Text"),
    addXYPad: () => addNode("xypad", "XYPad"),
    addMultiply: () => addNode("multiply", "Multiply"),
  };
}
