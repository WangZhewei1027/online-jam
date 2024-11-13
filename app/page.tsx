"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/spinner";
import DataTable from "./components/DataTable";
import { createClient } from "@supabase/supabase-js";

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
  const [username, setUsername] = useState(""); // 即时更新的用户名
  const [debouncedUsername, setDebouncedUsername] = useState(""); // 延迟更新的用户名
  const [creatingRoom, setCreatingRoom] = useState(false);

  // Debounce effect for username
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsername(username); // 延迟更新用户名
    }, 600); // 300ms debounce

    return () => clearTimeout(handler); // 清除上一次定时器
  }, [username]);

  async function createRoom(roomName: string) {
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          name: roomName,
          sequencer: sequencerData,
          create_time: new Date(),
          last_time: new Date(),
          created_by: debouncedUsername,
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

    var tempRoomName = roomName;
    if (tempRoomName === "") {
      tempRoomName = "Untitled Room";
    }
    var roomId = await createRoom(tempRoomName);
    console.log("Room Created:", tempRoomName);

    setCreatingRoom(false);

    // Redirect to the room page
    window.location.href = "/hoster?room=" + roomId;
  }

  return (
    <>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center p-4">
        <div className="p-6 rounded-lg shadow-lg max-w-xs w-full border">
          <h1 className="text-2xl font-semibold mb-4">Create a Room</h1>
          <div className="mb-6">
            <label
              htmlFor="username"
              className="block text-sm font-medium mb-1 pl-1"
            >
              Log in as
            </label>
            <Input
              id="username"
              className="w-full"
              placeholder="User Name"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value); // 即时更新用户名
              }}
            />
          </div>
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
              onChange={(e) => {
                setRoomName(e.target.value);
              }}
            />
          </div>
          <Button onClick={handleCreateRoom} className="w-full">
            {creatingRoom ? <Spinner width={6} height={6} /> : "Create Room"}
          </Button>
        </div>

        <div className="mt-8 w-full rounded-lg shadow-lg border p-6 max-w-3xl">
          {/* 传递 debouncedUsername 而非即时更新的 username */}
          <DataTable username={debouncedUsername} />
        </div>
      </div>
    </>
  );
}
