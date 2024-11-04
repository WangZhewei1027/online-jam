"use client";
import { use, useEffect, useRef } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";
import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";
import { getSourceData, useConnectionData } from "../utils";
import { start } from "repl";

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

  const lastConnectedComponent = useRef<Tone.ToneAudioNode | null>(null);

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
    const gainNode = gainRef.current;

    // 平滑过渡到新值
    gainNode.gain.rampTo(gainValue, 0.05);
    console.log("Gain value updated to", gainValue);
  }, [gainValue]); // 仅在 gainValue 变化时调用

  useEffect(() => {
    const gainNode = gainRef.current;

    if (audioComponent instanceof Tone.ToneAudioNode) {
      // 若存在前一个连接，先断开
      if (lastConnectedComponent.current) {
        lastConnectedComponent.current.disconnect(gainNode);
      }

      // 新的音频组件连接到 GainNode
      audioComponent.connect(gainNode);
      if (
        "start" in audioComponent &&
        typeof audioComponent.start === "function"
      ) {
        audioComponent.start();
      }

      // 更新引用
      audioComponentRef.current = {
        id: audioSourceId,
        instance: audioComponent,
      };
      lastConnectedComponent.current = audioComponent;
      console.log("Connected new audio component to GainNode");
    }

    return () => {
      // 在依赖项变化或卸载时清理
      if (lastConnectedComponent.current) {
        lastConnectedComponent.current.disconnect(gainNode);
        lastConnectedComponent.current = null;
        console.log("Disconnected previous audio component from GainNode");
      }
    };
  }, [audioComponent]); // 仅在 audioComponent 变化时执行

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
