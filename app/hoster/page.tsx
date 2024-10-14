"use client";

import * as Tone from "tone";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import QrCodeIcon from "@mui/icons-material/QrCode";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback, useRef, use } from "react";
import {
  generateQRCode,
  getRoomName,
  getRoomId,
  updateLastTime,
  fetchNodesAndEdges,
  updateNodesAndEdges,
} from "../utils";
import Metronome from "./metronome";
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nanoid } from "nanoid";

import Oscillator from "./nodes/Oscillator";
import RGBLight from "./nodes/RGBLight";
import NumberInput from "./nodes/NumberInput";
import Destination from "./nodes/Destination";
import Analyser from "./nodes/Analyser";
import Sequencer from "./nodes/Sequencer";
import MIDIInput from "./nodes/MIDIInput";
import Value from "./nodes/Value";

import { MdOutlineCloudDone } from "react-icons/md";
import Spinner from "@/components/ui/spinner";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import { HiOutlineSpeakerXMark } from "react-icons/hi2";

const nodeTypes = {
  oscillator: Oscillator,
  rgbLight: RGBLight,
  numberInput: NumberInput,
  destination: Destination,
  analyser: Analyser,
  sequencer: Sequencer,
  midiinput: MIDIInput,
  value: Value,
};

const initialNodes: Node[] = []; // 这里指定 Node 类型
const initialEdges: Edge[] = []; // 这里指定 Edge 类型

export default function Page() {
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // Holds the QR code URL
  const [roomName, setRoomName] = useState("");
  const [url, setUrl] = useState("");
  const [roomId, setRoomId] = useState("");
  const [bpm, setBpm] = useState(120);

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const [init, setInit] = useState(false);
  const [save, setSave] = useState(false);

  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  async function handleQRCodeClick() {
    var tempUrl = window.location.href.replace("hoster", "audience");
    setQrCodeUrl(await generateQRCode(tempUrl));
    setUrl(tempUrl);
  }

  useEffect(() => {
    async function init() {
      // Get the room ID from the URL
      const roomId = getRoomId();
      setRoomId(roomId);

      //Get room name
      var name = await getRoomName(roomId);
      setRoomName(name);

      await updateLastTime(roomId);
      const data = await fetchNodesAndEdges(roomId);
      // console.log("Nodes and Edges:  ", data);
      // console.log("Nodes:  ", data[0].nodes);
      setNodes(data[0].nodes ? data[0].nodes : []);
      setEdges(data[0].edges ? data[0].edges : []);

      setInit(true);
    }

    init();
  }, []);

  useEffect(() => {
    var timeout: NodeJS.Timeout;

    function display() {
      setSave(true);
      timeout = setTimeout(() => {
        setSave(false);
      }, 2000);
    }

    async function update() {
      console.log("Nodes and Edges updated");
      console.log("Nodes:  ", nodes);
      await updateNodesAndEdges(roomId, nodes, edges);

      display();
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      // Mac: Command + S
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      if (
        (isMac && event.metaKey && event.key === "s") ||
        (!isMac && event.ctrlKey && event.key === "s")
      ) {
        event.preventDefault(); // 阻止默认的保存行为
        console.log("Command+S or Ctrl+S was pressed");
        // 在这里执行你希望的逻辑
        update();
      }
    };

    // 监听键盘事件
    window.addEventListener("keydown", handleKeyDown);

    // 清理函数
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timeout);
    };
  }, [roomId, nodes, edges]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateNodesAndEdges(roomId, nodesRef.current, edgesRef.current);
      setSave(true);
      setTimeout(() => {
        setSave(false);
      }, 30000);
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId]);

  useEffect(() => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [nodes, edges]);

  // 添加新的节点函数
  const addOscillator = () => {
    const newNode = {
      id: nanoid(),
      type: "oscillator",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "Oscillator" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addRGBLight = () => {
    const newNode = {
      id: nanoid(),
      type: "rgbLight",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "RGB Light" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addNumberInput = () => {
    const newNode = {
      id: nanoid(),
      type: "numberInput",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "Number Input", value: 0 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addDestination = () => {
    const newNode = {
      id: nanoid(),
      type: "destination",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "Destination" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addAnalyser = () => {
    const newNode = {
      id: nanoid(),
      type: "analyser",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "Analyser" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addSequencer = () => {
    const newNode = {
      id: nanoid(),
      type: "sequencer",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "Sequencer" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addMIDIInput = () => {
    const newNode = {
      id: nanoid(),
      type: "midiinput",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "MIDI Input" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addValue = () => {
    const newNode = {
      id: nanoid(),
      type: "value",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "Value" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback((changes: EdgeChange<Edge>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <>
      <div className="flex justify-center mt-4">
        {/* Title and QR Code */}
        <div className="absolute top-3 z-20">
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

      {/* <Button
        variant="outline"
        className="absolute right-2 top-[74px] z-50 p-2"
      >
        <HiOutlineSpeakerXMark className="w-full h-full" />
      </Button> */}

      <div
        className={`absolute z-20 right-2 bottom-2 italic transition-opacity ease-in-out duration-300 ${save ? "opacity-100" : "opacity-0"}`}
      >
        <MdOutlineCloudDone className="inline-block mr-2" />
        {`Saved ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
      </div>

      {init ? (
        <>
          {/* Tool Bar */}
          <div className="tool-bar absolute top-20 left-4 p-2 border z-10">
            <div className="flex space-x-4 m-2">
              <Button onClick={addOscillator}>New Oscillator</Button>
            </div>
            <div className="flex space-x-4 m-2">
              <Button onClick={addRGBLight}>New RGBLight</Button>
            </div>
            <div className="flex space-x-4 m-2">
              <Button onClick={addNumberInput}>New Number Input</Button>
            </div>
            <div className="flex space-x-4 m-2">
              <Button onClick={addDestination}>New Destination</Button>
            </div>
            <div className="flex space-x-4 m-2">
              <Button onClick={addAnalyser}>New Analyser</Button>
            </div>
            <div className="flex space-x-4 m-2">
              <Button onClick={addSequencer}>New Sequencer</Button>
            </div>
            <div className="flex space-x-4 m-2">
              <Button onClick={addMIDIInput}>New MIDI Input</Button>
            </div>
            <div className="flex space-x-4 m-2">
              <Button onClick={addValue}>New Value</Button>
            </div>
          </div>

          {/* Canvas */}
          <div
            style={{
              height: "100vh",
              width: "100%",
              position: "absolute",
              left: 0,
              top: 0,
            }}
          >
            <ReactFlow
              nodes={nodes}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              proOptions={{ hideAttribution: true }}
              fitView
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </>
      ) : (
        <div className="p-2 md:p-4 flex justify-center">
          <div className="p-2 rounded-xl flex w-[963px] h-[274px] justify-center items-center">
            <Spinner width={6} height={6} />
          </div>
        </div>
      )}
    </>
  );
}
