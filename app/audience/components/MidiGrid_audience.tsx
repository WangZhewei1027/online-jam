"use client";

import React, { use, useEffect, useRef, useState } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useEdges,
  useNodesData,
} from "@xyflow/react";

import * as Tone from "tone";
import {
  createInterative,
  getRoomId,
  fetchInteractive,
  updateInteractive,
} from "@/app/utils";
import Spinner from "@/components/ui/spinner";

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
        //updateNode(id, { id: componentId });
      }
      if (data.id) {
        const interactiveData = await fetchInteractive(data.id);
        if (interactiveData) {
          //console.log("init data", interactiveData.data.data);
          setGridData(interactiveData.data.data);
        }
      }
      console.log("init");
      console.log(gridData);

      const channelName = `${id}-${Math.random().toString(36).substr(2, 9)}`;
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "interactive",
            filter: `id=eq.${data.id}`,
          },
          (payload) => {
            console.log("payload", payload.new.data.data);
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

  useEffect(() => {
    //updateNode(id, { grid: gridData });

    console.log(Tone.getTransport().bpm.value);
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
          }
        }
        if (isColumnEmpty) {
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
      <div className="block overflow-auto px-4 py-6 rounded shadow-md backdrop-blur-[2px] border">
        {loaded ? (
          <>
            {/* Grid 容器 */}
            <div className="nodrag w-full">
              <div className="w-max grid grid-cols-8 gap-1">
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
            </div>
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
