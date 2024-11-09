"use client";
import { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import "../styles.css";
import { shallow } from "zustand/shallow";

import { useStore, StoreState } from "../utils/store";
const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
});

function Text({
  id,
  data: { label },
  selected,
  positionAbsoluteX,
  ...props
}: NodeProps & { data: { label: string } }) {
  const store = useStore(selector, shallow);
  // console.log("Text render");
  // console.log(positionAbsoluteX);
  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Text;
