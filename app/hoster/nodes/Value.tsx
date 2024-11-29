"use client";
import { useEffect } from "react";
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

function Value({
  id,
  data: { label },
  selected,
  ...props
}: NodeProps & { data: { label: string } }) {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  // ---------- 获取输入端口的连接信息 ----------
  const connections = getHandleConnections(id, "target", "input");
  const sourceNodeData =
    connections.length > 0 && connections[0].sourceHandle
      ? getNodeData(connections[0].source, connections[0].sourceHandle)
      : null;
  // const sourceNodeValue =
  //   connections.length > 0 && connections[0].sourceHandle
  //     ? getNodeData(connections[0].source, "value")
  //     : null;
  let info;
  if (
    typeof sourceNodeData === "number" ||
    typeof sourceNodeData === "string"
  ) {
    info = sourceNodeData;
  } else if (sourceNodeData instanceof Tone.Signal) {
    info = sourceNodeData.value;
  } else {
    info = "null";
  }

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} `}>
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        style={{ width: "10px", height: "10px" }}
      />
      <div className="text-sm">{info}</div>
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Value;
