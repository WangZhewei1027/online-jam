"use client";
import { useEffect, useRef } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";

import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";
const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
  updateNode: store.updateNode,
});

interface GainNodeProps extends NodeProps {
  data: {
    label: string;
  };
}

const GainNode = ({
  id,
  data: { label },
  isConnectable,
  selected,
}: GainNodeProps) => {
  const store = useStore(selector, shallow);

  const audioInputConnections = store.useHandleConnections(
    id,
    "target",
    "audio"
  );
  const audioInputSourceId = audioInputConnections?.[0]?.source;
  console.log("audioInputSourceId", audioInputSourceId);
  const audioInputSourceHandleId = audioInputConnections?.[0]?.sourceHandle;
  const audioInputNodeData = store.useNodesData(audioInputSourceId || "");
  console.log("audioInputNodeData", audioInputNodeData);
  const audioInputComponent = audioInputNodeData?.component;
  const audioComponent: Tone.ToneAudioNode | null = audioInputComponent;
  const audioComponentRef = useRef<Tone.ToneAudioNode | null>(audioComponent);
  console.log("audioComponent", audioComponent);

  const gainValueConnections = store.useHandleConnections(id, "target", "gain");
  const gainValueSourceId = gainValueConnections?.[0]?.source;
  console.log("gainValueSourceId", gainValueSourceId);
  const gainValueSourceHandleId = gainValueConnections?.[0]?.sourceHandle;
  const gainValueNodeData = store.useNodesData(gainValueSourceId || "");
  console.log("gainValueNodeData", gainValueNodeData);
  const gainValue = gainValueNodeData?.value || 1;
  console.log("gainValue", gainValue);

  const gainRef = useRef<Tone.Gain | null>(new Tone.Gain(gainValue));

  useEffect(() => {
    if (!gainRef.current) {
      const gainNode = new Tone.Gain(gainValue);
      gainRef.current = gainNode;
    }

    // If audioComponent exists, connect it to the GainNode
    if (audioComponent) {
      audioComponentRef.current = audioComponent;
      audioComponentRef.current.connect(gainRef.current);

      if (
        "start" in audioComponentRef.current &&
        typeof audioComponentRef.current.start === "function"
      ) {
        audioComponentRef.current.start();
      }
    }

    // Set gain to a static value using rampTo for smooth transitions
    gainRef.current.gain.rampTo(gainValue, 0.05);

    store.updateNode(id, { component: gainRef.current, value: gainValue });
    console.log("gain value", gainValue);
  }, [audioComponent, gainValue]);

  useEffect(() => {
    if (audioInputConnections.length < 1 && gainRef.current) {
      gainRef.current.disconnect();
    }
  }, [audioInputConnections]);

  useEffect(() => {
    return () => {
      if (audioComponentRef.current && gainRef.current) {
        gainRef.current.dispose();
        audioComponentRef.current = null;
        gainRef.current = null;
      }
    };
  }, [audioComponentRef.current]);

  return (
    <div
      className={`my-node ${
        selected ? "my-node-selected" : ""
      } w-[48px] h-[48px]`}
    >
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "30%" }}
        id="audio"
      />
      <TargetHandle
        type="target"
        position={Position.Left}
        id="gain"
        style={{ top: "70%" }}
      />
      <div
        style={{ top: "30%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        Input
      </div>
      <div
        style={{ top: "70%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        Gain
      </div>
      <Handle type="source" position={Position.Right} />
      <div className="my-label">{label}</div>
    </div>
  );
};

export default GainNode;
