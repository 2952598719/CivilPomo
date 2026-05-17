import { create } from "zustand";
import type { TechTree, UserProgress } from "@/data/types";
import {
  isEraComplete,
  findNodeById,
  isTransitionNode,
  makeTransitionNode,
} from "@/lib/game-logic";
import { loadProgress, saveProgress, clearAllData } from "@/lib/storage";
import techTreeData from "@/data/tech-tree.json";

const tree = techTreeData as TechTree;

const nodeProgressMap = new Map<string, number>();

interface GameState {
  tree: TechTree;
  currentNodeId: string | null;
  completedPomodoros: number;
  completedNodes: string[];
  currentEraIndex: number;
  totalPomodoros: number;

  selectNode: (nodeId: string) => void;
  completePomodoro: () => boolean;
  resetGame: () => void;
  getAvailableNodeIds: () => string[];
  getNodeProgress: (nodeId: string) => number;
}

export const useGameStore = create<GameState>((set, get) => {
  const saved = loadProgress();

  return {
    tree,
    currentNodeId: saved.currentNodeId,
    completedPomodoros: saved.completedPomodoros,
    completedNodes: saved.completedNodes,
    currentEraIndex: saved.currentEraIndex,
    totalPomodoros: saved.totalPomodoros,

    selectNode: (nodeId: string) => {
      const state = get();
      if (state.currentNodeId) {
        nodeProgressMap.set(state.currentNodeId, state.completedPomodoros);
      }
      const savedPomodoros = nodeProgressMap.get(nodeId) ?? 0;
      set({ currentNodeId: nodeId, completedPomodoros: savedPomodoros });
    },

    completePomodoro: () => {
      const state = get();
      if (!state.currentNodeId) return false;

      const newCompleted = state.completedPomodoros + 1;
      const newTotal = state.totalPomodoros + 1;
      const nodeInfo = findNodeById(tree, state.currentNodeId);

      if (!nodeInfo) return false;

      const nodeComplete = newCompleted >= nodeInfo.node.pomodorosRequired;

      const newCompletedNodes = [...state.completedNodes];
      let newCurrentNodeId: string | null = state.currentNodeId;
      let newEraIndex = state.currentEraIndex;
      let didTransition = false;

      if (nodeComplete) {
        newCurrentNodeId = null;
        nodeProgressMap.delete(state.currentNodeId);

        if (isTransitionNode(state.currentNodeId)) {
          if (newEraIndex < tree.eras.length - 1) {
            newEraIndex += 1;
            didTransition = true;
          }
        } else {
          newCompletedNodes.push(state.currentNodeId);
        }
      }

      const newState = {
        completedPomodoros: nodeComplete ? 0 : newCompleted,
        completedNodes: newCompletedNodes,
        currentNodeId: newCurrentNodeId,
        currentEraIndex: newEraIndex,
        totalPomodoros: newTotal,
      };

      set(newState);

      const fullState = get();
      saveProgress({
        currentNodeId: fullState.currentNodeId,
        completedPomodoros: fullState.completedPomodoros,
        completedNodes: fullState.completedNodes,
        currentEraIndex: fullState.currentEraIndex,
        totalPomodoros: fullState.totalPomodoros,
        timerSettings: loadProgress().timerSettings,
      });

      return didTransition;
    },

    resetGame: () => {
      nodeProgressMap.clear();
      clearAllData();
      set({
        currentNodeId: null,
        completedPomodoros: 0,
        completedNodes: [],
        currentEraIndex: 0,
        totalPomodoros: 0,
      });
    },

    getNodeProgress: (nodeId: string) => {
      const state = get();
      if (state.currentNodeId === nodeId) return state.completedPomodoros;
      if (state.completedNodes.includes(nodeId)) {
        const node = tree.eras.flatMap((e) => e.nodes).find((n) => n.id === nodeId);
        return node?.pomodorosRequired ?? 0;
      }
      return nodeProgressMap.get(nodeId) ?? 0;
    },

    getAvailableNodeIds: () => {
      const state = get();
      const era = tree.eras[state.currentEraIndex];
      if (!era) return [];
      const available = era.nodes
        .filter(
          (n) =>
            !state.completedNodes.includes(n.id) &&
            n.prerequisites.every((p) => state.completedNodes.includes(p))
        )
        .map((n) => n.id);

      if (
        available.length === 0 &&
        isEraComplete(tree, state.currentEraIndex, state.completedNodes) &&
        state.currentEraIndex < tree.eras.length - 1 &&
        !state.currentNodeId
      ) {
        return [makeTransitionNode(era).id];
      }

      return available;
    },
  };
});
