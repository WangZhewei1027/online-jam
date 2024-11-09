"use client";
import { useCallback, useState } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import "../utils/store";
import SQC from "@/app/ui/sequencer";

function Sequencer({
  id,
  data: { label, value },
  selected,
  ...props
}: NodeProps & { data: { label: string; value: number } }) {
  const { updateNodeData } = useReactFlow();

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""} !p-0`}>
      <SQC hoster={true} bpm={120} />
    </div>
  );
}

export default Sequencer;
