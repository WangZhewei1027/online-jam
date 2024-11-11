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
  const number = typeof sourceNodeData === "number" ? sourceNodeData : 0;

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} `}>
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        style={{ width: "10px", height: "10px" }}
      />
      <div className="text-sm">{typeof number === "number" ? number : 0}</div>
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Value;
