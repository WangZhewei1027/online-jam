import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export function getRoomId(): string {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  const roomId = params.get("room");

  if (roomId) {
    return roomId;
  } else {
    throw new Error("Room ID not found in URL");
  }
}

export async function fetchSequencerData(roomId: string): Promise<any> {
  if (roomId) {
    const { data, error } = await supabase
      .from("notes")
      .select("sequencer")
      .eq("room", roomId);

    if (error) {
      throw new Error("Error fetching data");
    } else if (data) {
      return data;
    }
  }
}

export async function updataSequencerData(
  roomId: string,
  newJson: { [key: string]: number[] }
) {
  const { data, error } = await supabase
    .from("notes")
    .update({ sequencer: newJson })
    .eq("room", roomId)
    .select();

  if (error) {
    console.error("Error updating row:", error);
  } else {
    console.log("Row updated:", data);
  }
}
