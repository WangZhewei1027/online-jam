"use client";
import { nanoid } from "nanoid";
import { useStore } from "../utils/store";
import { updateNodesAndEdges } from "@/app/utils";
import { getRoomId } from "@/app/utils";

export function useNodes() {
  const store = useStore();

  const addNode = (type: string, label: string) => {
    const newNode = {
      id: nanoid(6),
      type,
      position: {
        x: store.last_selected_node_position.x + Math.random() * 100,
        y: store.last_selected_node_position.y + Math.random() * 100,
      },
      data: { label },
    };
    console.log("Adding node", newNode);
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
    addMidiGrid: () => addNode("midigrid", "Midi Grid"),
    addReverb: () => addNode("reverb", "Reverb"),
  };
}
