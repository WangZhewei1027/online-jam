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
  const { updateNodeData } = useReactFlow();

  const audioInputConnections = useHandleConnections({
    type: "target",
    id: "audio",
  });

  const gainValueConnections = useHandleConnections({
    type: "target",
    id: "gain",
  });

  const audioSourceId =
    audioInputConnections.length > 0 ? audioInputConnections[0].source : null;
  const gainSourceId =
    gainValueConnections.length > 0 ? gainValueConnections[0].source : null;

  const audioNodeData = useNodesData(audioSourceId || "");
  const gainNodeData = useNodesData(gainSourceId || "");

  const gainRef = useRef<Tone.Gain | null>(null);

  const gainValue = gainNodeData?.data?.value
    ? (gainNodeData.data.value as number)
    : 1;

  const audioComponent: Tone.ToneAudioNode | null =
    audioSourceId && audioNodeData?.data?.component
      ? (audioNodeData.data.component as Tone.ToneAudioNode)
      : null;

  const gainInputComponent =
    gainSourceId && gainNodeData?.data?.component
      ? (gainNodeData.data.component as Tone.ToneAudioNode)
      : null;

  const audioComponentRef = useRef<Tone.ToneAudioNode | null>(null);

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

    // Handle gain input connections (either Envelope or regular value)
    if (gainInputComponent) {
      if (gainInputComponent instanceof Tone.Envelope) {
        // Connect the envelope to control the gain
        gainInputComponent.connect(gainRef.current.gain);
      } else {
        // Set gain to a static value using rampTo for smooth transitions
        gainRef.current.gain.rampTo(gainValue, 0.05);
      }
    }

    updateNodeData(id, { component: gainRef.current });
  }, [audioComponent, gainValue, gainInputComponent]);

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
  }, []);

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
