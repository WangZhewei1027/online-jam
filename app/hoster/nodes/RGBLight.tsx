"use client";
import React from "react";
import {
  Handle,
  Position,
  NodeProps,
  useNodesData,
  useEdges,
} from "@xyflow/react";
import "../styles.css";
import { getHandleConnections, getNodeData, updateNode } from "../utils/store";

function RGBLight({
  id,
  data: { label },
  selected,
}: NodeProps & { data: { label: string } }) {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  const redConnection = getHandleConnections(id, "target", "red");
  const redSourceNodeData =
    redConnection.length > 0 && redConnection[0].sourceHandle
      ? getNodeData(redConnection[0].source, redConnection[0].sourceHandle)
      : null;
  const red = typeof redSourceNodeData === "number" ? redSourceNodeData : 0;

  const greenConnection = getHandleConnections(id, "target", "green");
  const greenSourceNodeData =
    greenConnection.length > 0 && greenConnection[0].sourceHandle
      ? getNodeData(greenConnection[0].source, greenConnection[0].sourceHandle)
      : null;
  const green =
    typeof greenSourceNodeData === "number" ? greenSourceNodeData : 0;

  const blueConnection = getHandleConnections(id, "target", "blue");
  const blueSourceNodeData =
    blueConnection.length > 0 && blueConnection[0].sourceHandle
      ? getNodeData(blueConnection[0].source, blueConnection[0].sourceHandle)
      : null;
  const blue = typeof blueSourceNodeData === "number" ? blueSourceNodeData : 0;

  return (
    <div
      className={`style-node ${selected ? "style-node-selected" : ""} h-24 w-24 items-center justify-center`}
    >
      {/* Red Handle */}
      <Handle
        id="red"
        type="target"
        position={Position.Left}
        style={{ top: "20%", width: "10px", height: "10px" }}
      />
      <div className="absolute text-sm top-[20%] left-2 -translate-y-1/2">
        R
      </div>

      {/* Green Handle */}
      <Handle
        id="green"
        type="target"
        position={Position.Left}
        style={{ top: "50%", width: "10px", height: "10px" }}
      />
      <div className="absolute text-sm top-[50%] left-2 -translate-y-1/2">
        G
      </div>

      {/* Blue Handle */}
      <Handle
        id="blue"
        type="target"
        position={Position.Left}
        style={{ top: "80%", width: "10px", height: "10px" }}
      />
      <div className="absolute text-sm top-[80%] left-2 -translate-y-1/2">
        B
      </div>

      {/* Display Color */}
      <div
        className="rounded-full border-2 w-6 h-6 ml-1"
        style={{ backgroundColor: `rgb(${red}, ${green}, ${blue})` }}
      ></div>

      <div className="my-label">{label}</div>
    </div>
  );
}

export default RGBLight;
