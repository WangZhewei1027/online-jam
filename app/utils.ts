import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";
import { NodeProps } from "@xyflow/react";

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

export async function getRoomName(roomId: string): Promise<any> {
  if (roomId) {
    const { data, error } = await supabase
      .from("notes")
      .select("name")
      .eq("room", roomId);

    if (error) {
      throw new Error("Error fetching data");
    } else if (data && data.length > 0) {
      return data[0].name;
    } else {
      throw new Error("Room name not found");
    }
  } else {
    throw new Error("Room ID is required");
  }
}

export async function updateLastTime(roomId: string) {
  const { data, error } = await supabase
    .from("notes")
    .update({ last_time: new Date() })
    .eq("room", roomId)
    .select();

  if (error) {
    console.error("Error updating row:", error);
  } else {
    //console.log("Row updated:", data);
  }
}

export async function generateQRCode(url: string): Promise<any> {
  const currentUrl = url; // Get the current webpage URL
  try {
    const qrCode = await QRCode.toDataURL(currentUrl); // Generate QR code as Data URL
    return qrCode;
  } catch (error) {
    console.error("Error generating QR code:", error);
  }
}

export async function updateClockStartTime(roomId: string) {
  const { data, error } = await supabase
    .from("notes")
    .update({ clock_start_time: new Date() })
    .eq("room", roomId)
    .select();

  if (error) {
    console.error("Error updating row:", error);
  } else {
    console.log("Row updated:", data);
  }
}

export async function updateNumBeatWhenStart(roomId: string, beat: number) {
  const { data, error } = await supabase
    .from("notes")
    .update({ num_beat_when_start: beat })
    .eq("room", roomId)
    .select();

  if (error) {
    console.error("Error updating row:", error);
  } else {
    console.log("Row updated:", data);
  }
}

export async function updateBpm(roomId: string, bpm: number) {
  const { data, error } = await supabase
    .from("notes")
    .update({ bpm: bpm })
    .eq("room", roomId)
    .select();

  if (error) {
    console.error("Error updating row:", error);
  } else {
    console.log("Row updated:", data);
  }
}

export async function updateMetronome(roomId: string, isPlaying: boolean) {
  const { data, error } = await supabase
    .from("notes")
    .update({ metronome: isPlaying, clock_start_time: new Date() })
    .eq("room", roomId)
    .select();

  if (error) {
    console.error("Error updating row:", error);
  } else {
    console.log("Row updated:", data);
  }
}

export async function fetchNodesAndEdges(roomId: string): Promise<any> {
  if (roomId) {
    const { data, error } = await supabase
      .from("notes")
      .select("nodes, edges")
      .eq("room", roomId);

    if (error) {
      throw new Error("Error fetching nodes and edges");
    } else if (data) {
      return data;
    }
  } else {
    throw new Error("roomId is required");
  }
}

export async function updateNodesAndEdges(
  roomId: string,
  newNodes: any[],
  newEdges: any[]
): Promise<any> {
  if (!roomId) {
    throw new Error("roomId is required");
  }

  // 创建新的数组，不直接修改 newNodes
  const sanitizedNodes = newNodes.map((node) => {
    const { component, ...rest } = node.data; // 去掉 component 字段
    return { ...node, data: rest }; // 返回一个新的 node 对象
  });

  // 更新数据库
  const { data, error } = await supabase
    .from("notes")
    .update({
      nodes: sanitizedNodes, // 使用去掉 component 的新节点数据
      edges: newEdges,
    })
    .eq("room", roomId); // 确保更新的是指定 roomId 的记录

  if (error) {
    throw new Error("Error updating nodes and edges");
  }

  return data; // 返回更新后的数据
}

export async function getUserProjects(userId: string) {
  const { data: notes, error } = await supabase
    .from("notes")
    .select("name, create_time, last_time, room") // 添加 `room` 列
    .eq("created_by", userId); // 筛选 `created_by` 等于用户 ID 的行

  if (error) {
    console.error("Error fetching user projects:", error);
    return [];
  }

  return notes;
}
