"use client";
import { useEffect, useRef, useState } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useNodesData,
  useEdges,
} from "@xyflow/react";
import "../styles.css";
import * as Tone from "tone";
import { getHandleConnections, getNodeData, updateNode } from "../utils/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Waveform from "../components/Waveform";

function Oscillator({
  id,
  data: { label, type = "sine" },
  selected,
}: NodeProps & { data: { label: string; type: string } }) {
  //-------- 默认rerender hook --------
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  //---------- 获取frequency输入端口的连接信息 ----------
  const frequency = useRef<number>(0);

  const frequencyConnection = getHandleConnections(id, "target", "frequency");
  const frequencySourceNodeData: number | null =
    frequencyConnection.length > 0 && frequencyConnection[0].sourceHandle
      ? getNodeData(
          frequencyConnection[0].source,
          frequencyConnection[0].sourceHandle
        )
      : null;
  const fre: number =
    typeof frequencySourceNodeData === "number" && frequencySourceNodeData >= 0
      ? Number(frequencySourceNodeData.toFixed(2))
      : 0;

  useEffect(() => {
    frequency.current = fre;
    if (oscRef.current) {
      oscRef.current.frequency.value = fre;
    }
  }, [fre]);

  //---------- 初始化Tone.Oscillator实例 ----------
  const oscRef = useRef<Tone.Oscillator | null>(null);

  useEffect(() => {
    if (!oscRef.current) {
      oscRef.current = new Tone.Oscillator(0, type as Tone.ToneOscillatorType);
      oscRef.current.start();
      updateNode(id, { component: oscRef.current });
    }

    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.dispose();
        oscRef.current = null;
      }
    };
  }, []);

  //---------- 操作wave type ----------
  const [waveType, setWaveType] = useState<Tone.ToneOscillatorType>(
    type as Tone.ToneOscillatorType
  );

  useEffect(() => {
    if (
      oscRef.current &&
      ["sine", "square", "triangle", "sawtooth"].includes(waveType)
    ) {
      oscRef.current.type = waveType;
      updateNode(id, { type: waveType });
      console.log("Wave type set to", waveType);
    }
  }, [waveType]);

  return (
    <div className={`style-node ${selected ? "style-node-selected" : ""} w-56`}>
      {/* 视觉化WaveType */}
      <div className="w-full h-36">
        <Waveform
          frequency={frequency.current}
          waveform={waveType as "sine" | "sawtooth" | "square" | "triangle"}
        />
      </div>

      {/* Frequency input handle */}
      <Handle
        id="frequency"
        type="target"
        position={Position.Left}
        style={{ top: "40%", width: "10px", height: "10px" }}
      />

      {/* WaveType Selection */}
      <div className="flex place-content-between mt-4">
        <div className="text-sm">Wave Type</div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-sm underline italic">
              {waveType.charAt(0).toUpperCase() + waveType.slice(1)}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Wave Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["sine", "square", "triangle", "sawtooth"].map((type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setWaveType(type as Tone.ToneOscillatorType)}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Oscillator output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="component"
        style={{ top: "40%", width: "10px", height: "10px" }}
      />

      {/* Display label */}
      <div className="absolute left-0 -top-6 text-base">{label}</div>
    </div>
  );
}

export default Oscillator;
