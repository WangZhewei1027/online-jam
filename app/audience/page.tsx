"use client";

import * as Tone from "tone";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  generateQRCode,
  getRoomName,
  getRoomId,
  updateLastTime,
} from "@/app/utils";
import Metronome from "./metronome_auidence";
import Sequencer from "@/app/ui/sequencer";

export default function Page() {
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // Holds the QR code URL
  const [roomName, setRoomName] = useState("");
  const [url, setUrl] = useState("");
  const [roomId, setRoomId] = useState("");

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
    }

    init();
  }, []);

  return (
    <>
      <div className="flex justify-center mt-4">
        <div className="">
          <div className="inline-block font-serif font-bold text-center text-2xl md:text-3xl">
            {roomName}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                onClick={handleQRCodeClick}
                className="h-10 w-10 ml-4"
              >
                <QrCodeIcon />
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
      <Sequencer hoster={false} bpm={120} />
    </>
  );
}
