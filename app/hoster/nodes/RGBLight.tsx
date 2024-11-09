"use client";
import React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import TargetHandle from "./TargetHandle";
import { getSourceData, useConnectionData } from "../utils/utils";
import { useStore, StoreState } from "../utils/store";
import { shallow } from "zustand/shallow";

// Store selector to subscribe to all necessary store properties
const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
});

function RGBLight({
  id,
  data: { label },
  selected,
}: NodeProps & { data: { label: string } }) {
  const store = useStore(selector, shallow);

  // 获取 red 颜色通道的数据
  const { sourceHandleId: redHandleId, sourceNodeId: redNodeId } =
    useConnectionData(store, id, "red");
  const red = getSourceData(store, redNodeId, redHandleId);

  // 获取 green 颜色通道的数据
  const { sourceHandleId: greenHandleId, sourceNodeId: greenNodeId } =
    useConnectionData(store, id, "green");
  const green = getSourceData(store, greenNodeId, greenHandleId);

  // 获取 blue 颜色通道的数据
  const { sourceHandleId: blueHandleId, sourceNodeId: blueNodeId } =
    useConnectionData(store, id, "blue");
  const blue = getSourceData(store, blueNodeId, blueHandleId);

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      {/* Red Handle */}
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

      {/* Green Handle */}
      <TargetHandle
        id="green"
        type="target"
        position={Position.Left}
        label="G"
        style={{ top: "50%" }}
      />
      <div className="absolute text-[6px] font-bold top-[50%] left-1 -translate-y-1/2">
        G
      </div>

      {/* Blue Handle */}
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

      {/* Display Color */}
      <div
        className="rounded-full border-2 w-3 h-3 ml-1"
        style={{ backgroundColor: `rgb(${red}, ${green}, ${blue})` }}
      ></div>

      <div className="my-label">{label}</div>
    </div>
  );
}

export default RGBLight;
