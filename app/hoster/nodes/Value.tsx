"use client";
import { useCallback, useState } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  NodeProps,
  useHandleConnections,
  useNodesData,
} from "@xyflow/react";
import TargetHandle from "./TargetHandle";
import "../styles.css";

function Value({
  id,
  data: { label },
  selected,
  ...props
}: NodeProps & { data: { label: string } }) {
  const Connections = useHandleConnections({
    type: "target",
    id: "input",
  });

  const NodeData = useNodesData(Connections?.[0]?.source);
  const number = NodeData?.data.value ? (NodeData.data.value as number) : 0;

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <TargetHandle
        id="input"
        type="target"
        position={Position.Left}
        label="Input"
      />
      <div className="text-[10px]">{number}</div>
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Value;
