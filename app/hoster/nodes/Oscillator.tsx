"use client";
import { use, useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";
import {
  useStore,
  StoreState,
  getHandleConnections,
  getNodeData,
  updateNode,
} from "../store";
import { shallow } from "zustand/shallow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
});

function Oscillator({
  id,
  data: { label, type = "sine" },
  selected,
}: NodeProps & { data: { label: string; type: string } }) {
  const store = useStore(selector, shallow);
  const [frequency, setFrequency] = useState(0);
  console.log("Oscillator render");

  //Get frequency from source node
  const frequencyConnection = getHandleConnections(id, "target", "frequency");
  const frequencySourceNodeData: number | null =
    frequencyConnection.length > 0 && frequencyConnection[0].sourceHandle
      ? getNodeData(
          frequencyConnection[0].source,
          frequencyConnection[0].sourceHandle
        )
      : null;
  const fre: number =
    typeof frequencySourceNodeData === "number"
      ? Number(frequencySourceNodeData.toFixed(2))
      : 0;

  useEffect(() => {
    setFrequency(fre);
    if (oscRef.current) {
      oscRef.current.frequency.value = fre;
    }
  }, [fre]);

  const oscRef = useRef<Tone.Oscillator | null>(null);

  useEffect(() => {
    // 初始化 Tone.Oscillator 实例
    if (!oscRef.current) {
      oscRef.current = new Tone.Oscillator(frequency);
      oscRef.current.start();
      updateNode(id, { component: oscRef.current });
    }

    // 在组件卸载时停止并清理 Tone.Oscillator 实例
    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.dispose(); // 释放资源，防止内存泄漏
        oscRef.current = null;
      }
    };
  }, []); // 仅在初次渲染时执行

  // const [waveType, setWaveType] = useState<Tone.ToneOscillatorType>(
  //   type as Tone.ToneOscillatorType
  // ); // Set initial wave type
  // const oscRef = useRef<Tone.Oscillator | null>(null); // Oscillator reference

  // const frequencyConnection = getHandleConnections(id, "target", "frequency");
  // const frequencySourceNodeData =
  //   frequencyConnection.length > 0
  //     ? getNodeData(frequencyConnection[0].source)
  //     : null;
  // const frequency: number = frequencySourceNodeData?.frequency ?? 0;

  // // Initialize oscillator and clean up
  // useEffect(() => {
  //   if (!oscRef.current) {
  //     oscRef.current = new Tone.Oscillator(0, waveType);
  //     oscRef.current.start();
  //   }
  //   updateNode(id, { component: oscRef.current });

  //   return () => {
  //     if (oscRef.current) {
  //       oscRef.current.stop();
  //       oscRef.current.dispose();
  //     }
  //     console.log("Oscillator disposed");
  //   };
  // }, []); // Only run on mount and unmount

  // // Update frequency
  // useEffect(() => {
  //   if (oscRef.current) {
  //     oscRef.current.frequency.rampTo(frequency, 0);
  //   }
  // }, [frequency]);

  // // Update wave type
  // useEffect(() => {
  //   if (
  //     oscRef.current &&
  //     ["sine", "square", "triangle", "sawtooth"].includes(waveType)
  //   ) {
  //     oscRef.current.type = waveType;
  //     store.updateNode(id, { type: waveType });
  //     console.log("Wave type set to", waveType);
  //   }
  // }, [waveType]);

  return (
    <div
      className={`my-node ${
        selected ? "my-node-selected" : ""
      } w-[64px] h-[64px]`}
    >
      {/* Frequency input handle */}
      <Handle
        id="frequency"
        type="target"
        position={Position.Left}
        style={{ top: "30%" }}
      />
      <div className="absolute text-[6px] font-bold top-[30%] left-1 -translate-y-1/2">
        <div>Frequency</div>
        <div>{frequency} Hz</div>
      </div>

      {/* Wave type dropdown */}
      <Handle
        id="type"
        type="target"
        position={Position.Left}
        style={{ top: "70%" }}
      />
      <div className="absolute text-[6px] font-bold top-[70%] left-1 -translate-y-1/2">
        <div>Type</div>
        {/* <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="border">
              {waveType}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Wave Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["sine", "square", "triangle", "sawtooth"].map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setWaveType(type as Tone.ToneOscillatorType)}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>

      {/* Oscillator output handle */}
      <Handle type="source" position={Position.Right} id="component" />

      {/* Display label */}
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Oscillator;
