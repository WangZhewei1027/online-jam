"use client";
import { use, useEffect, useRef } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";
import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";
import { getSourceData, useConnectionData } from "../utils";

const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
  updateNode: store.updateNode,
});

interface GainNodeProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode;
    label: string;
  };
}

const GainNode = ({ id, data: { label }, selected }: GainNodeProps) => {
  const store = useStore(selector, shallow);

  // 获取audio输入连接
  const {
    connections: audioConnections,
    sourceHandleId: audioSourceHandleId,
    sourceNodeId: audioSourceId,
  } = useConnectionData(store, id, "audio");
  const audioComponent = getSourceData(store, audioSourceId, "component");
  // 使用 ref 保持对连接组件的引用
  const audioComponentRef = useRef<{
    id: string;
    instance: Tone.ToneAudioNode;
  } | null>(
    audioComponent instanceof Tone.ToneAudioNode
      ? { id: audioSourceId, instance: audioComponent }
      : null
  );

  // 创建 Gain 实例并存储在 ref 中
  const {
    connections: gainConnections,
    sourceHandleId: gainSourceHandleId,
    sourceNodeId: gainSourceId,
  } = useConnectionData(store, id, "gain");
  var gainValue: number = 1;
  if (!(gainConnections.length < 1)) {
    const data = getSourceData(store, gainSourceId, gainSourceHandleId);
    if (typeof data === "number" && data >= 0) {
      gainValue = data;
    }
  }
  const gainRef = useRef<Tone.Gain>(new Tone.Gain(gainValue));

  useEffect(() => {
    if (!gainRef.current) {
      gainRef.current = new Tone.Gain(gainValue);
    }
    store.updateNode(id, { component: gainRef.current });
    return () => {
      gainRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    // 获取当前 Gain 节点并平滑过渡到新值
    const gainNode = gainRef.current;
    gainNode.gain.rampTo(gainValue, 0.05);
    console.log("Gain value updated to", gainValue);

    const currentComponentId = audioSourceId || "";
    if (
      audioComponent instanceof Tone.ToneAudioNode &&
      (!audioComponentRef.current ||
        audioComponentRef.current.id !== currentComponentId)
    ) {
      audioComponentRef.current?.instance.disconnect(gainNode);
      audioComponent.connect(gainNode);
      audioComponentRef.current = {
        id: currentComponentId,
        instance: audioComponent,
      };
      if (
        "start" in audioComponent &&
        typeof audioComponent.start === "function"
      ) {
        audioComponent.start();
      }
    }
  }, [audioComponent, gainValue]);

  // 检查音频输入连接，若为空则断开 Gain 节点
  useEffect(() => {
    if (audioConnections.length < 1 && gainRef.current) {
      gainRef.current.disconnect();
      console.log("Disconnected Gain due to no audio input connections");
    }
  }, [audioConnections]);

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
