"use client";
import { use, useCallback, useState, useEffect, useRef } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  NodeProps,
  useEdges,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import Debugger from "../components/Debugger";
import { useStore, StoreState } from "../utils/store";
import { shallow } from "zustand/shallow";

import { getHandleConnections, getNodeData, updateNode } from "../utils/store";

const selector = (store: StoreState) => ({
  debug: store.debug,
});

function Multiply({
  id,
  data: { label, output, value },
  selected,
  ...props
}: NodeProps & { data: { label: string; output: number; value: number } }) {
  const store = useStore(selector, shallow);

  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  const [number, setNumber] = useState<number>(value ?? 1);

  const signalRef = useRef<Tone.Signal | null>(null);

  const mutiplyRef = useRef<Tone.Multiply | null>(null);

  const inputConnections = getHandleConnections(id, "target", "input");
  var inputSourceNodeData: Tone.Signal | null = null;
  if (inputConnections.length > 0 && inputConnections[0].sourceHandle) {
    let data = getNodeData(
      inputConnections[0].source,
      inputConnections[0].sourceHandle
    );
    if (data instanceof Tone.Signal) {
      inputSourceNodeData = data;
    }
  }

  const onChange = (evt: any) => {
    const newValue = evt.target.value;
    setNumber(newValue);
    if (mutiplyRef.current) {
      mutiplyRef.current.value = newValue ?? 0;
    }
    updateNode(id, {
      value: newValue,
    });
    console.log("Multiply onChange", mutiplyRef.current);
  };

  useEffect(() => {
    if (!mutiplyRef.current) {
      mutiplyRef.current = new Tone.Multiply(value);
      updateNode(id, { component: mutiplyRef.current });
    }
    return () => {
      signalRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (inputSourceNodeData && mutiplyRef.current) {
      inputSourceNodeData.connect(mutiplyRef.current);
      console.log("connected");
    }

    return () => {
      if (inputSourceNodeData && mutiplyRef.current) {
        inputSourceNodeData.disconnect(mutiplyRef.current);
        console.log("disconnected");
      }
    };
  }, [inputSourceNodeData]);

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} w-32`}>
      <div className="text-2xl font-bold font-sans text-center mb-2">X</div>
      <input
        id={`number-${id}`}
        name="number"
        type="number"
        onChange={onChange}
        className="nodrag rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={number}
      />
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: "10px", height: "10px" }}
        id="input"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "10px", height: "10px" }}
        id="component"
      />
      <div className="absolute left-0 -top-6 text-base">{label}</div>
      {store.debug && <Debugger text={String(mutiplyRef.current?.input)} />}
    </div>
  );
}

export default Multiply;
