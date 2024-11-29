"use client";
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
import { create } from "zustand";

import Oscillator from "../nodes/Oscillator";
import RGBLight from "../nodes/RGBLight";
import NumberInput from "../nodes/NumberInput";
import Destination from "../nodes/Destination";
import Analyser from "../nodes/Analyser";
import Sequencer from "../nodes/Sequencer";
import MIDIInput from "../nodes/MIDIInput";
import Value from "../nodes/Value";
import GainNode from "../nodes/GainNode";
import Envelope from "../nodes/Envelope";
import Text from "../nodes/Text";
import XYPad from "../nodes/XYPad";
import Multiply from "../nodes/Multiply";
import MidiGrid from "../nodes/MidiGrid";
import Reverb from "../nodes/Reverb";

interface MyNode extends Node {
  data: {
    handleKeyDownFunction?: (frequency: number) => void;
    handleKeyUpFunction?: () => void;
    [key: string]: any;
  };
}

export interface StoreState {
  debug: boolean;
  setDebug: (debug: boolean) => void;
  nodes: MyNode[];
  nodes_selectedValue: Omit<Node, "position">[];
  last_selected_node_position: { x: number; y: number };
  edges: Edge[];
  undoStack: { nodes: Node[]; edges: Edge[] }[];
  redoStack: { nodes: Node[]; edges: Edge[] }[];
  nodeTypes: Record<string, React.FC<any>>;
  edgeReconnectSuccessful: { current: boolean };
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;

  /**
   * description: 我的自定义addNode函数
   *
   * 1. 为传入的connection添加id生成新的edge，并将其合并入edges数组中
   *
   * 2. 查找并移除与当前 target ID和 targetHandle ID相同的旧连接，维护多出一入的规则
   *
   * @param newEdge 要添加的edge
   * @returns
   */
  addEdge: (newEdge: Connection) => void;

  /**
   * description: 我的自定义addNode函数
   *
   * 将newNode合并入nodes数组中
   *
   * @param newNode 要添加的节点
   * @returns
   */
  addNode: (newNode: Node) => void;

  updateNode: (id: string, data: any) => void;
  removeNode: (id: string) => void;
  removeEdge: (id: string) => void;
  undo: () => void;
  redo: () => void;
  saveStateToUndoStack: (currentNodes: Node[], currentEdges: Edge[]) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  getHandleConnections: (
    nodeId: string,
    type: "source" | "target",
    handleId: string
  ) => Edge[];

  getNodeData: (nodeId: string, sourceHandleId: string) => any | null;

  onReconnectStart: () => void;
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
  onReconnectEnd: (
    event: MouseEvent | TouchEvent,
    edge: Edge,
    handleType: HandleType
  ) => void;
  handleNodeSelection: (node: Node) => void;
}

export const useStore = createWithEqualityFn<StoreState>((set, get) => ({
  debug: false,
  setDebug: (debug: boolean) => {
    set({ debug }), console.log("debug: ", debug);
  },
  nodes: [],
  nodes_selectedValue: [],
  last_selected_node_position: { x: 0, y: 0 },
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
    xypad: XYPad,
    multiply: Multiply,
    midigrid: MidiGrid,
    reverb: Reverb,
  },

  onNodesChange(changes: NodeChange[]) {
    // 应用节点更改并更新状态
    const newNodes = applyNodeChanges(changes, get().nodes);
    set({ nodes: newNodes });

    // 创建 selectedNodes，剔除 position、positionAbsolute、dragging 和 selected 属性
    const selectedNodes = newNodes.map(
      ({ position, dragging, selected, ...rest }) => rest
    );
    set({ nodes_selectedValue: selectedNodes });

    // 其他状态保存代码
    // get().saveStateToUndoStack(newNodes, get().edges);
  },

  onEdgesChange(changes: EdgeChange[]) {
    const newEdges = applyEdgeChanges(changes, get().edges);
    set({ edges: newEdges });
    // get().saveStateToUndoStack(get().nodes, newEdges);
  },

  addEdge(data: Connection) {
    const edge: Edge = { id: nanoid(6), ...data };

    set((state) => {
      // 查找并移除与当前 target ID和 targetHandle ID相同的旧连接，用于维护多出一入的规则
      const updatedEdges = state.edges.filter(
        (existingEdge) =>
          !(
            existingEdge.target === edge.target &&
            existingEdge.targetHandle === edge.targetHandle
          )
      );

      const newEdges = [edge, ...updatedEdges];

      return { edges: newEdges };
    });
  },

  addNode(newNode: Node) {
    set((state) => ({
      nodes: [newNode, ...state.nodes],
    }));
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

  setNodes: (nodes: Node[]) => set({ nodes: nodes }),
  setEdges: (edges: Edge[]) => set({ edges: edges }),

  getHandleConnections(
    nodeId: string,
    type: "source" | "target",
    handleId: string
  ) {
    const edges = get().edges;

    const filterEdges = edges.filter(
      (edge) =>
        edge[type] === nodeId &&
        edge[`${type}Handle` as "sourceHandle" | "targetHandle"] === handleId
    );

    if (filterEdges.length > 1 && type === "target") {
      console.warn(
        `Multiple connections found for target handle ID "${handleId}" on node ID "${nodeId}".`
      );
    }

    return filterEdges;
  },

  getNodeData: (nodeId: string, sourceHandleId: string) => {
    const nodes = get().nodes;
    const node = nodes.find((node) => node.id === nodeId);
    return node ? node.data[sourceHandleId] : null;
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
  handleNodeSelection: (node: Node) => {
    set({ last_selected_node_position: node.position });
    console.log("node selected", node);
  },
}));

/**
 * description: 返回指定handle上的所有connections
 *
 * nodeId, type, handleId 三个参数可以确定唯一handle
 *
 * @param nodeId 指定handle所在node的id
 * @param type 指定handle的type，source或target
 * @param handleId 指定handle的id
 * @returns 所有连接到指定handle的edges
 */
export const getHandleConnections = useStore.getState().getHandleConnections;

/**
 * description: 获取指定node的data中的sourceHandleId代表的key的值
 *
 * @param nodeId 指定node的id
 * @param sourceHandleId 指定handle的id
 * @returns 指定node的data
 */
export const getNodeData = useStore.getState().getNodeData;

export const updateNode = useStore.getState().updateNode;

export const handleNodeSelection = useStore.getState().handleNodeSelection;

// HMR 配置
declare const module: any;
if (module.hot) {
  module.hot.accept();
  module.hot.dispose((data: { state: StoreState }) => {
    data.state = useStore.getState(); // 保存状态
  });
  if (module.hot.data?.state) {
    useStore.setState(module.hot.data.state); // 恢复状态
  }
}
