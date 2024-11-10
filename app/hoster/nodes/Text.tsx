"use client";
import React, { useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import { getHandleConnections, getNodeData, updateNode } from "../utils/store";

function Text({
  id,
  data: { label },
  selected,
  ...props
}: NodeProps & { data: { label: string } }) {
  const [text, setText] = useState(label);

  const onChange = useCallback((evt: any) => {
    const newValue = evt.target.value;
    setText(newValue);
    updateNode(id, { value: newValue });
  }, []);

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} w-64`}>
      <textarea
        id={`text-${id}`}
        name="text"
        rows={4}
        onChange={onChange}
        className="nodrag flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={text}
      />
      {/* <Handle
        type="source"
        position={Position.Right}
        style={{ width: "10px", height: "10px" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ width: "10px", height: "10px" }}
      />
      <Handle
        type="source"
        position={Position.Left}
        style={{ width: "10px", height: "10px" }}
      /> */}
      <div className="absolute left-0 -top-6 text-base">{label}</div>
    </div>
  );
}

export default Text;
