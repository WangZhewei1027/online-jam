"use client";
import { useEffect, useRef, Profiler } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import "../styles.css";
import { PiPianoKeys } from "react-icons/pi";

import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";
const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
  updateNode: store.updateNode,
});

function MIDIInput({
  id,
  data: { label },
  selected,
  ...props
}: NodeProps & { data: { label: string } }) {
  const store = useStore(selector, shallow);

  // 使用 useRef 来避免不必要的重渲染
  const midiAccessRef = useRef<WebMidi.MIDIAccess | null>(null);
  const noteRef = useRef<number | null>(null);
  const frequencyRef = useRef<number | null>(null);

  useEffect(() => {
    // 请求 MIDI 访问权限
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
    } else {
      console.warn("WebMIDI is not supported in this browser.");
    }

    function onMIDISuccess(midi: WebMidi.MIDIAccess) {
      midiAccessRef.current = midi;
      const inputs = Array.from(midi.inputs.values());
      for (let input of inputs) {
        input.onmidimessage = handleMIDIMessage;
      }
    }

    function onMIDIFailure() {
      console.warn("Failed to get MIDI access.");
    }

    function handleMIDIMessage(message: WebMidi.MIDIMessageEvent) {
      const [command, note, velocity] = Array.from(message.data);
      if (command === 144 && velocity > 0) {
        const hz = midiToFrequency(note);

        // 仅在音符或频率变化时更新数据
        if (noteRef.current !== note || frequencyRef.current !== hz) {
          noteRef.current = note;
          frequencyRef.current = hz;

          store.updateNode(id, { midi: hz, value: hz });
        }
      }
    }

    function midiToFrequency(midiNote: number) {
      return 440 * Math.pow(2, (midiNote - 69) / 12);
    }
  }, [id]);

  function onRenderCallback(
    id: any, // the "id" prop of the Profiler tree that has just committed
    phase: any, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration: any, // time spent rendering the committed update
    baseDuration: any, // estimated time to render the entire subtree without memoization
    startTime: any, // when React began rendering this update
    commitTime: any, // when React committed this update
    interactions: any // the Set of interactions belonging to this update
  ) {
    console.log(`Profiler ID: ${id}, Phase: ${phase}`);
    console.log(`Actual duration: ${actualDuration}`);
    console.log(`Base duration: ${baseDuration}`);
  }

  return (
    <Profiler id="MIDI Input" onRender={onRenderCallback}>
      <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
        <PiPianoKeys />
        <Handle type="source" position={Position.Right} id="midi" />
        <div className="my-label">{label}</div>
      </div>
    </Profiler>
  );
}

export default MIDIInput;
