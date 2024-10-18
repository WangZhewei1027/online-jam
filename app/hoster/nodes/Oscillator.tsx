"use client";
import { useEffect, useRef, Profiler } from "react";
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

function Oscillator({
  id,
  data: { label },
  isConnectable,
  selected,
}: NodeProps & { data: { label: string } }) {
  // 获取 updateNodeData 方法，用于更新 React Flow 中节点的数据
  const { updateNodeData } = useReactFlow();

  // 获取与 "frequency" 目标端口的连接信息
  const frequencyConnections = useHandleConnections({
    type: "target",
    id: "frequency",
  });

  // 获取与该连接对应的源节点数据
  const frequencyNodeData = useNodesData(frequencyConnections?.[0]?.source);

  // 获取频率值，如果没有则默认为 0
  const frequency: number =
    (frequencyNodeData?.data.value as number) >= 0
      ? (frequencyNodeData?.data.value as number)
      : 0;

  // 使用 useRef 来存储 Tone.Oscillator 的实例，这样可以避免在重新渲染时重新创建
  const oscRef = useRef<Tone.Oscillator>(new Tone.Oscillator(0, "sine"));

  // 使用 useEffect 钩子在组件挂载时创建振荡器
  useEffect(() => {
    if (!oscRef.current) {
      oscRef.current = new Tone.Oscillator(
        frequency >= 0 ? frequency : 0,
        "sine"
      );
      oscRef.current.start();
    }

    // 将该振荡器实例存储到 React Flow 的节点数据中，便于其他节点访问
    console.log("Update Oscillator component", oscRef.current);
    updateNodeData(id, { component: oscRef.current });

    return () => {
      // 清理振荡器，避免内存泄露
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.dispose();
      }
    };
  }, []); // 只在挂载和卸载时运行

  /**
   * 使用 useEffect 钩子在组件挂载时创建振荡器。
   * 每当频率值发生变化时，创建新的振荡器实例并更新它。
   */
  useEffect(() => {
    if (frequency >= 0) {
      console.log("Update Oscillator frequency", frequency);
      if (!oscRef.current) {
        return;
      }
      // 启动振荡器（如果它还没有启动）
      if (oscRef.current.state !== "started") {
        oscRef.current.start(); // 启动振荡器
      }

      // 设置振荡器的频率
      oscRef.current.frequency.rampTo(frequency, 0);
    }
  }, [frequency]); // 当 frequency 变化时重新执行该 effect

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
    <Profiler id="Oscillator" onRender={onRenderCallback}>
      <div
        className={`my-node ${
          selected ? "my-node-selected" : ""
        } w-[48px] h-[48px]`}
      >
        {/* 左侧的 Handle 用于接受其他节点的频率输入 */}
        <TargetHandle type="target" position={Position.Left} id="frequency" />

        {/* 显示频率的标签 */}
        <div className="absolute text-[6px] font-bold top-[50%] left-1 -translate-y-1/2">
          HZ
        </div>

        {/* 右侧的 Handle 用于将振荡器输出连接到其他节点 */}
        <Handle type="source" position={Position.Right} />

        {/* 节点标签，显示传入的 label */}
        <div className="my-label">{label}</div>
      </div>
    </Profiler>
  );
}

export default Oscillator;
