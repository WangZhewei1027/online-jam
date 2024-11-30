"use client";
import { use, useEffect, useRef } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useNodesData,
  useEdges,
} from "@xyflow/react";
import "../styles.css";
import { getHandleConnections, getNodeData, updateNode } from "../utils/store";
import * as Tone from "tone";
import { isSignalNode } from "../utils/tone";

function Value({
  id,
  data: { label },
  selected,
  ...props
}: NodeProps & { data: { label: string } }) {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  const signalRef = useRef<Tone.Signal | null>(null);

  // ---------- 获取输入端口的连接信息 ----------
  const connections = getHandleConnections(id, "target", "input");
  const sourceNodeData =
    connections.length > 0 && connections[0].sourceHandle
      ? getNodeData(connections[0].source, connections[0].sourceHandle)
      : null;
  let info;
  console.log("sourceNodeData", sourceNodeData);
  if (
    typeof sourceNodeData === "number" ||
    typeof sourceNodeData === "string"
  ) {
    info = sourceNodeData;
  } else if (sourceNodeData instanceof Tone.Signal) {
    info = sourceNodeData.value;
  } else if (sourceNodeData instanceof Tone.Multiply) {
    info = sourceNodeData.value;
  } else {
    info = "Null";
  }

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} `}>
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        style={{ width: "10px", height: "10px" }}
      />
      <div className="text-sm">{String(info)}</div>
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Value;
