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
        }

        // 如果 component 存在并且与当前连接的 component 不同，则重新连接
        if (component) {
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
    if (connections.length < 1 && componentRef.current) {
      try {
        Tone.start();
        componentRef.current.instance.disconnect(Tone.getDestination());
        console.log("Component disconnected due to no connections");
        componentRef.current = null; // 清空 ref 以防止后续操作
      } catch (error) {
        console.error("Catch error during disconnection");
      }
    }
  }, [connections]); // 依赖 connections

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

  function onRenderCallback(
    id: any, // the "id" prop of the Profiler tree that has just committed
    phase: any, // either "mount" (if the tree just mounted) or "update" (if it re-rendered)
    actualDuration: any, // time spent rendering the committed update
    baseDuration: any, // estimated time to render the entire subtree without memoization
    startTime: any, // when React began rendering this update
    commitTime: any, // when React committed this update
    interactions: any // the Set of interactions belonging to this update
  ) {
    console.log(`Profiler ID: ${id}, Phase: ${phase}`);
    console.log(`Actual duration: ${actualDuration}`);
    console.log(`Base duration: ${baseDuration}`);
  }

  return (
    <Profiler id="Destination" onRender={onRenderCallback}>
      <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
        <TargetHandle type="target" position={Position.Left} id="destination" />
        <HiOutlineSpeakerWave className="my-icon" />
        <div className="my-label">{label}</div>
      </div>
    </Profiler>
  );
};

export default Destination;
