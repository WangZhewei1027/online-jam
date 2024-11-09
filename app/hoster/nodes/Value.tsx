"use client";
import { useEffect } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import TargetHandle from "./TargetHandle";
import "../styles.css";
import { useStore, StoreState } from "../utils/store";
import { shallow } from "zustand/shallow";
import { getSourceData, useConnectionData } from "../utils/utils";

// Store selector to subscribe to all necessary store properties
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
  const store = useStore(selector, shallow);
  const { connections, sourceHandleId, sourceNodeId } = useConnectionData(
    store,
    id,
    "input"
  );
  const number = getSourceData(store, sourceNodeId, sourceHandleId);

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <TargetHandle
        id="input"
        type="target"
        position={Position.Left}
        label="Input"
      />
      <div className="text-[10px]">
        {typeof number === "number" ? number : 0}
      </div>
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Value;
