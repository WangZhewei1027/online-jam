"use client";
import React, { use, useEffect } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useHandleConnections,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";
import TargetHandle from "./TargetHandle";

function RGBLight({
  id,
  data: { label },
  selected,
}: NodeProps & { data: { label: string } }) {
  const redConnections = useHandleConnections({
    type: "target",
    id: "red",
  });
  const greenConnections = useHandleConnections({
    type: "target",
    id: "green",
  });
  const blueConnections = useHandleConnections({
    type: "target",
    id: "blue",
  });

  // 始终调用 useNodesData，避免条件调用 Hook
  const redNodeData = useNodesData(redConnections?.[0]?.source);
  const greenNodeData = useNodesData(greenConnections?.[0]?.source);
  const blueNodeData = useNodesData(blueConnections?.[0]?.source);

  const color: { r: number; g: number; b: number } = {
    r: redNodeData?.data.value ? (redNodeData.data.value as number) : 0,
    g: greenNodeData?.data.value ? (greenNodeData.data.value as number) : 0,
    b: blueNodeData?.data.value ? (blueNodeData.data.value as number) : 0,
  };

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <TargetHandle
        id="red"
        type="target"
        position={Position.Left}
        label="R"
        style={{ top: "20%" }}
      />
      <div className="absolute text-[6px] font-bold top-[20%] left-1 -translate-y-1/2">
        R
      </div>
      <TargetHandle
        id="green"
        type="target"
        position={Position.Left}
        label="G"
      />
      <div className="absolute text-[6px] font-bold top-[50%] left-1 -translate-y-1/2">
        G
      </div>
      <TargetHandle
        id="blue"
        type="target"
        position={Position.Left}
        label="B"
        style={{ top: "80%" }}
      />
      <div className="absolute text-[6px] font-bold top-[80%] left-1 -translate-y-1/2">
        B
      </div>
      <div
        className={`rounded-full border-2 w-3 h-3 ml-1 `}
        style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
      ></div>
      <div className="my-label">{label}</div>
    </div>
  );
}

export default RGBLight;
