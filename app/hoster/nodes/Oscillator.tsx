"use client";
import { useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";
import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";
import { getSourceData, useConnectionData } from "../utils";
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
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
  updateNode: store.updateNode,
});

function Oscillator({
  id,
  data: { label, type = "sine" },
  selected,
}: NodeProps & { data: { label: string; type: string } }) {
  const store = useStore(selector, shallow);
  const [waveType, setWaveType] = useState<Tone.ToneOscillatorType>(
    type as Tone.ToneOscillatorType
  ); // Set initial wave type
  const oscRef = useRef<Tone.Oscillator | null>(null); // Oscillator reference

  // Fetch frequency input connections
  const {
    connections: frequencyConnections,
    sourceHandleId: frequencyHandleId,
    sourceNodeId: frequencyNodeId,
  } = useConnectionData(store, id, "frequency");

  let frequency: number = 0;
  if (frequencyConnections.length > 0) {
    const data = getSourceData(store, frequencyNodeId, frequencyHandleId);
    if (typeof data === "number" && data > 0) {
      frequency = data;
    }
  }

  // Initialize oscillator and clean up
  useEffect(() => {
    if (!oscRef.current) {
      oscRef.current = new Tone.Oscillator(0, waveType);
      oscRef.current.start();
    }
    store.updateNode(id, { component: oscRef.current });

    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.dispose();
      }
      console.log("Oscillator disposed");
    };
  }, []); // Only run on mount and unmount

  // Update frequency
  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.frequency.rampTo(frequency, 0);
    }
  }, [frequency]);

  // Update wave type
  useEffect(() => {
    if (
      oscRef.current &&
      ["sine", "square", "triangle", "sawtooth"].includes(waveType)
    ) {
      oscRef.current.type = waveType;
      store.updateNode(id, { type: waveType });
      console.log("Wave type set to", waveType);
    }
  }, [waveType]);

  return (
    <div
      className={`my-node ${
        selected ? "my-node-selected" : ""
      } w-[64px] h-[64px]`}
    >
      {/* Frequency input handle */}
      <TargetHandle
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
      <TargetHandle
        id="type"
        type="target"
        position={Position.Left}
        style={{ top: "70%" }}
      />
      <div className="absolute text-[6px] font-bold top-[70%] left-1 -translate-y-1/2">
        <div>Type</div>
        <div>
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
        </div>
      </div>

      {/* Oscillator output handle */}
      <Handle type="source" position={Position.Right} id="component" />

      {/* Display label */}
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Oscillator;
