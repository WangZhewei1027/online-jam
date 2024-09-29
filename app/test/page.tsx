"use client";

import React, { useState, useEffect } from "react";
import { getRoomId } from "../play/utils";
import { fetchSequencerData } from "../play/utils";
const Page = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const roomId = getRoomId();

      var data = await fetchSequencerData(roomId);
      setData(data);
      setLoading(false);
    }

    init();
  }, []);

  return (
    <div className="border-red-500 border">
      <div className="inline-block  border-blue-500 border m-4 p-4 overflow-x-scroll">
        <div className="inline-block w-10 h-full">
          {Object.keys([1, 2, 3, 4]).map((key) => (
            <div
              className="flex justify-center items-center px-2 py-5 font-serif"
              key={key}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </div>
          ))}
        </div>

        <div className="flex flex-col flex-shrink-[2]">
          <div className="grid grid-rows-4 grid-flow-col">
            {[...Array(64)].map((_, index) => (
              <div key={index} className="w-10 h-20 bg-slate-600 m-1">
                a
              </div>
            ))}
          </div>
        </div>
        <div className="bg-red-600 w-10 h-40"></div>
      </div>
    </div>
  );
};

export default Page;
