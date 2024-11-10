"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useEdges,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";
import {
  useStore,
  StoreState,
  getHandleConnections,
  getNodeData,
  updateNode,
} from "../utils/store";
import { shallow } from "zustand/shallow";
import { PiPianoKeys } from "react-icons/pi";
import { BsLightbulbFill } from "react-icons/bs"; // 灯泡图标
import { get } from "http";
import * as Tone from "tone";

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
  //const store = useStore(selector, shallow);
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));
  console.log(id, " rendered");

  // Add state for octave offset and light bulb state
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [isLightOn, setIsLightOn] = useState(false); // 灯泡状态

  // 用于记录已按下的键，避免重复触发 keydown
  const pressedKeys = new Set<string>();

  // Handle keyboard events to simulate MIDI input
  const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    let midiNote = null;

    // 检查是否已经记录按下的键，若已记录则跳过处理
    if (pressedKeys.has(key)) return;
    pressedKeys.add(key); // 添加到 pressedKeys 集合

    const isMac = navigator.platform.toUpperCase().includes("MAC");

    // 忽略保存快捷键
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

      // 按下键盘时点亮灯泡
      setIsLightOn(true);
      //updateNode(id, { trigger: "triggerAttack" });
      console.log("keydown");
      console.log(triggerSourceNodeData);
      if (triggerSourceNodeData.length > 0) {
        triggerSourceNodeData.forEach((component) => {
          if (
            "triggerAttack" in component &&
            typeof component.triggerAttack === "function"
          ) {
            component.triggerAttack();
            console.log("triggerAttack");
          }
        });
      }
    }
  };

  // 处理 keyup 事件，在松开按键时熄灭灯泡
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    pressedKeys.delete(key); // 从 pressedKeys 集合中移除键

    setIsLightOn(false);
    //updateNode(id, { trigger: "triggerRelease" });

    if (triggerSourceNodeData.length > 0) {
      triggerSourceNodeData.forEach((component) => {
        if (
          "triggerRelease" in component &&
          typeof component.triggerRelease === "function"
        ) {
          component.triggerRelease();
          console.log("triggerRelease");
        }
      });
    }
  }, []);

  const midiToFrequency = (midiNote: number): number =>
    440 * Math.pow(2, (midiNote - 69) / 12);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
    };
  }, [handleKeyDown, handleKeyUp]);

  //---------- 处理trigger输出 ----------
  const triggerConnection = getHandleConnections(id, "source", "trigger");
  const triggerConnections =
    triggerConnection.length > 0 ? triggerConnection : [];
  const triggerSourceNodeData: Tone.ToneAudioNode[] = triggerConnections.map(
    (connection) => {
      return getNodeData(connection.target, "component") as Tone.ToneAudioNode;
    }
  );

  return (
    <div
      className={`style-node ${selected ? "style-node-selected" : ""} w-24 items-center`}
    >
      <div className="text-sm text-center">{octaveOffset}</div>
      <PiPianoKeys className="h-8 w-8" />
      <div
        className={`rounded-full border-2 w-3 h-3 mt-2 ${isLightOn ? "bg-green-500" : ""}`}
        style={{ backgroundColor: `islightOn ? "yellow" : "gray"` }}
      ></div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ top: "30%", width: "10px", height: "10px" }}
        id="midi"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ top: "75%", width: "10px", height: "10px" }}
        id="trigger"
      />
      <div className="absolute left-0 -top-6 text-base">{data.label}</div>
    </div>
  );
}

export default MIDIInput;
