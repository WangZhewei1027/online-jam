"use client";
import { useState, useCallback } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useEdges,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";
import {
  useStore,
  StoreState,
  getHandleConnections,
  getNodeData,
  updateNode,
} from "../utils/store";
import * as Tone from "tone";

function XYPad({
  id,
  data: { label },
  selected,
}: NodeProps & { data: { label: string } }) {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  const [x, setX] = useState(0.5); // 初始化x轴值
  const [y, setY] = useState(0.5); // 初始化y轴值

  const [down, setDown] = useState(false);

  // 拖动时更新 x 和 y 的值
  const handleDrag = useCallback(
    (event: React.MouseEvent) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const newX = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width)
      );
      const newY = Math.min(
        1,
        Math.max(0, 1 - (event.clientY - rect.top) / rect.height)
      );
      setX(newX);
      setY(newY);

      // 更新全局状态
      updateNode(id, { x: newX, y: newY });
    },
    [id]
  );

  //---------- 处理trigger输出 ----------
  const triggerConnection = getHandleConnections(id, "source", "trigger");
  const triggerConnections =
    triggerConnection.length > 0 ? triggerConnection : [];
  const triggerSourceNodeData: Tone.ToneAudioNode[] = triggerConnections.map(
    (connection) => {
      return getNodeData(connection.target, "component") as Tone.ToneAudioNode;
    }
  );

  function handleMouseDown() {
    if (triggerSourceNodeData.length > 0) {
      triggerSourceNodeData.forEach((component) => {
        if (
          component &&
          "triggerAttack" in component &&
          typeof component.triggerAttack === "function"
        ) {
          component.triggerAttack();
          console.log("triggerAttack");
          setDown(true);
        }
      });
    }
  }

  function handleMouseUp() {
    if (triggerSourceNodeData.length > 0) {
      triggerSourceNodeData.forEach((component) => {
        if (
          component &&
          "triggerRelease" in component &&
          typeof component.triggerRelease === "function"
        ) {
          component.triggerRelease();
          console.log("triggerRelease");
          setDown(false);
        }
      });
    }
  }

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} `}>
      {/* 拖动区域 */}
      <div
        onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        className="mx-2 w-48 h-48 shadow-2xl bg-transparent border border-gray-800 rounded relative cursor-crosshair nodrag"
        style={{
          transform: `rotateX(${(y - 0.5) * 20}deg) rotateY(${(x - 0.5) * 20}deg) scale(1)`, // 旋转和缩放
          transition: "transform 0.1s ease-out", // 平滑过渡
          //perspective: "100px", // 透视
        }}
      >
        {/* 显示拖动位置 */}
        <div
          style={{
            position: "absolute",
            left: `${x * 100}%`,
            bottom: `${y * 100}%`,
            transform: "translate(-50%, 50%)",
          }}
          className={`w-8 h-8 ${down ? "border-2" : "border"} border-gray-500 rounded-full pointer-events-none`}
        ></div>
      </div>

      {/* x 轴输出 */}
      <Handle
        type="source"
        position={Position.Right}
        id="x"
        style={{ top: "20%", width: "10px", height: "10px" }}
      />
      <div className="absolute text-sm top-[20%] right-2 -translate-y-1/2">
        X
      </div>

      {/* y 轴输出 */}
      <Handle
        type="source"
        position={Position.Right}
        id="y"
        style={{ top: "50%", width: "10px", height: "10px" }}
      />
      <div className="absolute text-sm top-[50%] right-2 -translate-y-1/2">
        Y
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="trigger"
        style={{ top: "80%", width: "10px", height: "10px" }}
      />
      <div className="absolute text-sm top-[80%] right-2 -translate-y-1/2">
        T
      </div>

      {/* 显示标签 */}
      <div className="my-label">{label}</div>
    </div>
  );
}

export default XYPad;
