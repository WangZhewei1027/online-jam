"use client";

import { useEffect, useState } from "react";
import * as Tone from "tone";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";
import { MdPlayArrow, MdPause } from "react-icons/md";
import {
  getRoomId,
  fetchSequencerData,
  updataSequencerData,
  updateLastTime,
} from "../utils";
import { Slider } from "@/components/ui/slider";

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
  volumn: number;
}

const Switch: React.FC<SwitchProps> = ({
  name,
  clock,
  index,
  player,
  change,
  onToggle,
  volumn,
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
        player.volume.value = volumn;
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
        enabled
          ? clock === index
            ? "bg-green-300"
            : "bg-green-500"
          : "bg-green-500 opacity-20"
      } border border-gray-700 p-2 cursor-pointer w-8 h-10 hover:border-2 rounded-sm`}
      onMouseDown={toggleSwitch}
    ></div>
  );
};

export default function Sequencer({
  hoster,
  bpm,
}: {
  hoster: boolean;
  bpm: number;
}) {
  const maxClock = 16;
  const sounds = ["kick", "snare", "hihat", "crash"];

  const [clock, setClock] = useState(-1);
  const [players, setPlayers] = useState<{ [key: string]: Tone.Player }>({});
  const [playing, setPlaying] = useState(false);
  const [json, setData] = useState<{ [key: string]: number[] }>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [volumn, setVolumn] = useState(-2);

  useEffect(() => {
    async function init() {
      // Get the room ID from the URL
      const roomId = getRoomId();
      setRoomId(roomId);

      updateLastTime(roomId);

      // Fetch the sequencer data from the database
      const data = await fetchSequencerData(roomId);
      setData(data[0].sequencer);
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

      // Load all sounds
      const loadAllSounds = async () => {
        const loadedPlayers: { [key: string]: Tone.Player } = {};
        sounds.forEach((sound) => {
          loadedPlayers[sound] = new Tone.Player(
            `/drum212/${sound}.mp3`
          ).toDestination();
          loadedPlayers[sound].volume.value = volumn;
        });
        setPlayers(loadedPlayers);
      };

      await loadAllSounds();

      // Initialize Tone.Transport
      Tone.getTransport().bpm.value = bpm;
      Tone.getTransport().scheduleRepeat((time) => {
        setClock((prev) => (prev + 1) % maxClock);
      }, "8n");
    }

    init();
  }, []);

  useEffect(() => {
    if (players) {
      Object.keys(players).forEach((key) => {
        players[key].volume.value = volumn;
      });
    }
  }, [volumn, players]);

  function handleClick() {
    Tone.start();
    if (playing) {
      Tone.getTransport().stop();
    } else {
      Tone.getTransport().start();
    }
    setPlaying(!playing);
  }

  function handleToggle(instrument: string, index: number, change: boolean) {
    const newJson = { ...json };
    if (newJson[instrument]) {
      newJson[instrument][index] = change ? 1 : 0;
    }
    setData(newJson);
    updataSequencerData(roomId, newJson);
  }

  return (
    <>
      {dataLoaded ? (
        <>
          <div className="flex justify-center">
            <div className="nodrag p-4 rounded-sm flex max-w-[963px] overflow-hidden">
              <div className="inline mr-2">
                <div className="flex flex-col h-full gap-2">
                  {Object.keys(players).map((key) => (
                    <div
                      className="flex justify-center items-center font-serif h-full text-sm"
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
                      className={`${
                        Math.floor(index / sounds.length) === clock
                          ? "bg-gray-300"
                          : ""
                      } p-[2px]`}
                    >
                      <Switch
                        name={sounds[index % sounds.length]}
                        clock={clock}
                        index={Math.floor(index / sounds.length)}
                        player={players[sounds[index % sounds.length]]}
                        change={
                          json !== null && Object.keys(json).length > 0
                            ? json[sounds[index % sounds.length]][
                                Math.floor(index / sounds.length)
                              ] === 1
                            : false
                        }
                        onToggle={handleToggle}
                        volumn={volumn}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {hoster && (
            <div className="flex flex-col justify-center items-center">
              {/* <div>
                <Button
                  onClick={handleClick}
                  className="nodrag mb-2"
                  variant="outline"
                >
                  {playing ? (
                    <MdPause className="h-8 w-8" />
                  ) : (
                    <MdPlayArrow className="w-8 h-8" />
                  )}
                </Button>
              </div> */}
              <div className="w-full max-w-64 h-4">
                <Slider
                  min={-32}
                  max={0}
                  step={0.1}
                  defaultValue={[0]}
                  onValueChange={(num) => {
                    num[0] === -32 ? setVolumn(-Infinity) : setVolumn(num[0]);
                  }}
                  className="nodrag"
                ></Slider>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-2 md:p-4 flex justify-center">
          <div className="p-2 border rounded-sm flex w-[963px] h-[274px] justify-center items-center">
            <Spinner />
          </div>
        </div>
      )}
    </>
  );
}
