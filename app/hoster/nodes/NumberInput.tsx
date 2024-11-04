"use client";
import { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import "../styles.css";

import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";
const selector = (store: StoreState) => ({
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
  updateNode: store.updateNode,
});

function NumberInput({
  id,
  data: { label, output },
  selected,
  ...props
}: NodeProps & { data: { label: string; output: number } }) {
  const [number, setNumber] = useState<number>(output);

  const store = useStore(selector, shallow);

  const onChange = useCallback((evt: any) => {
    const newValue = evt.target.value;
    setNumber(newValue);
    store.updateNode(id, {
      output: newValue ? parseFloat(newValue) : 0,
    });
    console.log("NumberInput onChange", newValue);
  }, []);

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <input
        id={`number-${id}`}
        name="number"
        type="number"
        onChange={onChange}
        className="nodrag flex h-5 w-16 rounded-md border border-input bg-transparent px-3 py-1 text-[10px] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={number}
      />
      <Handle type="source" position={Position.Right} id="output" />
      <div className="my-label">{label}</div>
    </div>
  );
}

export default NumberInput;
