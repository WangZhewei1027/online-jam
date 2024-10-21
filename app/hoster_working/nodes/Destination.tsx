"use client";
import { useEffect, useRef, Profiler } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useHandleConnections,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";
import { HiOutlineSpeakerWave } from "react-icons/hi2";

import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";
const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
  updateNode: store.updateNode,
});

interface DestinationProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode; // 确保 component 是 ToneAudioNode 类型
  };
}

const Destination = ({
  id,
  data: { label },
  isConnectable,
  selected,
}: DestinationProps & { data: { label: string } }) => {
  const store = useStore(selector, shallow);

  const Connections = store.useHandleConnections(id, "target", "destination");
  const sourceId = Connections?.[0]?.source;
  const sourceHandleId = Connections?.[0]?.sourceHandle;
  const NodeData = store.useNodesData(sourceId);
  const component =
    sourceHandleId && NodeData?.[sourceHandleId]
      ? (NodeData[sourceHandleId] as Tone.ToneAudioNode)
      : null;

  // 使用 useRef 来保持对 component 的持久引用
  const componentRef = useRef<{
    id: string;
    instance: Tone.ToneAudioNode;
  } | null>(null);

  useEffect(() => {
    const startAudio = async () => {
      try {
        // 确保音频上下文已启动
        if (Tone.getContext().state === "suspended") {
          await Tone.start();
          console.log("Audio context started");
        }

        // 如果 component 存在并且与当前连接的 component 不同，则重新连接
        if (component instanceof Tone.ToneAudioNode) {
          const currentComponentId = sourceId || ""; // 使用 sourceId 作为唯一标识符

          // 判断当前的 component 是否与上次的相同
          if (
            !componentRef.current ||
            componentRef.current.id !== currentComponentId
          ) {
            // 如果 component 发生变化，则连接新的 component
            component.connect(Tone.getDestination());
            componentRef.current = {
              id: currentComponentId,
              instance: component,
            }; // 更新引用

            // 如果是 Tone.js 的启动型节点，则启动
            if ("start" in component && typeof component.start === "function") {
              component.start();
              console.log("New component started");
            }
          }
        }
      } catch (error) {
        console.error("Error starting audio context or component:", error);
      }
    };

    startAudio();
    console.log("触发了更新");
  }, [component, sourceId]); // 依赖 component 和 sourceId 进行更新

  // 监听 connections 的变化，检查连接数是否为 0
  useEffect(() => {
    if (Connections.length < 1 && componentRef.current) {
      try {
        Tone.start();
        componentRef.current.instance.disconnect(Tone.getDestination());
        console.log("Component disconnected due to no connections");
        componentRef.current = null; // 清空 ref 以防止后续操作
      } catch (error) {
        console.error("Catch error during disconnection");
      }
    }
  }, [Connections]); // 依赖 connections

  useEffect(() => {
    return () => {
      // 清理时，断开当前 component 的连接
      if (componentRef.current) {
        try {
          componentRef.current.instance.disconnect(Tone.getDestination());
          console.log("Component disconnected during cleanup");
          componentRef.current = null; // 清空 ref
        } catch (error) {
          console.error("Error during cleanup disconnection:", error);
        }
      }
    };
  }, []); // 仅在组件卸载时运行

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <TargetHandle type="target" position={Position.Left} id="destination" />
      <HiOutlineSpeakerWave className="my-icon" />
      <div className="my-label">{label}</div>
    </div>
  );
};

export default Destination;
