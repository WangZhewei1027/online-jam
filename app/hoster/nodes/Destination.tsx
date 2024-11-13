"use client";
import { useEffect, useRef, useState } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useEdges,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import { VscUnmute } from "react-icons/vsc";
import { VscMute } from "react-icons/vsc";
import {
  useStore,
  StoreState,
  getHandleConnections,
  getNodeData,
} from "../utils/store";
import {
  isAudioSourceNode,
  isControlSignalNode,
  isFunctionalNode,
} from "../utils/tone";
import { DestinationClass } from "tone/build/esm/core/context/Destination";
import { Slider } from "@/components/ui/slider";

interface DestinationProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode;
    label: string;
  };
}

const Destination = ({ id, data: { label }, selected }: DestinationProps) => {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  const [volumn, setVolumn] = useState(0);

  // ---------- 处理destination的逻辑 ---------- //
  const desRef = useRef<DestinationClass | null>(null);

  useEffect(() => {
    if (!desRef.current) {
      desRef.current = Tone.getDestination();
      console.log(Tone.getContext().latencyHint);
    }

    return () => {
      if (
        audioComponent.current &&
        audioComponent.current instanceof Tone.ToneAudioNode &&
        typeof audioComponent.current.disconnect === "function"
      ) {
        try {
          audioComponent.current.disconnect(Tone.getDestination());
        } catch (error) {
          console.error("Error during cleanup disconnection:", error);
        }
      }
      audioComponent.current = null; // 清空引用
      desRef.current = null; // 清空目标节点引用
    };
  }, []);

  // ---------- 处理audio input的逻辑 ---------- //
  const audioComponent = useRef<Tone.ToneAudioNode | null>(null);

  const audioConnection = getHandleConnections(id, "target", "destination");

  // 获取连接的音频源数据
  const audioSourceNodeData =
    audioConnection.length > 0 && audioConnection[0].sourceHandle
      ? getNodeData(audioConnection[0].source, audioConnection[0].sourceHandle)
      : null;

  // 处理音频源的连接和断开逻辑
  useEffect(() => {
    if (desRef.current) {
      if (
        isAudioSourceNode(audioSourceNodeData) ||
        isFunctionalNode(audioSourceNodeData)
      ) {
        // 如果音频源是 ToneAudioNode，则连接
        if (audioComponent.current !== audioSourceNodeData) {
          // 防止重复连接相同的节点
          try {
            try {
              audioComponent.current?.disconnect(desRef.current);
              console.log("disconnect previous node");
            } catch (e) {
              console.error("disconnect previous node error", e);
            }
            audioComponent.current = audioSourceNodeData;
            audioComponent.current.connect(desRef.current);
          } catch (e) {
            console.error("error 1", e);
          }
        }
      } else if (audioComponent.current) {
        // 如果音频源不是 ToneAudioNode，则断开连接
        try {
          if (
            "disconnect" in audioComponent.current &&
            typeof audioComponent.current.disconnect === "function"
          ) {
            console.log("audioComponent.current:", audioComponent.current);
            console.log("desRef.current:", desRef.current);
            audioComponent.current.disconnect(desRef.current);
          }
          audioComponent.current = null;
        } catch (e) {
          // 这个错误因为异步的原因可能是不可避免的
          console.error("error 2", e);
          console.log("AudioContext state:", Tone.context.state);
          // console.log("Tone.js nodes:", Tone.context._nodes);
        }
      }
    }
  }, [audioSourceNodeData]); // 依赖于音频源数据

  useEffect(() => {
    if (desRef.current) {
      desRef.current.volume.value = volumn <= -30 ? -Infinity : volumn;
    }

    if (Tone.getContext().state === "suspended") {
      Tone.start();
    }
  }, [volumn]);

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} `}>
      <Handle
        type="target"
        position={Position.Left}
        id="destination"
        style={{ width: "10px", height: "10px" }}
      />
      <div className="flex flex-col items-center">
        {volumn > -30 ? (
          <VscUnmute className="my-icon w-8 h-8" />
        ) : (
          <VscMute className="w-8 h-8" />
        )}
        <div className="mt-4">
          <div className="flex place-content-between">
            <div className="text-sm">Volumn</div>
            <div className="text-sm">
              {volumn > -30 ? volumn.toFixed(1) : "-∞"} db
            </div>
          </div>
          <Slider
            min={-30}
            max={0}
            step={0.1}
            defaultValue={[0]}
            onValueChange={(num) => setVolumn(num[0])}
            className="nodrag w-32 mt-2"
          />
        </div>
      </div>
      <div className="absolute left-0 -top-6 text-base">{label}</div>
    </div>
  );
};

export default Destination;
