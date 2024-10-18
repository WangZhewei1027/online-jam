"use client";
import { useEffect, useRef } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useHandleConnections,
  useNodesData,
  useReactFlow,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";

// 定义 GainNodeProps 接口，包含传入的节点数据（label）
interface GainNodeProps extends NodeProps {
  data: {
    label: string;
  };
}

// GainNode 组件
const GainNode = ({
  id,
  data: { label }, // 获取传入的 label
  isConnectable,
  selected,
}: GainNodeProps) => {
  // 从 React Flow 获取 updateNodeData 方法，更新节点数据
  const { updateNodeData } = useReactFlow();

  // 获取音频输入端口的连接信息
  const audioInputConnections = useHandleConnections({
    type: "target",
    id: "audio", // 用于音频输入的 Handle
  });

  // 获取增益输入端口的连接信息
  const gainValueConnections = useHandleConnections({
    type: "target",
    id: "gain", // 用于增益值输入的 Handle
  });

  // 获取音频源节点的 ID
  const audioSourceId =
    audioInputConnections.length > 0 ? audioInputConnections[0].source : null;
  const gainSourceId =
    gainValueConnections.length > 0 ? gainValueConnections[0].source : null;

  // 通过 sourceId 获取对应节点的数据
  const audioNodeData = useNodesData(audioSourceId || "");
  const gainNodeData = useNodesData(gainSourceId || "");

  // 使用 useRef 存储 Tone.Gain 实例，避免每次渲染时创建新的实例
  const gainRef = useRef<Tone.Gain | null>(null);

  // 获取增益值 (如果存在)
  const gainValue = gainNodeData?.data?.value
    ? (gainNodeData.data.value as number)
    : 1; // 默认增益值为 1

  // 获取音频源组件 (如果存在)
  const audioComponent: Tone.ToneAudioNode | null =
    audioSourceId && audioNodeData?.data?.component
      ? (audioNodeData.data.component as Tone.ToneAudioNode)
      : null;

  // 创建 audioComponentRef 引用，用于存储当前的音频组件
  const audioComponentRef = useRef<Tone.ToneAudioNode | null>(
    new Tone.Gain(gainValue ? gainValue : 1)
  );

  // 创建和连接 GainNode 的副作用
  useEffect(() => {
    // 如果 gainRef 为空，初始化 Tone.Gain
    if (!gainRef.current) {
      const gainNode = new Tone.Gain(gainValue); // 创建 GainNode 实例
      gainRef.current = gainNode;
    }

    // 连接音频源到 GainNode
    if (audioComponent) {
      audioComponentRef.current = audioComponent;

      // 使用 rampTo 方法平滑调整增益值，避免音频突变
      gainRef.current.gain.rampTo(gainValue, 0.05);

      audioComponentRef.current.connect(gainRef.current); // 连接音频源到增益节点

      // 如果音频组件需要启动（例如 Oscillator），则启动它
      if (
        "start" in audioComponentRef.current &&
        typeof audioComponentRef.current.start === "function"
      ) {
        audioComponentRef.current.start();
        //console.log("Component started");
      }
    }

    // 更新 React Flow 中的节点数据，将 GainNode 存储在 component 字段中
    updateNodeData(id, { component: gainRef.current });
  }, [audioComponent, gainValue]); // 依赖音频源和增益值的变化

  // 监听连接变化，如果音频输入被断开，断开 GainNode 的连接
  useEffect(() => {
    if (audioInputConnections.length < 1 && gainRef.current) {
      try {
        gainRef.current.disconnect(); // 断开连接
        console.log("Disconnected due to no audio input");
      } catch (error) {
        console.error("Error during disconnection:", error);
      }
    }
  }, [audioInputConnections]); // 监听音频输入连接

  // 在组件卸载时进行清理
  useEffect(() => {
    return () => {
      if (audioComponentRef.current && gainRef.current) {
        try {
          // 清理 GainNode
          if (gainRef.current) {
            gainRef.current.dispose();
          }
        } catch (error) {
          console.error("Error during cleanup disconnection:", error);
        } finally {
          // 清理引用，防止内存泄露
          audioComponentRef.current = null;
          gainRef.current = null;
        }
      }
    };
  }, []); // 仅在挂载和卸载时运行

  return (
    <div
      className={`my-node ${
        selected ? "my-node-selected" : ""
      } w-[48px] h-[48px]`}
    >
      {/* 左侧 handle 用于音频输入 */}
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "30%" }}
        id="audio"
      />
      {/* 左侧 handle 用于接收增益值 */}
      <TargetHandle
        type="target"
        position={Position.Left}
        id="gain"
        style={{ top: "70%" }}
      />
      <div
        style={{ top: "30%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        Input
      </div>
      <div
        style={{ top: "70%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        Gain
      </div>
      {/* 输出到其他音频节点 */}
      <Handle type="source" position={Position.Right} />
      <div className="my-label">{label}</div>
    </div>
  );
};

export default GainNode;
