"use client";

import { useEffect, useState } from "react";
import * as Tone from "tone";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import QRCode from "qrcode";

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
      className={`flex items-center justify-center ${enabled ? "bg-green-500" : "bg-green-500 opacity-20"} border border-gray-700 p-2 cursor-pointer w-12 h-14 hover:border-2 rounded-lg`}
      onMouseDown={toggleSwitch}
    ></div>
  );
};

export default function PlayTone() {
  const maxClock = 16;
  const clockInterval = 200;
  const sounds = ["kick", "snare", "hihat", "crash"];

  const [clock, setClock] = useState(-1);
  const [players, setPlayers] = useState<{ [key: string]: Tone.Player }>({});
  const [playing, setPlaying] = useState(false);
  const [json, setData] = useState<{ [key: string]: number[] }>({
    kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    crash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });
  const [dataLoaded, setDataLoaded] = useState(false);
  const [room, setRoom] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // Holds the QR code URL

  const handleQR = async () => {
    const currentUrl = window.location.href; // Get the current webpage URL
    try {
      const qrCode = await QRCode.toDataURL(currentUrl); // Generate QR code as Data URL
      setQrCodeUrl(qrCode); // Set the generated QR code to the state
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

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
    const getUrl = async () => {
      const queryString = window.location.search;
      const params = new URLSearchParams(queryString);
      const room = params.get("room");

      if (room) {
        setRoom(room); // This triggers an asynchronous state update
        console.log(room);
      }
    };

    getUrl();
  }, []); // This runs only on component mount to get the room from the URL

  useEffect(() => {
    const fetchData = async () => {
      if (room) {
        // Ensure that fetchData only runs when room is available
        const { data, error } = await supabase
          .from("notes")
          .select("*")
          .eq("room", room);

        if (error) {
          console.log("error", error);
        } else if (data) {
          setDataLoaded(true);
          setData(data[0].data);
          console.log(data[0].data);
        }
      }
    };

    fetchData();
  }, [room]); // This runs whenever 'room' changes

  //listen to the database changes
  useEffect(() => {
    if (!room) {
      return;
    }
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notes",
          filter: `room=eq.${room}`,
        },
        (payload) => {
          // Convert the payload to a string and set it as data
          //console.log(payload.new.data);
          setData(payload.new.data);
          console.log("Data updated");
          console.log(payload.new.data);
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [room]);

  function handleClick() {
    Tone.start();
    setPlaying(!playing);
    console.log("Playing: " + playing);
  }

  async function updateData(newJson: { [key: string]: number[] }) {
    const { data, error } = await supabase
      .from("notes")
      .update({ data: newJson })
      .eq("room", room)
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
    <>
      {dataLoaded ? (
        <div className="p-2">
          <div className="flex flex-row items-center justify-center">
            <div className="flex flex-col h-full">
              {Object.keys(players).map((key) => (
                <div
                  className="flex justify-center items-center px-2 py-5 font-serif"
                  key={key}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
              ))}
            </div>

            <div className="grid grid-rows-4 grid-flow-col overflow-x-auto">
              {[...Array(64)].map((_, index) => (
                <div
                  className={`${Math.floor(index / sounds.length) === clock ? "bg-gray-300" : ""} p-1`}
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
                        : false
                    }
                    onToggle={handleToggle}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center items-center mt-8">
            <div>
              <Button onClick={handleClick} className="w-16 h-16">
                {playing ? <PauseIcon /> : <PlayArrowIcon />}
              </Button>
            </div>

            <div className="flex flex-col items-center mt-8">
              <button
                onClick={handleQR}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg mb-4"
              >
                Generate QR Code
              </button>

              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="mt-4" />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={"flex justify-center items-center mt-32"}>
          <Spinner />
        </div>
      )}
    </>
  );
}
