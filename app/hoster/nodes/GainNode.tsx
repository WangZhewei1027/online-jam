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

interface GainNodeProps extends NodeProps {
  data: {
    label: string;
  };
}

const GainNode = ({
  id,
  data: { label },
  isConnectable,
  selected,
}: GainNodeProps) => {
  const { updateNodeData } = useReactFlow();

  const audioInputConnections = useHandleConnections({
    type: "target",
    id: "audio", // 用于音频输入的端口
  });

  const gainValueConnections = useHandleConnections({
    type: "target",
    id: "gain", // 用于接收增益值的端口
  });

  const audioSourceId =
    audioInputConnections.length > 0 ? audioInputConnections[0].source : null;
  const gainSourceId =
    gainValueConnections.length > 0 ? gainValueConnections[0].source : null;

  const audioNodeData = useNodesData(audioSourceId || "");
  const gainNodeData = useNodesData(gainSourceId || "");

  // 使用 useRef 存储 Tone.Gain 实例
  const gainRef = useRef<Tone.Gain | null>(null);

  // 获取增益值 (如果有)
  const gainValue = gainNodeData?.data?.value
    ? (gainNodeData.data.value as number)
    : 1; // 默认增益为 1

  // 获取音频源 (如果有)
  const audioComponent: Tone.ToneAudioNode | null =
    audioSourceId && audioNodeData?.data?.component
      ? (audioNodeData.data.component as Tone.ToneAudioNode)
      : null;

  const audioComponentRef = useRef<Tone.ToneAudioNode | null>(null);

  useEffect(() => {
    async function startAudio() {
      try {
        await Tone.start();

        const gainNode = new Tone.Gain(gainValue); // 创建 GainNode
        gainRef.current = gainNode;

        // 连接音频源到 GainNode
        if (audioComponent) {
          audioComponent.connect(gainRef.current);
          audioComponentRef.current = audioComponent;
          // 如果 component 是可启动的 Tone.js 音频节点（如 Oscillator），调用 start()
          if (
            "start" in audioComponentRef.current &&
            typeof audioComponentRef.current.start === "function"
          ) {
            audioComponentRef.current.start();
            console.log("Component started");
          }
        }

        // 将 GainNode 更新到 React Flow 中
        updateNodeData(id, { component: gainRef.current });
      } catch (error) {
        console.error("Error starting audio context or component:", error);
      }
    }

    startAudio();

    return () => {
      // 清理，确保断开连接
      if (audioComponentRef.current && gainRef.current) {
        try {
          // 检查是否连接过
          //   if (audioComponentRef.current && gainRef.current) {
          //     audioComponentRef.current.disconnect(gainRef.current);
          //   }

          // 确保 GainNode 尚未被清理
          if (gainRef.current) {
            gainRef.current.dispose();
          }
        } catch (error) {
          console.error("Error during cleanup disconnection:", error);
        } finally {
          // 清理引用，防止后续错误
          audioComponentRef.current = null;
          gainRef.current = null;
        }
      }
    };
  }, [audioComponent, gainValue]); // 保证音频源和增益值的变化能正确处理

  // 监听 connections 的变化，确保正确处理连接和断开
  useEffect(() => {
    if (audioInputConnections.length < 1 && gainRef.current) {
      try {
        gainRef.current.disconnect();
        console.log("Disconnected due to no audio input");
      } catch (error) {
        console.error("Error during disconnection:", error);
      }
    }
  }, [audioInputConnections]);

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
