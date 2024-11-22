"use client";

import React, { use, useEffect, useRef, useState } from "react";
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
import Spinner from "@/components/ui/spinner";

interface MidiGridData extends NodeProps {
  data: {
    id?: string;
    label: string;
    grid?: Array<boolean>;
  };
}

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

  useEffect(() => {
    async function init() {
      if (!data.id) {
        const roomId = await getRoomId();
        const componentId = await createInterative(roomId, {
          data: Array(numCols * numRows).fill(false),
        });
        updateNode(id, { id: componentId });
      }
      if (data.id) {
        const interactiveData = await fetchInteractive(data.id);
        if (interactiveData) {
          console.log("init data", interactiveData.data.data);
          setGridData(interactiveData.data.data);
        }
      }
      console.log("init");
      console.log(gridData);
      setLoaded(true);
    }

    init();
  }, []);

  // Handle grid click logic
  const handleGridClick = (index: number) => {
    setGridData((prevGridData) => {
      console.log(prevGridData);
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

  const triggerConnection = getHandleConnections(id, "source", "trigger");
  const triggerConnections =
    triggerConnection.length > 0 ? triggerConnection : [];
  const triggerSourceNodeData: Tone.ToneAudioNode[] = triggerConnections.map(
    (connection) => {
      return getNodeData(connection.target, "component") as Tone.ToneAudioNode;
    }
  );

  useEffect(() => {
    updateNode(id, { grid: gridData });

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
              midi: 220 * Math.pow(2, row / 12),
            });
            //console.log(triggerSourceNodeData);
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
        className={`style-node ${selected ? "style-node-selected" : ""} items-center`}
      >
        {loaded ? (
          <>
            {/* Grid */}
            <div className="nodrag grid grid-cols-8 gap-1">
              {Array.from({ length: numRows * numCols }).map((_, index) => {
                const col = index % numCols;
                return (
                  <div
                    key={index}
                    className={`border w-16 h-8 cursor-pointer ${
                      gridData[index]
                        ? "bg-blue-500"
                        : activeColumn === col
                          ? "bg-gray-300"
                          : "bg-white"
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
              id="midi"
            />
            <Handle
              type="source"
              position={Position.Right}
              style={{ top: "70%" }}
              id="trigger"
            />

            <div className="my-label">{data.label as string}</div>
          </>
        ) : (
          <Spinner width={6} height={6} />
        )}
      </div>
    </>
  );
};

export default MidiGrid;
