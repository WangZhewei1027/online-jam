"use client";
import { use, useEffect, useRef, useState } from "react";
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
import { getHandleConnections, getNodeData, updateNode } from "../utils/store";
import { Slider } from "@/components/ui/slider";
import { data } from "autoprefixer";

interface GainNodeProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode;
    label: string;
    value?: number;
  };
}

const GainNode = ({ id, data: { label, value }, selected }: GainNodeProps) => {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  const [gain, setGain] = useState(1);
  const [disabled, setDisabled] = useState(false);

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

  // if (gainSourceData instanceof Tone.ToneAudioNode) {
  //   console.log("Gain value is ToneAudioNode");
  //   gainInputRef.current = gainSourceData as Tone.ToneAudioNode;
  // } else if (typeof gainSourceData === "number") {
  //   gainInputRef.current = gainSourceData as number;
  // } else {
  //   gainInputRef.current = 1;
  // }

  // ---------- 初始化GainNode ----------
  const gainRef = useRef<Tone.Gain | null>(null); // Tone.Gain 的引用

  useEffect(() => {
    // 初始化 Tone.Gain 实例
    if (!gainRef.current) {
      gainRef.current = new Tone.Gain(1);
      updateNode(id, { component: gainRef.current });
    }

    if (value) {
      setGain(value);
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
      if (typeof gainSourceData === "number") {
        gainInputRef.current = gainSourceData;
        gainRef.current.gain.rampTo(gainInputRef.current, 0.05);
        console.log("gainValueRef is number");
      } else if (gainSourceData instanceof Tone.ToneAudioNode) {
        gainInputRef.current = gainSourceData;
        gainInputRef.current.connect(gainRef.current.gain);
        console.log("gainValueRef is ToneAudioNode");
      }
    }

    if (gainInputRef.current instanceof Tone.Envelope) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }

    return () => {
      console.log(gainInputRef.current);
      if (
        gainInputRef.current instanceof Tone.ToneAudioNode &&
        gainRef.current
      ) {
        gainInputRef.current.disconnect(gainRef.current.gain);
        gainRef.current.gain.rampTo(gain, 0.05);
        console.log("disconnect gainValueRef");
      }
      gainInputRef.current = 1;
    };
  }, [gainSourceData, gainRef.current]);

  useEffect(() => {
    if (gainRef.current && !(gainSourceData instanceof Tone.ToneAudioNode)) {
      console.log("Gain value changed to", gain);
      gainRef.current.gain.rampTo(gain, 0.01);
      updateNode(id, { value: gain });
    }
  }, [gain]);

  useEffect(() => {
    if (gainRef.current) {
      if (audioSourceNodeData instanceof Tone.ToneAudioNode) {
        console.log(
          "Connecting Audio Source to GainNode:",
          audioSourceNodeData
        );
        audioComponent.current?.disconnect(gainRef.current);
        audioComponent.current = audioSourceNodeData;
        audioComponent.current.connect(gainRef.current);
      } else if (audioComponent.current) {
        console.log(
          "Disconnecting Audio Source from GainNode:",
          audioComponent.current
        );
        audioComponent.current.disconnect(gainRef.current);
        audioComponent.current = null;
      }
    }
  }, [audioSourceNodeData, gainRef.current, audioComponent.current]);

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} `}>
      <div className="mt-6">
        <div className="flex place-content-between">
          <div className="text-sm">Gain</div>
          <div className="text-sm">
            {disabled ? "-" : (gain * 100).toFixed(1)} %
          </div>
        </div>
        <Slider
          min={0}
          max={2}
          step={0.001}
          defaultValue={[value ? value : 1]}
          onValueChange={(num) => setGain(num[0])}
          className="nodrag w-32 mt-2 data-[disabled]:opacity-50"
          disabled={disabled}
        />
      </div>
      {/* 音频输入句柄 */}
      <TargetHandle
        type="target"
        position={Position.Left}
        style={{ top: "25%", width: "10px", height: "10px" }}
        id="audio"
      />

      {/* Gain 值输入句柄 */}
      <Handle
        type="target"
        position={Position.Left}
        id="gain"
        style={{ top: "74%", width: "10px", height: "10px" }}
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

export default GainNode;
