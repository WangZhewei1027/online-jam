"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Handle, Position, NodeProps, useEdges } from "@xyflow/react";
import "../styles.css";
import { getHandleConnections, getNodeData } from "../utils/store";
import * as Tone from "tone";

function Value({
  id,
  data: { label },
  selected,
}: NodeProps & { data: { label: string } }) {
  const edges = useEdges();

  // 获取输入端口的连接信息
  const sourceNodeData = useCallback(() => {
    const conns = getHandleConnections(id, "target", "input");
    return conns.length > 0 && conns[0].sourceHandle
      ? getNodeData(conns[0].source, conns[0].sourceHandle)
      : null;
  }, [edges, id]);

  const [info, setInfo] = useState<number | string | null>(null);

  useEffect(() => {
    const source = sourceNodeData(); // 动态获取连接数据
    if (!source) {
      setInfo("null");
      return;
    }

    const meter = new Tone.Meter(); // 创建 Tone.Meter 实例
    let animationFrameId: number | null = null; // 用于清理动画帧
    let lastUpdateTime = performance.now(); // 记录最后更新时间
    const updateInterval = 100; // 限制更新频率（单位：毫秒）

    // 连接信号到 Meter
    if (source && source.connect) {
      source.connect(meter);

      const updateValue = () => {
        const now = performance.now();
        if (now - lastUpdateTime >= updateInterval) {
          const level = meter.getValue(); // 获取信号值
          const threshold = 0.0001;
          let linearValue = Math.pow(
            10,
            (typeof level === "number" ? level : 0) / 20
          );
          if (linearValue < threshold) {
            linearValue = 0;
          }
          setInfo(linearValue);
          lastUpdateTime = now; // 更新最后更新时间
        }

        animationFrameId = requestAnimationFrame(updateValue); // 下一帧更新
      };

      updateValue(); // 启动更新循环
    }

    return () => {
      // 断开信号连接并清理资源
      if (source && source.disconnect) {
        source.disconnect(meter);
      }
      meter.dispose(); // 清理 Meter 实例
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId); // 清理动画帧
      }
    };
  }, [sourceNodeData]);

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""}`}>
      <Handle
        id="input"
        type="target"
        position={Position.Left}
        style={{ width: "10px", height: "10px" }}
      />
      <div className="text-sm">{String(info)}</div>
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Value;
