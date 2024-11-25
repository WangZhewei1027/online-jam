"use client";
import { useEffect, useRef, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";
import { getHandleConnections, getNodeData, updateNode } from "../utils/store";
import { Slider } from "@/components/ui/slider";
import { GiEchoRipples } from "react-icons/gi";

interface ReverbNodeProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode;
    label: string;
    wet?: number;
  };
}

const Reverb = ({ id, data: { label, wet }, selected }: ReverbNodeProps) => {
  const [wetValue, setWetValue] = useState(wet ?? 0.5); // 默认湿干比为 50%
  const audioComponent = useRef<Tone.ToneAudioNode | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null);

  const audioConnection = getHandleConnections(id, "target", "audio");
  const audioSourceNodeData =
    audioConnection.length > 0 && audioConnection[0].sourceHandle
      ? getNodeData(audioConnection[0].source, audioConnection[0].sourceHandle)
      : null;

  useEffect(() => {
    // 初始化 Reverb 节点
    if (!reverbRef.current) {
      reverbRef.current = new Tone.Reverb({ decay: 2, preDelay: 0.01 });
      reverbRef.current.wet.value = wetValue;
      updateNode(id, { component: reverbRef.current });
    }

    return () => {
      // 组件卸载时清理资源
      reverbRef.current?.dispose();
      reverbRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.wet.rampTo(wetValue, 0.1); // 平滑更新湿干比
      updateNode(id, { wet: wetValue });
    }
  }, [wetValue]);

  useEffect(() => {
    if (reverbRef.current) {
      if (audioSourceNodeData instanceof Tone.ToneAudioNode) {
        console.log(
          "Connecting Audio Source to ReverbNode:",
          audioSourceNodeData
        );
        audioComponent.current?.disconnect(reverbRef.current);
        audioComponent.current = audioSourceNodeData;
        audioComponent.current.connect(reverbRef.current);
      } else if (audioComponent.current) {
        console.log(
          "Disconnecting Audio Source from ReverbNode:",
          audioComponent.current
        );
        audioComponent.current.disconnect(reverbRef.current);
        audioComponent.current = null;
      }
    }
  }, [audioSourceNodeData, reverbRef.current, audioComponent.current]);

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} `}>
      <div className="flex justify-center">
        <GiEchoRipples className="w-8 h-8" />
      </div>
      <div className="mt-4">
        <div className="flex place-content-between">
          <div className="text-sm">Wet/Dry</div>
          <div className="text-sm">{(wetValue * 100).toFixed(1)}%</div>
        </div>
        <Slider
          min={0}
          max={1}
          step={0.01}
          defaultValue={[wet ?? 0.5]}
          onValueChange={(num) => setWetValue(num[0])}
          className="nodrag w-32 mt-2"
        />
      </div>
      {/* 音频输入句柄 */}
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "50%", width: "10px", height: "10px" }}
        id="audio"
      />

      {/* 输出句柄 */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: "10px", height: "10px" }}
        id="component"
      />

      {/* 显示标签 */}
      <div className="absolute left-0 -top-6 text-base">{label}</div>
    </div>
  );
};

export default Reverb;
