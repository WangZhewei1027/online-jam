import {
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  HandleType,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import { createWithEqualityFn } from "zustand/traditional";

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
import { text } from "stream/consumers";

export interface StoreState {
  nodes: Node[];
  edges: Edge[];
  undoStack: { nodes: Node[]; edges: Edge[] }[];
  redoStack: { nodes: Node[]; edges: Edge[] }[];
  nodeTypes: Record<string, React.FC<any>>;
  edgeReconnectSuccessful: { current: boolean };
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addEdge: (data: Omit<Edge, "id">) => void;
  addNode: (data: Omit<Node, "id">) => void;
  updateNode: (id: string, data: any) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  undo: () => void;
  redo: () => void;
  saveStateToUndoStack: (currentNodes: Node[], currentEdges: Edge[]) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  useHandleConnections: (
    nodeId: string,
    type: "source" | "target",
    handleId: string
  ) => Edge[];
  useNodesData: (nodeId: string) => any;
  onReconnectStart: () => void;
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
  onReconnectEnd: (
    event: MouseEvent | TouchEvent,
    edge: Edge,
    handleType: HandleType
  ) => void;
}

export const useStore = createWithEqualityFn<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  undoStack: [],
  redoStack: [],
  edgeReconnectSuccessful: { current: false },

  nodeTypes: {
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
  },

  onNodesChange(changes: NodeChange[]) {
    console.log("change 被触发");
    const newNodes = applyNodeChanges(changes, get().nodes);
    set({ nodes: newNodes });
    // get().saveStateToUndoStack(newNodes, get().edges);
  },

  onEdgesChange(changes: EdgeChange[]) {
    const newEdges = applyEdgeChanges(changes, get().edges);
    set({ edges: newEdges });
    // get().saveStateToUndoStack(get().nodes, newEdges);
  },

  addEdge(data: Omit<Edge, "id">) {
    const id = nanoid(6);
    const edge: Edge = { id, ...data };

    set((state) => {
      // 查找并移除与当前 target 和 targetHandle 相同的旧连接
      const updatedEdges = state.edges.filter(
        (existingEdge) =>
          !(
            existingEdge.target === edge.target &&
            existingEdge.targetHandle === edge.targetHandle
          )
      );

      // 添加新的连接
      const newEdges = [edge, ...updatedEdges];

      // 更新 edges 并保存状态
      return { edges: newEdges };
    });

    // get().saveStateToUndoStack(get().nodes, get().edges);
  },

  addNode(data: Omit<Node, "id">) {
    const id = nanoid(6);
    const node: Node = { id, ...data };
    const newNodes = [node, ...get().nodes];
    set({ nodes: newNodes });
    // get().saveStateToUndoStack(newNodes, get().edges);
  },

  updateNode(id: string, data: any) {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
    // get().saveStateToUndoStack(get().nodes, get().edges);
  },

  removeNode(id: string) {
    const newNodes = get().nodes.filter((node) => node.id !== id);
    const newEdges = get().edges.filter(
      (edge) => edge.source !== id && edge.target !== id
    );
    set({ nodes: newNodes, edges: newEdges });
    // get().saveStateToUndoStack(newNodes, newEdges);
  },

  removeEdge(id: string) {
    const newEdges = get().edges.filter((edge) => edge.id !== id);
    set({ edges: newEdges });
    // get().saveStateToUndoStack(get().nodes, newEdges);
  },

  undo() {
    const undoStack = get().undoStack;
    if (undoStack.length > 1) {
      const previousState = undoStack[undoStack.length - 2];
      const nextState = undoStack[undoStack.length - 1];
      set({
        nodes: previousState.nodes,
        edges: previousState.edges,
        undoStack: undoStack.slice(0, -1),
        redoStack: [
          { nodes: nextState.nodes, edges: nextState.edges },
          ...get().redoStack,
        ],
      });
    }
  },

  redo() {
    const redoStack = get().redoStack;
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      set({
        nodes: nextState.nodes,
        edges: nextState.edges,
        redoStack: redoStack.slice(1),
        undoStack: [
          ...get().undoStack,
          { nodes: get().nodes, edges: get().edges },
        ],
      });
    }
  },

  saveStateToUndoStack(currentNodes: Node[], currentEdges: Edge[]) {
    set({
      undoStack: [
        ...get().undoStack,
        { nodes: currentNodes, edges: currentEdges },
      ],
      redoStack: [],
    });
  },

  setNodes: (nodes: Node[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),

  useHandleConnections(
    nodeId: string,
    type: "source" | "target",
    handleId: string
  ) {
    const edges = get().edges;
    return edges.filter(
      (edge) =>
        edge[type] === nodeId &&
        edge[(type + "Handle") as "sourceHandle" | "targetHandle"] === handleId
    );
  },

  useNodesData: (nodeId: string) => {
    const nodes = get().nodes;
    const node = nodes.find((node) => node.id === nodeId);
    return node ? node.data : null;
  },

  // 新增的 onReconnectStart 方法
  onReconnectStart() {
    set({ edgeReconnectSuccessful: { current: false } });
  },

  onReconnect(oldEdge: Edge, connection: Connection) {
    const updatedEdge: Edge = {
      ...oldEdge,
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      target: connection.target,
      targetHandle: connection.targetHandle,
    };

    const newEdges = [
      updatedEdge,
      ...get().edges.filter(
        (edge) =>
          edge.id !== oldEdge.id &&
          !(
            edge.target === updatedEdge.target &&
            edge.targetHandle === updatedEdge.targetHandle
          )
      ),
    ];

    set({ edges: newEdges, edgeReconnectSuccessful: { current: true } });
    get().saveStateToUndoStack(get().nodes, newEdges);
  },

  // 新增的 onReconnectEnd 方法
  onReconnectEnd(
    event: MouseEvent | TouchEvent,
    edge: Edge,
    handleType: HandleType
  ) {
    if (!get().edgeReconnectSuccessful.current) {
      set({
        edges: get().edges.filter((e) => e.id !== edge.id),
      });
    }
    set(() => ({ edgeReconnectSuccessful: { current: false } }));
  },
}));
