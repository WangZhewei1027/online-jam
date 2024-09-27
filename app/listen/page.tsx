"use client";
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function Page() {
  const [data, setData] = useState<string>("");

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
          console.log(payload);
          setData(JSON.stringify(payload));
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const json = {
    kick: [1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    snare: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  };

  async function handleClick() {
    const { data, error } = await supabase
      .from("notes")
      .update({ data: json })
      .eq("room", "7562cbd2-c9f1-4bde-8c8e-4e8792b58877")
      .select();

    if (error) {
      console.error("Error updating row:", error);
    } else {
      console.log("Row updated:", data);
    }
  }

  async function read() {
    let { data: notes, error } = await supabase
      .from("notes")
      .select("*")
      .eq("id", 4);

    console.log(notes);
  }

  return (
    <>
      <div>
        <button onClick={handleClick}>update</button>
      </div>
      <div>{data}</div>
    </>
  );
}
