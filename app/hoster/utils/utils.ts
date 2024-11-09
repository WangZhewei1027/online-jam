"use client";
import { ToneAudioNode } from "tone";
import { StoreState } from "./store";

// Define selector function to select necessary store properties
export const selector = (store: StoreState) => ({
  edges: store.edges,
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
});

// Define a type for the selector's return value
export type SelectorType = ReturnType<typeof selector>;

/**
 * 根据Node ID 和Handle ID 获取源数据
 * 这个函数
 *
 * @param a 第一个数
 * @param b 第二个数
 * @returns 两个数的和
 */
export function getSourceData(
  store: SelectorType, // Use SelectorType here
  nodeId?: string,
  handleId?: string
): number | ToneAudioNode | null {
  if (!nodeId || !handleId) {
    //console.warn("Source node ID or handle ID is undefined.");
    return null;
  }

  const nodeData = store.useNodesData(nodeId);
  if (!nodeData || !(handleId in nodeData)) {
    console.warn(
      `Data for handle ID "${handleId}" not found in node ID "${nodeId}".`
    );
    return null;
  }

  return nodeData[handleId];
}

/**
 * 根据Node ID 和Handle ID 获取Connections
 *
 * Node ID指的是自身Node的ID，Handle ID指的是自身某个source handle的ID，返回的是连接到这个source handle的connection
 *
 * 根据target handle只能被一个source handle连接的规则，返回的connections数组应只有一个元素；如果没有连接，则返回null；如果有多个连接，则返回所有连接，但会打印一个warn。
 *
 *
 * @param store
 * @param nodeId
 * @param handleId
 * @returns connections, sourceHandleId, sourceNodeId
 */
export function useConnectionData(
  store: SelectorType,
  nodeId: string,
  handleId: string
) {
  const connections = store.useHandleConnections(nodeId, "target", handleId);
  const sourceHandleId: string | null = connections?.[0]?.sourceHandle ?? null;
  const sourceNodeId: string | null = connections?.[0]?.source;

  return { connections, sourceHandleId, sourceNodeId };
}
