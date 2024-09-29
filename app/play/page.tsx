"use client";

import { useEffect, useState } from "react";
import * as Tone from "tone";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import QRCode from "qrcode";
import { getRoomId, fetchSequencerData, updataSequencerData } from "./utils";

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
      className={`flex items-center justify-center ${enabled ? (clock == index ? "bg-green-300" : "bg-green-500") : "bg-green-500 opacity-20"} border border-gray-700 p-2 cursor-pointer w-12 h-14 hover:border-2 rounded-lg`}
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
  const [json, setData] = useState<{ [key: string]: number[] }>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [roomId, setRoomId] = useState("");
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
    async function init() {
      // Get the room ID from the URL
      const roomId = getRoomId();
      setRoomId(roomId);

      // Fetch the sequencer data from the database
      var data = await fetchSequencerData(roomId);
      console.log(data);

      // Set the sequencer data to the state
      setData(data[0].sequencer);

      // Set data loaded to true, so that the UI can be rendered
      setDataLoaded(true);

      // Subscribe to changes in the database
      const channel = supabase
        .channel("schema-db-changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notes",
            filter: `room=eq.${roomId}`,
          },
          (payload) => {
            setData(payload.new.sequencer);
          }
        )
        .subscribe();

      //Load all sounds
      const loadAllSounds = async () => {
        var players: { [key: string]: Tone.Player } = {};

        sounds.forEach((sound) => {
          players[sound] = new Tone.Player(
            `/drum/${sound}.wav`
          ).toDestination();
        });

        setPlayers(players);

        console.log("All sounds loaded");
      };

      await loadAllSounds();
    }

    init();
  }, []);

  function handleClick() {
    Tone.start();
    setPlaying(!playing);
    console.log("Playing: " + playing);
  }

  function handleToggle(instrument: string, index: number, change: boolean) {
    console.log(instrument, index, change);
    const newJson = { ...json };
    if (newJson[instrument]) {
      newJson[instrument][index] = change ? 1 : 0;
    }
    console.log(newJson);
    setData(newJson);
    updataSequencerData(roomId, newJson);
  }

  return (
    <>
      <div className="py-8" />
      {dataLoaded ? (
        <>
          <div className="p-4 justify-center items-center w-srceen">
            <div className="p-2 border rounded-xl flex max-w-[963px]">
              <div className="inline mr-2">
                <div className="flex flex-col h-full gap-2">
                  {Object.keys(players).map((key) => (
                    <div
                      className="flex justify-center items-center font-serif h-full"
                      key={key}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="inline-block overflow-x-scroll">
                <div className="grid grid-rows-4 grid-flow-col">
                  {[...Array(64)].map((_, index) => (
                    <div
                      key={index}
                      className={`${Math.floor(index / sounds.length) === clock ? "bg-gray-300" : ""} p-1`}
                    >
                      <Switch
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
            </div>
          </div>

          <div className="flex flex-col justify-center items-center mt-8">
            <div>
              <Button
                onClick={handleClick}
                className="w-16 h-16"
                variant="outline"
              >
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
        </>
      ) : (
        <div className="p-4">
          <div className="p-2 border rounded-xl flex justify-center items-center w-[963px] h-[274px]">
            <Spinner />
          </div>
        </div>
      )}
    </>
  );
}
