"use client";

import { get } from "http";
import { use, useEffect, useState } from "react";
import * as Tone from "tone";
import { createClient } from "@supabase/supabase-js";
import { Key } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

interface SwitchProps {
  name: string;
  clock: number;
  index: number;
  player: Tone.Player;
  change: boolean;
  onToggle: (instrument: string, index: number, change: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({
  name,
  clock,
  index,
  player,
  change,
  onToggle,
}) => {
  const [enabled, setEnabled] = useState(false);

  const toggleSwitch = () => {
    Tone.start(); // Ensures that Tone.js is initialized
    const newState = !enabled;
    setEnabled(newState);
    onToggle(name, index, newState);
  };

  useEffect(() => {
    if (clock === index && enabled) {
      if (player.loaded) {
        if (player.state === "started") {
          player.stop();
        }
        player.start();
      }
    }
  }, [clock]);

  useEffect(() => {
    setEnabled(change);
  }, [change]);

  return (
    <div
      id="switch"
      className={`flex items-center justify-center ${
        enabled ? "bg-green-500" : "bg-gray-200"
      } border border-gray-300 p-2 cursor-pointer w-12 h-14 hover:border-4 rounded-lg`}
      onMouseDown={toggleSwitch}
    ></div>
  );
};

export default function PlayTone() {
  const maxClock = 16;
  const clockInterval = 200;
  const sounds = ["kick", "snare", "hihat", "crash"];

  const [clock, setClock] = useState(0);
  const [players, setPlayers] = useState<{ [key: string]: Tone.Player }>({});
  const [playing, setPlaying] = useState(false);
  const [json, setData] = useState<{ [key: string]: number[] }>({
    kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    crash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  // Preload the sounds once using Tone.js
  useEffect(() => {
    const loadAllSounds = async () => {
      var players: { [key: string]: Tone.Player } = {};

      sounds.forEach((sound) => {
        players[sound] = new Tone.Player(`/drum/${sound}.wav`).toDestination();
      });

      setPlayers(players);

      console.log("All sounds loaded");
    };

    loadAllSounds();
  }, []);

  // Clock signal
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!playing) {
        return;
      }
      setClock((prev) => (prev + 1) % maxClock);
      console.log("Clock: " + clock);
    }, clockInterval);

    return () => {
      clearInterval(intervalId); // Cleanup interval on component unmount
    };
  }, [playing]);

  //initialize the data
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", 4);
      if (error) {
        console.log("error", error);
      } else if (data) {
        setData(data[0].data);
        console.log(data[0].data);
      }
    };
    fetchData();
  }, []);

  //listen to the database changes
  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notes",
          filter: "id=eq.4",
        },
        (payload) => {
          // Convert the payload to a string and set it as data
          //console.log(payload.new.data);
          setData(payload.new.data);
          console.log(payload.new.data);
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function handleClick() {
    setPlaying(!playing);
    console.log("Playing: " + playing);
  }

  async function updateData(newJson: { [key: string]: number[] }) {
    const { data, error } = await supabase
      .from("notes")
      .update({ data: newJson })
      .eq("id", 4)
      .select();

    if (error) {
      console.error("Error updating row:", error);
    } else {
      console.log("Row updated:", data);
    }
  }

  function handleToggle(instrument: string, index: number, change: boolean) {
    console.log(instrument, index, change);
    const newJson = { ...json };
    if (newJson[instrument]) {
      newJson[instrument][index] = change ? 1 : 0;
    }
    console.log(newJson);
    setData(newJson);
    updateData(newJson);
  }

  return (
    <div className="overflow-x-scroll">
      <div className="grid grid-rows-4 grid-flow-col">
        {Object.keys(players).map((key) => (
          <div
            className="flex justify-center items-center px-4 font-serif"
            key={key}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </div>
        ))}
        {[...Array(64)].map((_, index) => (
          <div
            className={`${Math.floor(index / sounds.length) === clock ? "bg-gray-400" : ""} p-1`}
          >
            <Switch
              key={index} // Add a key to avoid React warning
              name={sounds[index % sounds.length]}
              clock={clock}
              index={Math.floor(index / sounds.length)}
              player={players[sounds[index % sounds.length]]} // Pass down preloaded Tone.Players
              change={
                json !== null && Object.keys(json).length > 0
                  ? json[sounds[index % sounds.length]][
                      Math.floor(index / sounds.length)
                    ] === 1
                    ? true
                    : false
                  : false
              }
              onToggle={handleToggle}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center items-center mt-8">
        <button onClick={handleClick}>{playing ? "Pause" : "Play"}</button>
      </div>
    </div>
  );
}
