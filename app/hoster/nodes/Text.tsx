"use client";
import { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import "../styles.css";

import { useStore, StoreState } from "../store";
const selector = (store: StoreState) => ({
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
  updateNode: store.updateNode,
});

function Text({
  id,
  data: { label },
  selected,
  positionAbsoluteX,
  ...props
}: NodeProps & { data: { label: string } }) {
  console.log("Text render");
  console.log(positionAbsoluteX);
  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Text;
