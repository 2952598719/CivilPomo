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
    useGameStore.getState().selectNode("fire"); // fire requires 2 pomodoros
    useGameStore.getState().completePomodoro();
    useGameStore.getState().completePomodoro();
    const state = useGameStore.getState();
    expect(state.completedNodes).toContain("fire");
    expect(state.currentNodeId).toBeNull();
  });

  it("advances era when all nodes in current era are complete", () => {
    const store = useGameStore.getState();
    // Complete all ancient era nodes: fire(2), language(3), stone-tools(2)
    ["fire", "language", "stone-tools"].forEach((nodeId) => {
      store.selectNode(nodeId);
      const node = store.tree.eras[0].nodes.find((n) => n.id === nodeId)!;
      for (let i = 0; i < node.pomodorosRequired; i++) {
        store.completePomodoro();
      }
    });
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
