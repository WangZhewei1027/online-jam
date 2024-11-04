"use client";
import { useEffect, useRef } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import TargetHandle from "./TargetHandle";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { useStore, StoreState } from "../store";
import { shallow } from "zustand/shallow";
import { useConnectionData, getSourceData } from "../utils";

const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
  useHandleConnections: store.useHandleConnections,
  useNodesData: store.useNodesData,
});

interface DestinationProps extends NodeProps {
  data: {
    component?: Tone.ToneAudioNode;
    label: string;
  };
}

const Destination = ({ id, data: { label }, selected }: DestinationProps) => {
  const store = useStore(selector, shallow);

  // 获取与 destination 句柄相连的组件信息
  const { connections, sourceHandleId, sourceNodeId } = useConnectionData(
    store,
    id,
    "destination"
  );

  // 若连接的组件为 Tone.ToneAudioNode，设为 inputComponent
  let inputComponent: Tone.ToneAudioNode | null = null;
  if (connections.length > 0) {
    const connectedComponent = getSourceData(
      store,
      sourceNodeId,
      sourceHandleId
    );
    if (connectedComponent instanceof Tone.ToneAudioNode) {
      inputComponent = connectedComponent;
    }
  }

  // 用于存储当前连接的音频组件实例
  const componentRef = useRef<{
    id: string;
    instance: Tone.ToneAudioNode;
  } | null>(null);

  // 用于存储上一个连接的音频组件
  const lastConnectedComponent = useRef<Tone.ToneAudioNode | null>(null);

  useEffect(() => {
    const startAudio = async () => {
      try {
        // 确保音频上下文启动
        if (Tone.getContext().state === "suspended") {
          await Tone.start();
          console.info("Audio context started.");
        }

        // 更新当前的音频组件引用
        componentRef.current = inputComponent
          ? { id: sourceNodeId, instance: inputComponent }
          : null;

        if (componentRef.current) {
          lastConnectedComponent.current = inputComponent;
          //componentRef.current.instance.disconnect(Tone.getDestination());
          componentRef.current.instance.connect(Tone.getDestination());
          console.info(`Connected new component with ID: ${sourceNodeId}`);

          if (
            "start" in componentRef.current.instance &&
            typeof componentRef.current.instance.start === "function"
          ) {
            componentRef.current.instance.start();
          }
          console.info(`Connected new component with ID: ${sourceNodeId}`);
        } else {
          lastConnectedComponent.current?.disconnect(Tone.getDestination());
          lastConnectedComponent.current = null;
          console.info(
            "Disconnected from previous component as no new connection was found."
          );
        }
      } catch (error) {
        console.error(
          "Error during audio context or component connection:",
          error
        );
      }
    };

    startAudio();
  }, [inputComponent, sourceNodeId]);

  useEffect(() => {
    return () => {
      // 在组件卸载时断开连接
      if (componentRef.current) {
        try {
          componentRef.current.instance.disconnect(Tone.getDestination());
          componentRef.current = null;
          console.info("Component disconnected during cleanup.");
        } catch (error) {
          console.error("Error during cleanup disconnection:", error);
        }
      }
    };
  }, []);

  return (
    <div className={`my-node ${selected ? "my-node-selected" : ""}`}>
      <TargetHandle type="target" position={Position.Left} id="destination" />
      <HiOutlineSpeakerWave className="my-icon" />
      <div className="my-label">{label}</div>
    </div>
  );
};

export default Destination;
