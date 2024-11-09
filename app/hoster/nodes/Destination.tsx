"use client";
import { useEffect, useRef } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useEdges,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import {
  useStore,
  StoreState,
  getHandleConnections,
  getNodeData,
} from "../utils/store";
import {
  isAudioSourceNode,
  isControlSignalNode,
  isFunctionalNode,
} from "../utils/tone";
import { DestinationClass } from "tone/build/esm/core/context/Destination";

interface DestinationProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode;
    label: string;
  };
}

const Destination = ({ id, data: { label }, selected }: DestinationProps) => {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));
  console.log(id, " rendered");

  // ---------- 处理destination的逻辑 ---------- //
  const desRef = useRef<DestinationClass | null>(null);

  useEffect(() => {
    // 初始化目的地，确保只执行一次
    if (!desRef.current) {
      desRef.current = Tone.getDestination();
    }

    return () => {
      // 组件卸载时清理目的地连接
      if (audioComponent.current) {
        try {
          audioComponent.current.disconnect(Tone.getDestination());
          audioComponent.current = null;
        } catch (error) {
          console.error("Error during cleanup disconnection:", error);
        }
      }
      desRef.current = null; // 确保 desRef 也被清空
    };
  }, []);

  // ---------- 处理audio input的逻辑 ---------- //
  const audioComponent = useRef<Tone.ToneAudioNode | null>(null);

  const audioConnection = getHandleConnections(id, "target", "destination");

  // 获取连接的音频源数据
  const audioSourceNodeData =
    audioConnection.length > 0 && audioConnection[0].sourceHandle
      ? getNodeData(audioConnection[0].source, audioConnection[0].sourceHandle)
      : null;

  // 处理音频源的连接和断开逻辑
  useEffect(() => {
    if (desRef.current) {
      if (
        isAudioSourceNode(audioSourceNodeData) ||
        isFunctionalNode(audioSourceNodeData)
      ) {
        // 如果音频源是 ToneAudioNode，则连接
        if (audioComponent.current !== audioSourceNodeData) {
          // 防止重复连接相同的节点
          audioComponent.current?.disconnect(desRef.current);
          audioComponent.current = audioSourceNodeData;
          audioComponent.current.connect(desRef.current);
        }
      } else if (audioComponent.current) {
        // 如果音频源不是 ToneAudioNode，则断开连接
        if (
          "disconnect" in audioComponent.current &&
          typeof audioComponent.current.disconnect === "function"
        ) {
          audioComponent.current.disconnect(desRef.current);
        }
        audioComponent.current = null;
      }
    }
  }, [audioSourceNodeData]); // 依赖于音频源数据

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <Handle type="target" position={Position.Left} id="destination" />
      <HiOutlineSpeakerWave className="my-icon" />
      <div className="my-label">{label}</div>
    </div>
  );
};

export default Destination;
