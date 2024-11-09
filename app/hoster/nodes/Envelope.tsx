"use client";
import { use, useEffect, useRef, useState } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useHandleConnections,
  useReactFlow,
  useEdges,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";
import {
  useStore,
  StoreState,
  getHandleConnections,
  getNodeData,
  updateNode,
} from "../utils/store";
import { shallow } from "zustand/shallow";
import { Slider } from "@/components/ui/slider";
import ADSRGraph from "../components/ADSRGraph";

const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
});

// EnvelopeNode Component
interface EnvelopeNodeProps extends NodeProps {
  data: {
    label: string;
    attackData: number;
    decayData: number;
    sustainData: number;
    releaseData: number;
  };
}

const Envelope = ({
  id,
  data: { label, attackData, decayData, sustainData, releaseData },
  isConnectable,
  selected,
}: EnvelopeNodeProps) => {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));
  console.log(id, " rendered");

  // Envelope values (initialize to 50% of max)
  const [attack, setAttack] = useState(attackData ?? 1); // 50% of max (2)
  const [decay, setDecay] = useState(decayData ?? 1); // 50% of max (2)
  const [sustain, setSustain] = useState(sustainData ?? 0.5); // 50% of max (1)
  const [release, setRelease] = useState(releaseData ?? 1); // 50% of max (2)

  //---------- 获取trigger输入端口的连接信息 ----------
  const triggerConnection = getHandleConnections(id, "target", "trigger");
  const triggerSourceNodeData: "triggerAttack" | "triggerRelease" | null =
    triggerConnection.length > 0 && triggerConnection[0].sourceHandle
      ? getNodeData(
          triggerConnection[0].source,
          triggerConnection[0].sourceHandle
        )
      : null;

  useEffect(() => {
    if (triggerSourceNodeData && envelopeRef.current) {
      if (triggerSourceNodeData === "triggerAttack") {
        envelopeRef.current.triggerAttack();
        updateNode(triggerConnection[0].source, { trigger: null });
        console.log("triggerAttack");
      } else if (triggerSourceNodeData === "triggerRelease") {
        envelopeRef.current.triggerRelease();
        updateNode(triggerConnection[0].source, { trigger: null });
        console.log("triggerRelease");
      }
    }
  }, [triggerSourceNodeData]);

  // Use useRef to store Tone.Envelope instance
  const envelopeRef = useRef<Tone.Envelope | null>(null);
  const signalRef = useRef<Tone.Signal | null>(null);

  // Create and configure the Envelope
  useEffect(() => {
    if (!envelopeRef.current) {
      const envelope = new Tone.Envelope({
        attack: attack,
        decay: decay,
        sustain: sustain,
        release: release,
      });
      envelopeRef.current = envelope;

      if (!signalRef.current) {
        const signal = new Tone.Signal();
        signalRef.current = signal;
      }

      // Update node data with the envelope
      updateNode(id, { component: envelopeRef.current });
    }

    // Clean up on unmount
    return () => {
      if (envelopeRef.current) {
        envelopeRef.current.dispose();
        envelopeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (envelopeRef.current) {
      envelopeRef.current.attack = attack;
      envelopeRef.current.decay = decay;
      envelopeRef.current.sustain = sustain;
      envelopeRef.current.release = release;
    }
    updateNode(id, {
      attackData: attack,
      decayData: decay,
      sustainData: sustain,
      releaseData: release,
    });
  }, [attack, decay, sustain, release]);

  return (
    <div
      className={`style-node space-y-4 ${selected ? "style-node-selected" : ""}`}
    >
      {/* ADSR controls */}
      <div className="flex items-center">
        <Handle
          type="target"
          position={Position.Left}
          style={{ top: "25%", width: "10px", height: "10px" }}
          id="trigger"
        />
        <div className="w-full h-36">
          <ADSRGraph
            attack={attack}
            decay={decay}
            sustain={sustain}
            release={release}
          />
        </div>
      </div>
      <div className="flex items-center">
        <Handle
          type="target"
          position={Position.Left}
          style={{ top: "55%", width: "10px", height: "10px" }}
          id="attack"
        />
        <div>
          <div className="flex place-content-between">
            <div className="text-sm">Attack</div>
            <div className="text-sm">{attack.toFixed(2)} s</div>
          </div>
          <Slider
            className="nodrag w-52 mt-2"
            min={0}
            max={2}
            step={0.01}
            defaultValue={[attack]}
            onValueChange={(num) => setAttack(num[0])}
          />
        </div>
      </div>
      <div className="">
        <Handle
          type="target"
          position={Position.Left}
          style={{ top: "68%", width: "10px", height: "10px" }}
          id="decay"
        />
        <div>
          <div className="flex place-content-between">
            <div className="text-sm">Decay</div>
            <div className="text-sm">{decay} s</div>
          </div>
          <Slider
            min={0}
            max={2}
            step={0.01}
            defaultValue={[decay]}
            onValueChange={(num) => setDecay(num[0])}
            className="nodrag w-52 mt-2"
          />
        </div>
      </div>
      <div className="">
        <Handle
          type="target"
          position={Position.Left}
          style={{ top: "81%", width: "10px", height: "10px" }}
          id="sustain"
        />
        <div>
          <div className="flex place-content-between">
            <div className="text-sm">Sustain</div>
            <div className="text-sm">{Math.round(sustain * 100)} %</div>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.01}
            defaultValue={[sustain]}
            onValueChange={(num) => setSustain(num[0])}
            className="nodrag w-52 mt-2"
          />
        </div>
      </div>
      <div className="my-4">
        <Handle
          type="target"
          position={Position.Left}
          style={{ top: "93%", width: "10px", height: "10px" }}
          id="release"
        />
        <div>
          <div className="flex place-content-between">
            <div className="text-sm">Release</div>
            <div className="text-sm">{release} s</div>
          </div>
          <Slider
            min={0}
            max={2}
            step={0.01}
            defaultValue={[release]}
            onValueChange={(num) => setRelease(num[0])}
            className="nodrag w-52 mt-2"
          />
        </div>
      </div>
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ top: "25%", width: "10px", height: "10px", marginTop: "0" }}
        id="component"
      />
      <div className="my-label">{label}</div>
    </div>
  );
};

export default Envelope;
