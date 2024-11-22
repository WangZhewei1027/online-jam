"use client";

import * as Tone from "tone";
import dynamic from "next/dynamic";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MdQrCode } from "react-icons/md";
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
import { ReactFlow, Controls, Background, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { MdOutlineCloudDone } from "react-icons/md";
import Spinner from "@/components/ui/spinner";
import { MdArrowForwardIos } from "react-icons/md";
import { MdOutlineUndo } from "react-icons/md";
import { MdOutlineRedo } from "react-icons/md";

import { shallow } from "zustand/shallow";
import { useStore, StoreState } from "./utils/store";
import { useKeyboardShortcuts } from "./utils/useKeyboardShortcuts";
import { useNodes } from "./hooks/useNodes";
import { handleNodeSelection } from "./utils/store";

const selector = (store: StoreState) => ({
  nodes: store.nodes,
  edges: store.edges,
  nodeTypes: store.nodeTypes,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
  addNode: store.addNode,
  updateNode: store.updateNode,
  undo: store.undo,
  redo: store.redo,
  setNodes: store.setNodes,
  setEdges: store.setEdges,
  onReconnect: store.onReconnect,
  onReconnectStart: store.onReconnectStart,
  onReconnectEnd: store.onReconnectEnd,
});
import TransportControl from "./components/TransportControl";

function Page() {
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // Holds the QR code URL
  const [roomName, setRoomName] = useState("");
  const [url, setUrl] = useState("");
  const [roomId, setRoomId] = useState("");

  const [init, setInit] = useState(false);
  const [save, setSave] = useState(false);

  const store = useStore(selector, shallow);

  const {
    addOscillator,
    addRGBLight,
    addNumberInput,
    addDestination,
    addAnalyser,
    addSequencer,
    addMIDIInput,
    addValue,
    addGainNode,
    addEnvelope,
    addText,
    addXYPad,
    addMultiply,
    addMidiGrid,
  } = useNodes();

  async function handleQRCodeClick() {
    var tempUrl = window.location.href.replace("hoster", "audience");
    setQrCodeUrl(await generateQRCode(tempUrl));
    setUrl(tempUrl);
  }

  useEffect(() => {
    async function init() {
      const roomId = getRoomId();
      setRoomId(roomId);

      const name = await getRoomName(roomId);
      setRoomName(name);

      await updateLastTime(roomId);
      const data = await fetchNodesAndEdges(roomId);

      store.setNodes(data[0].nodes ? data[0].nodes : []);
      store.setEdges(data[0].edges ? data[0].edges : []);

      setInit(true);
    }

    init();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  async function update() {
    await updateNodesAndEdges(roomId, store.nodes, store.edges);

    setSave(true);

    timeoutRef.current = setTimeout(() => {
      setSave(false);
    }, 2000);
  }

  useKeyboardShortcuts(store, () => {
    update();
  });

  // useEffect(() => {
  //   if (!roomId) return;

  //   const interval = setInterval(() => {
  //     updateNodesAndEdges(roomId, store.nodes, store.edges);
  //     setSave(true);
  //     setTimeout(() => {
  //       setSave(false);
  //     }, 3000);
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, [roomId]);

  const menuItems = [
    {
      label: "Oscillators",
      actions: [
        { label: "New Oscillator", onClick: addOscillator },
        { label: "New Sequencer", onClick: addSequencer },
        { label: "New MIDI Grid", onClick: addMidiGrid },
      ],
    },
    {
      label: "Inputs",
      actions: [
        { label: "New Number Input", onClick: addNumberInput },
        { label: "New MIDI Input", onClick: addMIDIInput },
        { label: "New Value", onClick: addValue },
        { label: "New XYPad", onClick: addXYPad },
        { label: "New Multiply", onClick: addMultiply },
      ],
    },
    {
      label: "Visuals",
      actions: [
        { label: "New RGBLight", onClick: addRGBLight },
        { label: "New Analyser", onClick: addAnalyser },
        { label: "Text", onClick: addText },
      ],
    },
    {
      label: "Audio",
      actions: [
        { label: "New Gain Node", onClick: addGainNode },
        { label: "New Destination", onClick: addDestination },
        { label: "New Envelope", onClick: addEnvelope },
      ],
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
                className="ml-4 p-1"
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
              onClick={store.undo}
              className="w-10 h-10 p-2"
            >
              <MdOutlineUndo className="w-full h-full" />
            </Button>
            <Button
              variant={"outline"}
              onClick={store.redo}
              className="w-10 h-10 p-2"
            >
              <MdOutlineRedo className="w-full h-full" />
            </Button>
          </div>

          {/* Transport Control */}
          <div className="fixed bottom-4 right-4 z-10 pointer-events-auto">
            <TransportControl />
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
              nodes={store.nodes}
              onNodesChange={store.onNodesChange}
              edges={store.edges}
              onEdgesChange={store.onEdgesChange}
              onConnect={store.addEdge}
              nodeTypes={store.nodeTypes}
              proOptions={{ hideAttribution: true }}
              panOnScroll={true}
              zoomOnScroll={false}
              edgesReconnectable={true}
              onReconnectStart={store.onReconnectStart}
              onReconnect={store.onReconnect}
              onReconnectEnd={store.onReconnectEnd}
              disableKeyboardA11y={true}
              // onSelectionChange={(params) => {
              //   if (params.nodes.length > 0) {
              //     // handleNodeSelection(params.nodes[0]);
              //     console.log(params.nodes[0]);
              //   }
              // }}
              onNodeClick={(event, node) => {
                handleNodeSelection(node);
              }}
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

export default dynamic(() => Promise.resolve(Page), {
  ssr: false,
});
