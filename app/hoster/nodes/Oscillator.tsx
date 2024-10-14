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
import { random } from "nanoid";

function Oscillator({
  id,
  data: { label },
  isConnectable,
  selected,
}: NodeProps & { data: { label: string } }) {
  const { updateNodeData } = useReactFlow();

  const frequencyConnections = useHandleConnections({
    type: "target",
    id: "frequency",
  });

  const frequencyNodeData = useNodesData(frequencyConnections?.[0]?.source);

  const frequency = frequencyNodeData?.data.value
    ? (frequencyNodeData.data.value as number)
    : 0;

  // 使用 useRef 存储 Tone.Oscillator 实例
  const oscRef = useRef<Tone.Oscillator | null>(null);

  // 使用 useEffect 在组件挂载时创建 oscillator
  useEffect(() => {
    const osc = new Tone.Oscillator(frequency > 0 ? frequency : 0, "sine");
    osc.volume.value = -20;
    oscRef.current = osc;
    updateNodeData(id, { component: osc });

    // 清理函数，组件卸载时停止 oscillator
    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.dispose();
      }
    };
  }, [frequency]);

  return (
    <div
      className={`my-node ${
        selected ? "my-node-selected" : ""
      } w-[48px] h-[48px]`}
    >
      <TargetHandle type="target" position={Position.Left} id="frequency" />
      <div className="absolute text-[6px] font-bold top-[50%] left-1 -translate-y-1/2">
        HZ
      </div>
      <Handle type="source" position={Position.Right} />
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Oscillator;
