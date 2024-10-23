import {
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from "@xyflow/react";
import { nanoid } from "nanoid";
import next from "next";
import { createWithEqualityFn } from "zustand/traditional";

export interface StoreState {
  nodes: Node[];
  edges: Edge[];
  undoStack: { nodes: Node[]; edges: Edge[] }[];
  redoStack: { nodes: Node[]; edges: Edge[] }[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addEdge: (data: Omit<Edge, "id">) => void;
  addNode: (data: Omit<Node, "id">) => void;
  updateNode: (id: string, data: any) => void;
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
}

export const useStore = createWithEqualityFn<StoreState>((set, get) => ({
  nodes: [],
  edges: [],
  undoStack: [],
  redoStack: [],

  onNodesChange(changes: NodeChange[]) {
    const newNodes = applyNodeChanges(changes, get().nodes);
    set({
      nodes: newNodes,
    });
    get().saveStateToUndoStack(newNodes, get().edges); // 调用 saveStateToUndoStack
  },

  onEdgesChange(changes: EdgeChange[]) {
    const newEdges = applyEdgeChanges(changes, get().edges);
    set({
      edges: newEdges,
    });
    get().saveStateToUndoStack(get().nodes, newEdges); // 调用 saveStateToUndoStack
  },

  addEdge(data: Omit<Edge, "id">) {
    const id = nanoid(6);
    const edge: Edge = { id, ...data };

    const newEdges = [edge, ...get().edges];

    set({ edges: newEdges });
    get().saveStateToUndoStack(get().nodes, newEdges); // 调用 saveStateToUndoStack
  },

  addNode(data: Omit<Node, "id">) {
    const id = nanoid(6);
    const node: Node = { id, ...data };

    const newNodes = [node, ...get().nodes];

    set({ nodes: newNodes });
    get().saveStateToUndoStack(newNodes, get().edges); // 调用 saveStateToUndoStack
  },

  updateNode(id: string, data: any) {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
    get().saveStateToUndoStack(get().nodes, get().edges); // 调用 saveStateToUndoStack
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

  useHandleConnections(
    nodeId: string,
    type: "source" | "target",
    handleId: string
  ) {
    const edges = get().edges;
    return edges.filter(
      (edge) =>
        edge[type as "source" | "target"] === nodeId &&
        edge[(type + "Handle") as "sourceHandle" | "targetHandle"] === handleId
    );
  },
  useNodesData: (nodeId: string) => {
    const nodes = get().nodes;
    const node = nodes.find((node) => node.id === nodeId);
    return node ? node.data : null;
  },
}));
