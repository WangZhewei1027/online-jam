"use client";
import { useEffect, useRef } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useHandleConnections,
  useReactFlow,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";

// EnvelopeNode Component
interface EnvelopeNodeProps extends NodeProps {
  data: {
    label: string;
  };
}

const Envelope = ({
  id,
  data: { label },
  isConnectable,
  selected,
}: EnvelopeNodeProps) => {
  const { updateNodeData } = useReactFlow();

  // ADSR connections
  const attackConnections = useHandleConnections({
    type: "target",
    id: "attack",
  });
  const decayConnections = useHandleConnections({
    type: "target",
    id: "decay",
  });
  const sustainConnections = useHandleConnections({
    type: "target",
    id: "sustain",
  });
  const releaseConnections = useHandleConnections({
    type: "target",
    id: "release",
  });

  // Extract ADSR values from connections or default values
  const attack = attackConnections.length > 0 ? 0.1 : 0.5;
  const decay = decayConnections.length > 0 ? 0.1 : 0.3;
  const sustain = sustainConnections.length > 0 ? 0.5 : 0.7;
  const release = releaseConnections.length > 0 ? 0.8 : 1.0;

  // Use useRef to store Tone.Envelope instance
  const envelopeRef = useRef<Tone.Envelope | null>(null);

  // Create and configure the Envelope
  useEffect(() => {
    if (!envelopeRef.current) {
      const envelope = new Tone.Envelope({
        attack,
        decay,
        sustain,
        release,
      });
      envelopeRef.current = envelope;

      // Update node data with the envelope
      updateNodeData(id, { component: envelopeRef.current });
    }

    // Clean up on unmount
    return () => {
      if (envelopeRef.current) {
        envelopeRef.current.dispose();
        envelopeRef.current = null;
      }
    };
  }, [attack, decay, sustain, release]);

  return (
    <div
      className={`my-node ${
        selected ? "my-node-selected" : ""
      } w-[48px] h-[64px]`}
    >
      {/* ADSR controls */}
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "10%" }}
        id="attack"
      />
      <div
        style={{ top: "10%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        Gate
      </div>
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "30%" }}
        id="attack"
      />
      <div
        style={{ top: "30%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        A
      </div>
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "50%" }}
        id="decay"
      />
      <div
        style={{ top: "50%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        D
      </div>
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "70%" }}
        id="sustain"
      />
      <div
        style={{ top: "70%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        S
      </div>
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "90%" }}
        id="release"
      />
      <div
        style={{ top: "90%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        R
      </div>

      {/* Output handle */}
      <Handle type="source" position={Position.Right} />
      <div className="my-label">{label}</div>
    </div>
  );
};

export default Envelope;
