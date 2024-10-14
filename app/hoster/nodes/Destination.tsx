"use client";
import { useEffect, useRef } from "react";
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

interface DestinationProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode; // make sure component is a ToneAudioNode
  };
}

const Destination = ({
  id,
  data: { label },
  isConnectable,
  selected,
}: DestinationProps & { data: { label: string } }) => {
  // 获取与 destination 的连接
  const connections = useHandleConnections({
    type: "target",
    id: "destination",
  });

  // 确保 connections 存在，并且有一个有效的 source
  const sourceId = connections.length > 0 ? connections[0].source : null;
  const componentNodeData = useNodesData(sourceId || "");

  // 确保 componentNodeData 存在并且有 component
  const component: Tone.ToneAudioNode | null =
    sourceId && componentNodeData?.data?.component
      ? (componentNodeData.data.component as Tone.ToneAudioNode)
      : null;

  // 使用 useRef 来保持对 component 的持久引用
  const componentRef = useRef<Tone.ToneAudioNode | null>(null);

  useEffect(() => {
    const startAudio = async () => {
      try {
        // 确保音频上下文已启动
        await Tone.start();

        // 确保 component 存在后再进行连接操作
        if (component) {
          component.connect(Tone.getDestination());
          componentRef.current = component; // 将 component 存储在 useRef 中

          // 如果 component 是可启动的 Tone.js 音频节点（如 Oscillator），调用 start()
          if ("start" in component && typeof component.start === "function") {
            component.start();
            console.log("Component started");
          }
        }
      } catch (error) {
        console.error("Error starting audio context or component:", error);
      }
    };

    startAudio();
  }, [component]); // 依赖 component 进行音频操作

  // 监听 connections 的变化，检查连接数是否为 0
  useEffect(() => {
    if (connections.length < 1 && componentRef.current) {
      try {
        Tone.start();
        componentRef.current.disconnect(Tone.getDestination());
        console.log("Component disconnected due to no connections");
        componentRef.current = null; // 清空 ref 以防止后续操作
      } catch (error) {
        console.error("Catch error during disconnection");
      }
    }
  }, [connections]); // 依赖 connections

  useEffect(() => {
    return () => {
      // 使用 ref 中的 component 来执行清理
      if (componentRef.current) {
        try {
          componentRef.current.disconnect(Tone.getDestination());
          console.log("Component disconnected from destination");
          componentRef.current = null; // 确保清理后 ref 为空
        } catch (error) {
          console.error("Error during cleanup disconnection:", error);
        }
      }
    };
  }, []); // 依赖数组为空，清理只在卸载时运行

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <TargetHandle type="target" position={Position.Left} id="destination" />
      <HiOutlineSpeakerWave className="my-icon" />
      <div className="my-label">{label}</div>
    </div>
  );
};

export default Destination;
