// utils.ts
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

// Helper function to fetch source node data with error handling
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

// Helper function to retrieve connections and extract sourceNodeId and sourceHandleId
export function useConnectionData(
  store: SelectorType,
  nodeId: string,
  handleId: string
) {
  const connections = store.useHandleConnections(nodeId, "target", handleId);
  const sourceHandleId: string | undefined =
    connections?.[0]?.sourceHandle ?? undefined;
  const sourceNodeId: string | undefined = connections?.[0]?.source;

  return { connections, sourceHandleId, sourceNodeId };
}
