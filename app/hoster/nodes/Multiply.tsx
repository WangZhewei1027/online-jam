"use client";
import { use, useCallback, useState, useEffect } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  NodeProps,
  useEdges,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";

import { getHandleConnections, getNodeData, updateNode } from "../utils/store";

function Multiply({
  id,
  data: { label, output, value },
  selected,
  ...props
}: NodeProps & { data: { label: string; output: number; value: number } }) {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  const [number, setNumber] = useState<number>(value ?? 1);

  const inputConnections = getHandleConnections(id, "target", "input");
  const inputSourceNodeData: number | null =
    inputConnections.length > 0 && inputConnections[0].sourceHandle
      ? getNodeData(
          inputConnections[0].source,
          inputConnections[0].sourceHandle
        )
      : null;

  const onChange = (evt: any) => {
    const newValue = evt.target.value;
    setNumber(newValue);
    updateNode(id, {
      output: inputSourceNodeData ? inputSourceNodeData * number : 0,
      value: newValue,
    });
  };

  useEffect(() => {
    updateNode(id, {
      output: inputSourceNodeData ? inputSourceNodeData * number : 0,
      value: number,
    });
  }, [number]);

  useEffect(() => {
    //console.log("inputSourceNodeData", inputSourceNodeData);
    updateNode(id, {
      output: inputSourceNodeData ? inputSourceNodeData * number : 0,
      value: number,
    });
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
        id="output"
      />
      <div className="absolute left-0 -top-6 text-base">{label}</div>
    </div>
  );
}

export default Multiply;
