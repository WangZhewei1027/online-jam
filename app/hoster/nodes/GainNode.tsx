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
import TargetHandle from "./TargetHandle";
import {
  useStore,
  StoreState,
  getHandleConnections,
  getNodeData,
  updateNode,
} from "../utils/store";
import { shallow } from "zustand/shallow";

const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
});

interface GainNodeProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode;
    label: string;
  };
}

const GainNode = ({ id, data: { label }, selected }: GainNodeProps) => {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));
  console.log(id, " rendered");

  // ---------- 处理audio input的逻辑 ---------- //
  const audioComponent = useRef<Tone.ToneAudioNode | null>(null);

  const audioConnection = getHandleConnections(id, "target", "audio");

  const audioSourceNodeData =
    audioConnection.length > 0 && audioConnection[0].sourceHandle
      ? getNodeData(audioConnection[0].source, audioConnection[0].sourceHandle)
      : null;

  // ---------- Gain 值输入端口的连接信息 ----------
  const gainInputRef = useRef<number | Tone.ToneAudioNode>(1);

  const gainConnections = getHandleConnections(id, "target", "gain");

  // 获取 Gain 控制的数据
  const gainSourceData: number | Tone.ToneAudioNode =
    gainConnections.length > 0 && gainConnections[0].sourceHandle
      ? getNodeData(gainConnections[0].source, gainConnections[0].sourceHandle)
      : null;

  if (gainSourceData instanceof Tone.ToneAudioNode) {
    console.log("Gain value is ToneAudioNode");
    gainInputRef.current = gainSourceData as Tone.ToneAudioNode;
  } else if (typeof gainSourceData === "number") {
    gainInputRef.current = gainSourceData as number;
  } else {
    gainInputRef.current = 1;
  }

  // ---------- 初始化GainNode ----------
  const gainRef = useRef<Tone.Gain | null>(null); // Tone.Gain 的引用

  useEffect(() => {
    // 初始化 Tone.Gain 实例
    if (!gainRef.current) {
      gainRef.current = new Tone.Gain(1);
      updateNode(id, { component: gainRef.current });
    }

    return () => {
      // 清理 Gain 实例，防止内存泄漏
      gainRef.current?.dispose();
      gainRef.current = null;
    };
  }, []);

  // 更新 Gain 值，当 gainValue 改变时触发
  useEffect(() => {
    if (gainRef.current) {
      console.log(gainInputRef.current);
      if (typeof gainInputRef.current === "number") {
        gainRef.current.gain.rampTo(gainInputRef.current, 0.05);
        console.log("gainValueRef is number");
      } else if (gainInputRef.current instanceof Tone.ToneAudioNode) {
        gainInputRef.current.connect(gainRef.current.gain);
        console.log("gainValueRef is ToneAudioNode");
      }
    }

    return () => {
      if (
        gainInputRef.current instanceof Tone.ToneAudioNode &&
        gainRef.current
      ) {
        gainInputRef.current.disconnect(gainRef.current.gain);
      }
    };
  }, [gainSourceData, gainRef.current, gainInputRef.current]);

  // 处理音频组件的连接
  useEffect(() => {
    if (gainRef.current) {
      if (audioSourceNodeData instanceof Tone.ToneAudioNode) {
        // 如果音频源是 ToneAudioNode，则连接
        if (audioComponent.current !== audioSourceNodeData) {
          // 防止重复连接相同的节点
          audioComponent.current?.disconnect(gainRef.current);
          audioComponent.current = audioSourceNodeData;
          audioComponent.current.connect(gainRef.current);
        }
      } else if (audioComponent.current) {
        // 如果音频源不是 ToneAudioNode，则断开连接
        audioComponent.current.disconnect(gainRef.current);
        audioComponent.current = null;
      }
    }

    return () => {};
  }, [audioSourceNodeData, gainRef.current, audioComponent.current]);

  return (
    <div
      className={`my-node ${
        selected ? "my-node-selected" : ""
      } w-[48px] h-[48px]`}
    >
      {/* 音频输入句柄 */}
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "30%" }}
        id="audio"
      />
      <div
        style={{ top: "30%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        Input
      </div>

      {/* Gain 值输入句柄 */}
      <TargetHandle
        type="target"
        position={Position.Left}
        id="gain"
        style={{ top: "70%" }}
      />
      <div
        style={{ top: "70%" }}
        className="absolute text-[6px] font-bold left-1 -translate-y-1/2"
      >
        Gain
      </div>

      {/* 输出句柄 */}
      <Handle type="source" position={Position.Right} id="component" />

      {/* 显示标签 */}
      <div className="my-label">{label}</div>
    </div>
  );
};

export default GainNode;
