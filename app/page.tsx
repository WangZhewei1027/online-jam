"use client";

import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { createClient } from "@supabase/supabase-js";

import Spinner from "@/components/ui/spinner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

const sequencerData = {
  kick: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  crash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  hihat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export default function Index() {
  const [roomName, setRoomName] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);

  async function createRoom(roomName: string) {
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          name: roomName,
          sequencer: sequencerData,
          create_time: new Date(),
          last_time: new Date(),
        },
      ])
      .select();
    if (data) {
      console.log(data[0].room);
      return data[0].room;
    }
  }

  async function handleCreateRoom() {
    setCreatingRoom(true);

    var temp_roomName = roomName;
    if (temp_roomName == "") {
      temp_roomName = "Untitled Room";
    }
    var roomId = await createRoom(temp_roomName);
    console.log("Room Created:", temp_roomName);

    setCreatingRoom(false);

    // Redirect to the room page
    window.location.href = "/hoster?room=" + roomId;
  }

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4">
        <div className="p-6 rounded-lg shadow-lg max-w-sm w-full border">
          <h1 className="text-2xl font-semibold mb-4">Create a Room</h1>
          <div className="mb-6">
            <label
              htmlFor="roomName"
              className="block text-sm font-medium mb-1 pl-1"
            >
              Enter Room Name
            </label>
            <Input
              id="roomName"
              className="w-full"
              placeholder="Untitled Room"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateRoom} className="w-full">
            {creatingRoom ? <Spinner width={6} height={6} /> : "Create Room"}
          </Button>
        </div>
      </div>
    </>
  );
}
