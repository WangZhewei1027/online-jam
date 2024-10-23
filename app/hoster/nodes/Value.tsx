"use client";
import { useCallback, useState, useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import TargetHandle from "./TargetHandle";
import "../styles.css";

import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";

// 选择器，确保组件订阅 nodes 和 edges 的变化
const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
});

function Value({
  id,
  data: { label },
  selected,
  ...props
}: NodeProps & { data: { label: string } }) {
  // 使用 Zustand 的 useStore 订阅 nodes 和 edges 的变化
  const store = useStore(selector, shallow);

  // 获取与当前节点连接的边
  const Connections = store.useHandleConnections(id, "target", "input");
  const sourceHandleId = Connections?.[0]?.sourceHandle;
  const sourceNodeId = Connections?.[0]?.source;

  // 获取 source 节点的 data
  const NodeData = store.useNodesData(sourceNodeId);

  // 使用方括号动态访问对象的 key
  const number = NodeData?.value ? (NodeData.value as number) : 0;

  // 当 Connections 或者 NodeData 变化时，触发渲染
  useEffect(() => {
    // This will log changes whenever Connections or NodeData change
    console.log("Connections or NodeData changed", { Connections, NodeData });
  }, [Connections, NodeData]);

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
