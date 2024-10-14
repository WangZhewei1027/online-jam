"use client";
import { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import "../styles.css";

function NumberInput({
  id,
  data: { label, value },
  selected,
  ...props
}: NodeProps & { data: { label: string; value: number } }) {
  const { updateNodeData } = useReactFlow();
  const [number, setNumber] = useState<number>(value);

  const onChange = useCallback((evt: any) => {
    setNumber(evt.target.value);
    updateNodeData(id, { value: evt.target.value });
  }, []);

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      {/* <div>{data.label as string}</div> */}
      <input
        id={`number-${id}`}
        name="number"
        type="number"
        onChange={onChange}
        className="nodrag flex h-5 w-16 rounded-md border border-input bg-transparent px-3 py-1 text-[10px] shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={number}
      />
      <Handle type="source" position={Position.Right} />
      <div className="my-label">{label}</div>
    </div>
  );
}

export default NumberInput;
