"use client";
import { useEffect, useRef } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useHandleConnections,
  useNodesData,
  useReactFlow,
  useEdges,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import { getHandleConnections, getNodeData, updateNode } from "../utils/store";

interface AnalyserProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode; // 确保 component 是 ToneAudioNode 类型
    label: string;
  };
}

const Analyser = ({
  id,
  data: { label },
  isConnectable,
  selected,
}: AnalyserProps) => {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  // -------- 获取 input 输入端口的连接信息 --------
  const audioComponent = useRef<Tone.ToneAudioNode | null>(null);

  const audioConnection = getHandleConnections(id, "target", "input");

  const audioSourceNodeData =
    audioConnection.length > 0 && audioConnection[0].sourceHandle
      ? getNodeData(audioConnection[0].source, audioConnection[0].sourceHandle)
      : null;

  // -------- 自身的 ref --------
  const analyserRef = useRef<Tone.Analyser | null>(null);

  // -------- 缓存音频波形数据 --------
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<number[]>(new Array(1024).fill(0));

  // -------- Tone.Analyser 初始化与清理 --------
  useEffect(() => {
    if (!analyserRef.current) {
      analyserRef.current = new Tone.Analyser("waveform", 1024);
      updateNode(id, { component: analyserRef.current });
    }

    return () => {
      if (analyserRef.current) {
        analyserRef.current.dispose();
        analyserRef.current = null;
      }
    };
  }, []);

  // -------- 监听 audioSourceNodeData 的变化 --------
  useEffect(() => {
    if (analyserRef.current) {
      try {
        // 如果有新的音频源，断开旧的连接并连接新源
        if (
          audioSourceNodeData instanceof Tone.ToneAudioNode &&
          audioComponent.current !== audioSourceNodeData
        ) {
          audioComponent.current?.disconnect(analyserRef.current);
          audioComponent.current = audioSourceNodeData;
          audioComponent.current.connect(analyserRef.current);
        }
      } catch (error) {
        console.error("Error during connection setup:", error);
      }
    }

    return () => {
      if (audioComponent.current && analyserRef.current) {
        try {
          audioComponent.current.disconnect(analyserRef.current);
        } catch (error) {
          console.error("Error during cleanup disconnection:", error);
        }
        audioComponent.current = null;
      }
    };
  }, [audioSourceNodeData]);

  // -------- 监听 Canvas 绘图 --------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const drawWaveform = () => {
      animationId = requestAnimationFrame(drawWaveform);

      if (!analyserRef.current) return;
      const waveform = analyserRef.current.getValue();

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制波形
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      for (let i = audioRef.current.length - 1; i > 0; i--) {
        audioRef.current[i] = audioRef.current[i - 1];
      }
      audioRef.current[0] = waveform[0] as number;

      for (let i = 0; i < audioRef.current.length; i++) {
        const x = (i / audioRef.current.length) * canvas.width;
        const y = ((1 + audioRef.current[i]) * canvas.height) / 2;
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 更新节点值
      updateNode(id, { value: waveform[0] });
    };

    drawWaveform();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} `}>
      {/* 输入与输出句柄 */}
      <Handle type="target" position={Position.Left} id="input" />
      <Handle type="source" position={Position.Right} id="value" />
      {/* Canvas 显示波形 */}
      <canvas ref={canvasRef} className="oscilloscope w-full h-full" />
      <div className="my-label">{label}</div>
    </div>
  );
};

export default Analyser;
