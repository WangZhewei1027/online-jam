"use client";

import React, { useState } from "react";
import { NOTES, MidiGrid } from "../utils/constants";

interface MidiGridProps {
  grid: MidiGrid;
  onUpdate: (rowIndex: number, colIndex: number, note?: string) => void;
}

const MidiGrid: React.FC<MidiGridProps> = ({ grid, onUpdate }) => {
  return (
    <div className="grid gap-1 p-4 bg-gray-200 border border-gray-400 rounded-md">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="grid grid-cols-16 gap-1">
          {row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-6 h-6 border ${
                cell.active ? "bg-blue-500" : "bg-gray-300"
              }`}
              onClick={() =>
                onUpdate(
                  rowIndex,
                  colIndex,
                  cell.active ? undefined : NOTES[rowIndex % NOTES.length]
                )
              }
              title={`Note: ${cell.note}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MidiGrid;
