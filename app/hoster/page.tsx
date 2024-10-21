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
  reconnectEdge,
  Connection,
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
import GainNode from "./nodes/GainNode";
import Envelope from "./nodes/Envelope";
import Text from "./nodes/Text";
import QRCode from "./nodes/QRCode";

import { MdOutlineCloudDone } from "react-icons/md";
import Spinner from "@/components/ui/spinner";
import { MdArrowForwardIos } from "react-icons/md";
import { MdOutlineUndo } from "react-icons/md";
import { MdOutlineRedo } from "react-icons/md";

const nodeTypes = {
  oscillator: Oscillator,
  rgbLight: RGBLight,
  numberInput: NumberInput,
  destination: Destination,
  analyser: Analyser,
  sequencer: Sequencer,
  midiinput: MIDIInput,
  value: Value,
  gainNode: GainNode,
  envelope: Envelope,
  text: Text,
  qrcode: QRCode,
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

  const undoStack = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const redoStack = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);

  const saveStateToUndoStack = (currentNodes: Node[], currentEdges: Edge[]) => {
    undoStack.current = [
      ...undoStack.current,
      { nodes: currentNodes, edges: currentEdges },
    ];
    redoStack.current = []; // Clear redo stack on new actions
  };

  const edgeReconnectSuccessful = useRef(true);

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
      // Detect platform (Mac or others)
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

      // Save with Command + S (Mac) or Ctrl + S (Windows)
      if (
        (isMac && event.metaKey && event.key.toLowerCase() === "s") ||
        (!isMac && event.ctrlKey && event.key.toLowerCase() === "s")
      ) {
        event.preventDefault(); // Prevent default browser save
        console.log("Command+S or Ctrl+S was pressed");
        update();
      }

      // Undo with Command + Z (Mac) or Ctrl + Z (Windows)
      if (
        (isMac &&
          event.metaKey &&
          event.key.toLowerCase() === "z" &&
          !event.shiftKey) ||
        (!isMac &&
          event.ctrlKey &&
          event.key.toLowerCase() === "z" &&
          !event.shiftKey)
      ) {
        event.preventDefault(); // Prevent default undo behavior
        console.log("Undo triggered");
        undo(); // Call your undo function here
      }

      // Redo with Command + Shift + Z (Mac) or Ctrl + Y (Windows)
      if (
        (isMac &&
          event.metaKey &&
          event.key.toLowerCase() === "z" &&
          event.shiftKey) ||
        (!isMac && event.ctrlKey && event.key.toLowerCase() === "y")
      ) {
        event.preventDefault(); // Prevent default redo behavior
        console.log("Redo triggered");
        redo(); // Call your redo function here
      }
    };

    // Listen to keydown events
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup function
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
      }, 3000);
    }, 30000);

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

  const addGainNode = () => {
    const newNode = {
      id: nanoid(),
      type: "gainNode",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "Gain Node" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addEnvelope = () => {
    const newNode = {
      id: nanoid(),
      type: "envelope",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "Envelope" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addText = () => {
    const newNode = {
      id: nanoid(),
      type: "text",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "Text" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const addQRCode = () => {
    const newNode = {
      id: nanoid(),
      type: "qrcode",
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      data: { label: "QR Code", qrCode: qrCodeUrl },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => {
      const updatedNodes = applyNodeChanges(changes, nodes);
      saveStateToUndoStack(nodes, edges);
      setNodes(updatedNodes);
    },
    [nodes, edges]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      const updatedEdges = applyEdgeChanges(changes, edges);
      saveStateToUndoStack(nodes, edges);
      setEdges(updatedEdges);
    },
    [edges]
  );

  // Undo action
  const undo = () => {
    if (undoStack.current.length > 0) {
      const previousState = undoStack.current.pop();
      if (previousState) {
        redoStack.current = [
          ...redoStack.current,
          { nodes: previousState.nodes, edges: previousState.edges },
        ];
        setNodes(previousState.nodes);
        setEdges(previousState.edges);
      }
    }
  };

  // Redo action
  const redo = () => {
    if (redoStack.current.length > 0) {
      const nextState = redoStack.current.pop();
      if (nextState) {
        undoStack.current = [
          ...undoStack.current,
          { nodes: nextState.nodes, edges: nextState.edges },
        ];
        setNodes(nextState.nodes);
        setEdges(nextState.edges);
      }
    }
  };

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);

  const onReconnect = useCallback((oldEdge: any, newConnection: Connection) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  }, []);

  const onReconnectEnd = useCallback((_: any, edge: { id: string }) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    }

    edgeReconnectSuccessful.current = true;
  }, []);

  const menuItems = [
    {
      label: "Inputs",
      actions: [
        { label: "New Number Input", onClick: addNumberInput },
        { label: "New MIDI Input", onClick: addMIDIInput },
      ],
    },
    {
      label: "Utils",
      actions: [
        { label: "New Value", onClick: addValue },
        { label: "New Text", onClick: addText },
        { label: "New QR Code", onClick: addQRCode },
      ],
    },
    {
      label: "Visuals",
      actions: [
        { label: "New RGBLight", onClick: addRGBLight },
        { label: "New Analyser", onClick: addAnalyser },
      ],
    },
    {
      label: "Audio",
      actions: [
        { label: "New Oscillator", onClick: addOscillator },
        { label: "New Gain Node", onClick: addGainNode },
        { label: "New Destination", onClick: addDestination },
        { label: "New Envelope", onClick: addEnvelope },
      ],
    },
    {
      label: "Magic",
      actions: [{ label: "New Sequencer", onClick: addSequencer }],
    },
  ];

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
          <div className="tool-bar absolute top-20 left-4 p-2 z-10">
            {menuItems.map((menu, index) => (
              <div
                key={index}
                className="group relative ease-in-out transition-all mt-2"
              >
                <Button className="w-full">{menu.label}</Button>
                <ul className="absolute left-full top-0 opacity-0 hidden group-hover:flex group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300 flex-row z-10">
                  <MdArrowForwardIos className="mt-3 mx-1" />
                  <div className="flex flex-col items-center space-y-2">
                    {menu.actions.map((action, i) => (
                      <Button
                        key={i}
                        variant={"outline"}
                        className="w-full inline"
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </ul>
              </div>
            ))}
          </div>

          {/* Undo Redo */}
          <div className="absolute top-20 right-4 p-2 z-10 space-x-2">
            <Button
              variant={"outline"}
              onClick={undo}
              className="w-10 h-10 p-2"
            >
              <MdOutlineUndo className="w-full h-full" />
            </Button>
            <Button
              variant={"outline"}
              onClick={redo}
              className="w-10 h-10 p-2"
            >
              <MdOutlineRedo className="w-full h-full" />
            </Button>
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
              onReconnect={onReconnect}
              onReconnectStart={onReconnectStart}
              onReconnectEnd={onReconnectEnd}
              panOnScroll={true}
              zoomOnScroll={false}
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
