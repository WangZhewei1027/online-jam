"use client";

import * as Tone from "tone";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MdQrCode } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { useState, useEffect, use, useRef } from "react";
import {
  generateQRCode,
  getRoomName,
  getRoomId,
  updateLastTime,
  getAllInteractive,
} from "@/app/utils";
import Metronome from "./metronome_auidence";
import Sequencer from "@/app/ui/sequencer";
import MidiGrid from "./components/MidiGrid_audience";

export default function Page() {
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // Holds the QR code URL
  const [roomName, setRoomName] = useState("");
  const [url, setUrl] = useState("");
  const [roomId, setRoomId] = useState("");

  const [allInteractive, setAllInteractive] = useState<
    { id: any; data: any; type: any }[] | undefined
  >(undefined);

  async function handleQRCodeClick() {
    setQrCodeUrl(await generateQRCode(window.location.href));
    setUrl(window.location.href);
  }

  useEffect(() => {
    async function init() {
      // Get the room ID from the URL
      const roomId = getRoomId();
      setRoomId(roomId);

      //Get room name
      var name = await getRoomName(roomId);
      setRoomName(name);

      const temp = await getAllInteractive(roomId);
      setAllInteractive(temp);
      console.log("allInteractives: ", temp);
    }

    init();
  }, []);

  return (
    <>
      <div className="flex justify-center mt-4">
        <div className="fixed top-2 z-10">
          <div className="inline-block font-serif font-bold text-center text-2xl md:text-3xl">
            {roomName}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                onClick={handleQRCodeClick}
                className="ml-4"
              >
                <MdQrCode className="w-8 h-8" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px]">
              {qrCodeUrl && (
                <img src={qrCodeUrl} alt="QR Code" className="mt-1" />
              )}
              <div className="flex">
                <a href={url} className="inline-block underline text-sm">
                  {url}
                </a>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {allInteractive &&
        allInteractive.map(
          (param: { id: string; data: Array<any>; type: string }) => (
            <div className="w-full max-w-[100vw] space-y-2 p-2">
              <div key={param.id} className="flex">
                <MidiGrid
                  data={{
                    id: param.id,
                    label: param.type,
                    grid: param.data,
                  }}
                  id={""}
                  type={""}
                  dragging={false}
                  zIndex={0}
                  isConnectable={false}
                  positionAbsoluteX={0}
                  positionAbsoluteY={0}
                />
              </div>
            </div>
          )
        )}
      <Sequencer hoster={false} bpm={120} />
    </>
  );
}
