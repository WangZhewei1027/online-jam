"use client";
import { useEffect, useState, useCallback, useRef, use } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useEdges,
  useNodesData,
} from "@xyflow/react";
import "../styles.css";
import { getHandleConnections, getNodeData, updateNode } from "../utils/store";
import { PiPianoKeys } from "react-icons/pi";
import * as Tone from "tone";

// 定义 data 的类型，要求 label 是 string，midi 是 number
interface MIDIInputData extends Record<string, unknown> {
  label: string;
  value: number;
}

// 扩展 NodeProps 以包含我们定义的 MIDIInputData 类型
interface MIDIInputProps extends NodeProps {
  data: MIDIInputData;
}

function MIDIInput({ id, data, selected, ...props }: MIDIInputProps) {
  //const store = useStore(selector, shallow);
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));
  const [isLightOn, setIsLightOn] = useState(false); // 灯泡状态

  // //---------- 处理trigger输出 ----------
  // const triggerConnection = getHandleConnections(id, "source", "trigger");
  // const triggerConnections =
  //   triggerConnection.length > 0 ? triggerConnection : [];
  // const triggerSourceNodeData: Tone.ToneAudioNode[] = triggerConnections.map(
  //   (connection) => {
  //     return getNodeData(connection.target, "component") as Tone.ToneAudioNode;
  //   }
  // );

  const keyDown = useCallback((frequency: string) => {
    updateNode(id, {
      value: parseFloat(frequency),
    });
    if (frequencyComponent.current) {
      frequencyComponent.current.value = parseFloat(frequency);
    }

    setIsLightOn(true);

    const triggerConnection = getHandleConnections(id, "source", "trigger");
    const triggerConnections =
      triggerConnection.length > 0 ? triggerConnection : [];
    const triggerSourceNodeData: Tone.ToneAudioNode[] = triggerConnections.map(
      (connection) => {
        return getNodeData(
          connection.target,
          "component"
        ) as Tone.ToneAudioNode;
      }
    );

    if (triggerSourceNodeData.length > 0) {
      triggerSourceNodeData.forEach((component) => {
        if (
          component &&
          "triggerAttack" in component &&
          typeof component.triggerAttack === "function"
        ) {
          component.triggerAttack();
          console.log("triggerAttack");
        }
      });
    }
  }, []);

  const keyUp = useCallback(() => {
    setIsLightOn(false);

    const triggerConnection = getHandleConnections(id, "source", "trigger");
    const triggerConnections =
      triggerConnection.length > 0 ? triggerConnection : [];
    const triggerSourceNodeData: Tone.ToneAudioNode[] = triggerConnections.map(
      (connection) => {
        return getNodeData(
          connection.target,
          "component"
        ) as Tone.ToneAudioNode;
      }
    );

    if (triggerSourceNodeData.length > 0) {
      triggerSourceNodeData.forEach((component) => {
        if (
          component &&
          "triggerRelease" in component &&
          typeof component.triggerRelease === "function"
        ) {
          component.triggerRelease();
          console.log("triggerRelease");
        }
      });
    }
  }, []);

  useEffect(() => {
    updateNode(id, {
      handleKeyDownFunction: keyDown, // 保存引用，而不是直接保存函数
      handleKeyUpFunction: keyUp,
    });

    return () => {
      updateNode(id, {
        handleKeyDownFunction: null,
        handleKeyUpFunction: null,
      });
    };
  }, [keyDown, keyUp]);

  //---------- 处理frequency输出 ----------
  const frequencyComponent = useRef<Tone.Signal | null>(null);
  useEffect(() => {
    if (!frequencyComponent.current) {
      frequencyComponent.current = new Tone.Signal(0);
    }
    updateNode(id, { component: frequencyComponent.current });

    return () => {
      if (frequencyComponent.current) {
        frequencyComponent.current.dispose();
      }
    };
  }, []);

  return (
    <div
      className={`style-node ${selected ? "style-node-selected" : ""} w-24 items-center`}
    >
      <PiPianoKeys className="h-8 w-8" />
      <div
        className={`rounded-full border-2 w-3 h-3 mt-2 ${isLightOn ? "bg-green-500" : ""}`}
        style={{ backgroundColor: `islightOn ? "yellow" : "gray"` }}
      ></div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ top: "30%", width: "10px", height: "10px" }}
        id="component"
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ top: "75%", width: "10px", height: "10px" }}
        id="trigger"
      />
      <div className="absolute left-0 -top-6 text-base">{data.label}</div>
    </div>
  );
}

export default MIDIInput;
