"use client";
import { useCallback, useState, useEffect } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import "../styles.css";
import { PiPianoKeys } from "react-icons/pi";

function MIDIInput({
  id,
  data: { label, value },
  selected,
  ...props
}: NodeProps & { data: { label: string; value: number } }) {
  const { updateNodeData } = useReactFlow();
  const [midiAccess, setMidiAccess] = useState<WebMidi.MIDIAccess | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [note, setNote] = useState<number | null>(null);

  useEffect(() => {
    // Request MIDI access
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      console.warn("WebMIDI is not supported in this browser.");
    }

    // Called when the user grants MIDI access
    function onMIDISuccess(midi: WebMidi.MIDIAccess) {
      setMidiAccess(midi);
      const inputs = Array.from(midi.inputs.values());
      // Connect to the first available MIDI input
      for (let input of inputs) {
        input.onmidimessage = handleMIDIMessage;
      }
    }

    // Called when the user denies MIDI access
    function onMIDIFailure() {
      console.warn("Failed to get MIDI access.");
    }

    // Handle incoming MIDI messages
    function handleMIDIMessage(message: WebMidi.MIDIMessageEvent) {
      const [command, note, velocity] = Array.from(message.data);
      if (command === 144 && velocity > 0) {
        // 144 is note on, velocity > 0 means key press
        setNote(note);
        const hz = midiToFrequency(note);
        setFrequency(hz);
        updateNodeData(id, { value: hz });
      }
    }

    // Convert MIDI note number to frequency (Hz)
    function midiToFrequency(midiNote: number) {
      return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
  }, []);

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <PiPianoKeys />
      <Handle type="source" position={Position.Right} />
      <div className="my-label">{label}</div>
    </div>
  );
}

export default MIDIInput;
