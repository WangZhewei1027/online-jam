"use client";
import { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import "../styles.css";

function Text({
  id,
  data: { label, value },
  selected,
  ...props
}: NodeProps & { data: { label: string; value: string } }) {
  const { updateNodeData } = useReactFlow();
  const [text, setText] = useState<string>(value);

  const onChange = useCallback((evt: any) => {
    const newValue = evt.target.value;
    setText(newValue);
    updateNodeData(id, { value: newValue });
    console.log("TextInput onChange", newValue);
  }, []);

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <textarea
        id={`text-${id}`}
        name="text"
        rows={4}
        onChange={onChange}
        className="nodrag flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-[10px] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        value={text}
      />
      <Handle type="source" position={Position.Right} />
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Text;
