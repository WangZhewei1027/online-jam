"use client";
import { useCallback, useState } from "react";
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

function NumberInput({
  id,
  data: { label, output },
  selected,
  ...props
}: NodeProps & { data: { label: string; output: number } }) {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  const [number, setNumber] = useState<number>(output);

  const onChange = useCallback((evt: any) => {
    const newValue = evt.target.value;
    setNumber(newValue);
    updateNode(id, {
      output: newValue ? parseFloat(newValue) : 0,
    });
    console.log("NumberInput onChange", newValue);
  }, []);

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} w-32`}>
      <input
        id={`number-${id}`}
        name="number"
        type="number"
        onChange={onChange}
        className="nodrag rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={number}
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

export default NumberInput;
