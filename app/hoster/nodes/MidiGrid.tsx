"use client";

import React, { use, useEffect, useRef, useState, useMemo } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useEdges,
  useNodesData,
} from "@xyflow/react";
import { getHandleConnections, getNodeData, updateNode } from "../utils/store";
import * as Tone from "tone";
import {
  createInterative,
  getRoomId,
  fetchInteractive,
  updateInteractive,
} from "@/app/utils";

import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

interface MidiGridData extends NodeProps {
  data: {
    id?: string;
    label: string;
    grid?: Array<boolean>;
  };
}

const whiteKeys: Record<string, number> = {
  a: 60, // C4
  s: 62, // D4
  d: 64, // E4
  f: 65, // F4
  g: 67, // G4
  h: 69, // A4
  j: 71, // B4
  k: 72, // C5
};

const midiToFrequency = (midiNote: number): number =>
  440 * Math.pow(2, (midiNote - 69) / 12);

const MidiGrid = ({ id, data, selected }: MidiGridData) => {
  const edges = useEdges();
  const nodesData = useNodesData(edges.map((edge) => edge.source));

  const numCols = 8; // Number of columns (beats per bar)
  const numRows = 7; // Number of rows (MIDI notes)
  const [gridData, setGridData] = useState<boolean[]>(
    Array(numCols * numRows).fill(false)
  );
  const [activeColumn, setActiveColumn] = useState<number>(-1); // Active column
  const tonePartRef = useRef<Tone.Part | null>(null);
  const [loaded, setLoaded] = useState(false);

  const signalRef = useRef<Tone.Signal | null>(null);

  useEffect(() => {
    if (!signalRef.current) {
      signalRef.current = new Tone.Signal(0);
      updateNode(id, { component: signalRef.current });
    }
  }, []);

  useEffect(() => {
    async function init() {
      var componentId = "";
      if (!data.id) {
        const roomId = await getRoomId();
        componentId = await createInterative(roomId, {
          data: Array(numCols * numRows).fill(false),
        });
        updateNode(id, { id: componentId });
        //console.log("componentId", componentId);
      }
      if (data.id) {
        componentId = data.id;
      }
      if (componentId) {
        const interactiveData = await fetchInteractive(componentId);
        //console.log("init data", interactiveData);

        if (interactiveData) {
          //console.log("init data", interactiveData.data.data);
          setGridData(interactiveData.data.data);
        }
      }

      const channel = supabase
        .channel(id)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "interactive",
            filter: `id=eq.${componentId}`,
          },
          (payload) => {
            //console.log("payload", payload.new.data.data);
            setGridData(payload.new.data.data);
          }
        )
        .subscribe();

      setLoaded(true);
    }

    init();
  }, []);

  // Handle grid click logic
  const handleGridClick = (index: number) => {
    setGridData((prevGridData) => {
      //console.log(prevGridData);
      const newGridData = [...prevGridData];
      const col = index % numCols;

      if (newGridData[index]) {
        // Turn off the clicked cell
        newGridData[index] = false;
      } else {
        // Turn off all cells in the same column
        for (let i = col; i < newGridData.length; i += numCols) {
          newGridData[i] = false;
        }
        // Turn on the clicked cell
        newGridData[index] = true;
      }

      updateInteractive(data.id as string, { data: newGridData });
      return newGridData;
    });
  };

  useEffect(() => {
    updateNode(id, { grid: gridData });

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

    // Create a Tone.Part
    tonePartRef.current = new Tone.Part(
      (time, col) => {
        setActiveColumn(col); // Highlight the current column

        // Trigger notes based on gridData
        let isColumnEmpty = true;
        for (let row = 0; row < numRows; row++) {
          const index = row * numCols + col;
          if (gridData[index]) {
            isColumnEmpty = false;
            // Play a simple sine wave for the active note
            updateNode(id, {
              midi: midiToFrequency(whiteKeys[Object.keys(whiteKeys)[6 - row]]),
            });
            signalRef.current?.setValueAtTime(
              midiToFrequency(whiteKeys[Object.keys(whiteKeys)[6 - row]]),
              Tone.now()
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
            break;
          }
        }
        if (isColumnEmpty) {
          updateNode(id, {
            midi: 0.01,
          });
          signalRef.current?.setValueAtTime(0.01, Tone.now());
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
        }
      },
      Array.from({ length: numCols }, (_, i) => [i * 0.25, i])
    );
    tonePartRef.current.loop = true;
    tonePartRef.current.loopEnd = "1m";
    tonePartRef.current.start(0);

    return () => {
      if (tonePartRef.current) tonePartRef.current.dispose();
    };
  }, [gridData]);

  return (
    <>
      <div
        className={`style-node ${selected ? "style-node-selected" : ""} items-center border-glow`}
      >
        <div className="inner">
          <div className="body">
            {/* Grid */}
            <div className="nodrag grid grid-cols-8 gap-1">
              {Array.from({ length: numRows * numCols }).map((_, index) => {
                const col = index % numCols;
                return (
                  <div
                    key={index}
                    className={`border border-gray-400 w-16 h-8 cursor-pointer hover:border-2 hover:border-gray-600 rounded-sm transition-all ${
                      gridData[index]
                        ? activeColumn === col
                          ? "bg-blue-400 opacity-95"
                          : "bg-blue-500 opacity-95"
                        : activeColumn === col
                          ? "bg-blue-500 opacity-25"
                          : "bg-blue-300 opacity-10"
                    }`}
                    onClick={() => handleGridClick(index)}
                  ></div>
                );
              })}
            </div>

            <Handle
              type="source"
              position={Position.Right}
              style={{ top: "30%" }}
              id="component"
            />
            <Handle
              type="source"
              position={Position.Right}
              style={{ top: "70%" }}
              id="trigger"
            />

            <div className="my-label">{data.label as string}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MidiGrid;
