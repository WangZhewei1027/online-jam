"use client";
import { useState, useCallback } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import { useStore, StoreState } from "../utils/store";
import { shallow } from "zustand/shallow";

const selector = (store: StoreState) => ({
  updateNode: store.updateNode,
});

function XYPad({
  id,
  data: { label },
  selected,
}: NodeProps & { data: { label: string } }) {
  const store = useStore(selector, shallow);
  const [x, setX] = useState(0.5); // 初始化x轴值
  const [y, setY] = useState(0.5); // 初始化y轴值

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
      store.updateNode(id, { x: newX * 1000, y: newY * 1000 });
    },
    [id, store]
  );

  return (
    <div
      className={`my-node ${selected ? "my-node-selected" : ""}`}
      style={{ width: 100, height: 100, position: "relative" }}
    >
      {/* 拖动区域 */}
      <div
        onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
        className="w-full h-full border rounded bg-gray-200 relative cursor-crosshair nodrag"
      >
        {/* 显示拖动位置 */}
        <div
          style={{
            position: "absolute",
            left: `${x * 100}%`,
            bottom: `${y * 100}%`,
            transform: "translate(-50%, 50%)",
          }}
          className="w-4 h-4 bg-blue-500 rounded-full pointer-events-none"
        ></div>
      </div>

      {/* x 轴输出 */}
      <Handle
        type="source"
        position={Position.Right}
        id="x"
        style={{ top: "30%" }}
      />
      <div className="absolute text-[6px] font-bold top-[30%] right-1 -translate-y-1/2">
        X
      </div>

      {/* y 轴输出 */}
      <Handle
        type="source"
        position={Position.Right}
        id="y"
        style={{ top: "70%" }}
      />
      <div className="absolute text-[6px] font-bold top-[70%] right-1 -translate-y-1/2">
        Y
      </div>

      {/* 显示标签 */}
      <div className="my-label">{label}</div>
    </div>
  );
}

export default XYPad;
