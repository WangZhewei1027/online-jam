"use client";
import { useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";
import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";
import { getSourceData, useConnectionData } from "../utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
  updateNode: store.updateNode,
});

function Oscillator({
  id,
  data: { label, type },
  selected,
}: NodeProps & { data: { label: string; type: string } }) {
  const store = useStore(selector, shallow);
  const [waveType, setWaveType] = useState(type); // 当前波形类型
  const oscRef = useRef<Tone.Oscillator | null>(null); // 创建 Tone.Oscillator

  // 获取频率控制输入
  const {
    connections: frequencyConnections,
    sourceHandleId: frequencyHandleId,
    sourceNodeId: frequencyNodeId,
  } = useConnectionData(store, id, "frequency");

  let frequency: number = 0;
  if (frequencyConnections.length > 0) {
    const data = getSourceData(store, frequencyNodeId, frequencyHandleId);
    if (typeof data === "number" && data > 0) {
      frequency = data;
    }
  }

  // 初始化振荡器并清理
  useEffect(() => {
    if (!oscRef.current) {
      oscRef.current = new Tone.Oscillator(0, type as Tone.ToneOscillatorType);
      oscRef.current.start();
    }
    store.updateNode(id, { component: oscRef.current });

    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.dispose();
      }
      console.log("Oscillator disposed");
    };
  }, []);

  // 更新频率
  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.frequency.rampTo(frequency, 0);
    }
  }, [frequency]);

  // 更新波形类型
  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.type = waveType as Tone.ToneOscillatorType; // 使用 Tone.js 支持的波形类型
      store.updateNode(id, {
        type: waveType,
      });
    }
  }, [waveType]);

  return (
    <div
      className={`my-node ${
        selected ? "my-node-selected" : ""
      } w-[64px] h-[64px]`}
    >
      {/* 频率输入句柄 */}
      <TargetHandle
        id="frequency"
        type="target"
        position={Position.Left}
        style={{ top: "30%" }}
      />
      <div className="absolute text-[6px] font-bold top-[30%] left-1 -translate-y-1/2">
        <div>Frequency</div>
        <div>{frequency} Hz</div>
      </div>

      {/* 波形类型输入句柄 */}
      <TargetHandle
        id="type"
        type="target"
        position={Position.Left}
        style={{ top: "70%" }}
      />
      <div className="absolute text-[6px] font-bold top-[70%] left-1 -translate-y-1/2">
        <div>Type</div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="border">
              {waveType}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Wave Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["sine", "square", "triangle", "sawtooth"].map((type) => (
                <DropdownMenuItem key={type} onClick={() => setWaveType(type)}>
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 振荡器输出句柄 */}
      <Handle type="source" position={Position.Right} id="component" />

      {/* 显示标签 */}
      <div className="my-label">{label}</div>
    </div>
  );
}

export default Oscillator;
