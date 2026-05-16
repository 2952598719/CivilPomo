import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/stores/game-store";

beforeEach(() => {
  localStorage.clear();
  useGameStore.getState().resetGame();
});

describe("gameStore", () => {
  it("starts with no current node and era 0", () => {
    const state = useGameStore.getState();
    expect(state.currentNodeId).toBeNull();
    expect(state.currentEraIndex).toBe(0);
    expect(state.completedNodes).toEqual([]);
  });

  it("selects a node", () => {
    useGameStore.getState().selectNode("fire");
    expect(useGameStore.getState().currentNodeId).toBe("fire");
    expect(useGameStore.getState().completedPomodoros).toBe(0);
  });

  it("completes a pomodoro and advances progress", () => {
    useGameStore.getState().selectNode("fire");
    useGameStore.getState().completePomodoro();
    const state = useGameStore.getState();
    expect(state.completedPomodoros).toBe(1);
    expect(state.totalPomodoros).toBe(1);
  });

  it("marks node complete when all pomodoros done", () => {
    useGameStore.getState().selectNode("fire"); // fire requires 3 pomodoros
    useGameStore.getState().completePomodoro();
    useGameStore.getState().completePomodoro();
    useGameStore.getState().completePomodoro();
    const state = useGameStore.getState();
    expect(state.completedNodes).toContain("fire");
    expect(state.currentNodeId).toBeNull();
  });

  it("shows transition node when all era nodes complete", () => {
    const store = useGameStore.getState();
    const firstEra = store.tree.eras[0];
    firstEra.nodes.forEach((node) => {
      store.selectNode(node.id);
      for (let i = 0; i < node.pomodorosRequired; i++) {
        store.completePomodoro();
      }
    });
    // Era not advanced yet — transition node appears first
    expect(useGameStore.getState().currentEraIndex).toBe(0);
    expect(useGameStore.getState().getAvailableNodeIds()).toEqual([
      `__transition__${firstEra.id}`,
    ]);
  });

  it("advances era after transition node pomodoro", () => {
    const store = useGameStore.getState();
    const firstEra = store.tree.eras[0];
    firstEra.nodes.forEach((node) => {
      store.selectNode(node.id);
      for (let i = 0; i < node.pomodorosRequired; i++) {
        store.completePomodoro();
      }
    });
    store.selectNode(`__transition__${firstEra.id}`);
    const didTransition = store.completePomodoro();
    expect(didTransition).toBe(true);
    expect(useGameStore.getState().currentEraIndex).toBe(1);
  });

  it("preserves progress when switching nodes", () => {
    useGameStore.getState().selectNode("fire");
    useGameStore.getState().completePomodoro();
    useGameStore.getState().selectNode("language");
    expect(useGameStore.getState().completedPomodoros).toBe(0);
    useGameStore.getState().selectNode("fire");
    expect(useGameStore.getState().completedPomodoros).toBe(1);
  });

  it("can switch to another available node", () => {
    useGameStore.getState().selectNode("fire");
    useGameStore.getState().completePomodoro();
    useGameStore.getState().selectNode("language");
    expect(useGameStore.getState().currentNodeId).toBe("language");
    useGameStore.getState().selectNode("fire");
    expect(useGameStore.getState().completedPomodoros).toBe(1);
  });
});
