"use client";
import React, { useEffect } from "react";
import {
  Handle,
  useHandleConnections,
  useReactFlow,
  HandleProps,
  Edge,
} from "@xyflow/react";

interface TargetHandleProps extends HandleProps {
  label?: string; // label 是一个可选属性
}

const TargetHandle = ({ label, ...props }: TargetHandleProps) => {
  // 获取当前连接状态
  const connections = useHandleConnections({
    type: "target",
    id: props.id,
  });

  // 获取 React Flow 的方法，用于管理 edges
  const { getEdges, setEdges } = useReactFlow();

  useEffect(() => {
    console.log("Connections:", connections);
    // 获取所有连接到当前 target handle 的 edges
    const edges = connections;

    // 如果连接数量大于 1，删除旧的连接
    if (edges.length > 1) {
      // 获取最新的连接 (假设数组的最后一项是最新的连接)
      const oldEdge = edges[0];

      // 删除旧连接，只保留最新的连接
      setEdges((edges) => edges.filter((edge) => edge.id !== oldEdge.edgeId));
    }
  }, [connections]);

  return <Handle {...props} isConnectable={connections.length < 2} />;
};

export default TargetHandle;
