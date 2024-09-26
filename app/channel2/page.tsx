"use client";

import { get } from "http";
import { useEffect, useState } from "react";
import * as Tone from "tone";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

interface SwitchProps {
  enable: boolean;
  clock: number;
  index: number;
  instrument: number;
  players: { [key: string]: Tone.Player };
}

const Switch: React.FC<SwitchProps> = ({
  enable,
  clock,
  index,
  instrument,
  players,
}) => {
  const [enabled, setEnabled] = useState(enable);

  const toggleSwitch = () => {
    Tone.start(); // Ensures that Tone.js is initialized
    const newState = !enabled;
    setEnabled(newState);
  };

  // Play the preloaded sound buffer using Tone.Player
  const playSound = (player: Tone.Player) => {
    player.start();
  };

  const handlePlay = (index: number) => {
    const instrument =
      index === 0
        ? "kick"
        : index === 1
          ? "snare"
          : index === 2
            ? "hihat"
            : "crash";

    const player = players[instrument];
    if (player) {
      playSound(player); // Play the preloaded sound
    }
  };

  useEffect(() => {
    if (clock === index && enabled) {
      handlePlay(instrument);
    }
  }, [clock]);

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
  const [clock, setClock] = useState(0);
  const [players, setPlayers] = useState<{ [key: string]: Tone.Player }>({});
  const maxClock = 16;
  const [data, setData] = useState<Record<string, any>>({});

  // Preload the sounds once using Tone.js
  useEffect(() => {
    const loadAllSounds = async () => {
      // Create players for each sound
      const kick = new Tone.Player("/drum/kick.wav").toDestination();
      const snare = new Tone.Player("/drum/snare.wav").toDestination();
      const hihat = new Tone.Player("/drum/hihat.wav").toDestination();
      const crash = new Tone.Player("/drum/crash.wav").toDestination();

      // Cache all the players in a single object
      setPlayers({
        kick,
        snare,
        hihat,
        crash,
      });

      console.log("All sounds loaded");
    };

    loadAllSounds(); // Preload sounds on component mount
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setClock((prev) => (prev + 1) % maxClock);
    }, 200); // Sequence every 200ms (5 times per second)

    return () => {
      clearInterval(intervalId); // Cleanup interval on component unmount
    };
  }, []);

  useEffect(() => {
    //console.log("Current Clock: " + clock); // Logging whenever the clock changes
  }, [clock]);

  //initial read data from database, and upate data to the squencer
  useEffect(() => {
    async function read() {
      let { data: notes, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", 4);

      console.log(notes ? notes[0].data : {});
      setData(notes ? notes[0].data : {});
    }

    read();
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
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function handleData(instrument: number, index: number) {
    //console.log(instrument, index, enable);
    var ins =
      instrument === 0
        ? "kick"
        : instrument === 1
          ? "snare"
          : instrument === 2
            ? "hihat"
            : "crash";
    var bool = false;
    if (data[ins]) {
      if (data[ins][index] === 1) {
        bool = true;
      } else {
        bool = false;
      }
    } else {
      bool = false;
    }
    console.log(bool);
    return bool;
  }

  return (
    <div className="overflow-x-scroll">
      <div className="grid grid-rows-4 grid-flow-col">
        <div className="flex justify-center items-center px-4 font-serif">
          Kick
        </div>
        <div className="flex justify-center items-center px-4 font-serif">
          Snare
        </div>
        <div className="flex justify-center items-center px-4 font-serif">
          HiHat
        </div>
        <div className="flex justify-center items-center px-4 font-serif">
          Crash
        </div>
        {[...Array(64)].map((_, index) => (
          <div
            className={`${Math.floor(index / 4) === clock ? "bg-gray-400" : ""} p-1`}
          >
            <Switch
              key={index} // Add a key to avoid React warning
              clock={clock}
              index={Math.floor(index / 4)}
              enable={handleData(index % 4, Math.floor(index / 4))}
              instrument={index % 4}
              players={players} // Pass down preloaded Tone.Players
            />
          </div>
        ))}
      </div>
    </div>
  );
}
