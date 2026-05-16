import { describe, it, expect, beforeEach } from "vitest";
import { useTimerStore } from "@/stores/timer-store";

beforeEach(() => {
  useTimerStore.getState().reset();
});

describe("timerStore", () => {
  it("starts in idle phase", () => {
    const state = useTimerStore.getState();
    expect(state.phase).toBe("idle");
    expect(state.timerType).toBe("work");
  });

  it("starts timer and sets phase to running", () => {
    useTimerStore.getState().start();
    expect(useTimerStore.getState().phase).toBe("running");
  });

  it("pauses and resumes timer", () => {
    useTimerStore.getState().start();
    useTimerStore.getState().pause();
    expect(useTimerStore.getState().phase).toBe("paused");
    useTimerStore.getState().resume();
    expect(useTimerStore.getState().phase).toBe("running");
  });

  it("transitions to short break after work completes", () => {
    const store = useTimerStore.getState();
    store.completeWork(1); // pomodorosCompleted = 1
    expect(useTimerStore.getState().phase).toBe("break");
    expect(useTimerStore.getState().timerType).toBe("shortBreak");
  });

  it("uses long break after 4 pomodoros", () => {
    const store = useTimerStore.getState();
    store.completeWork(4);
    expect(useTimerStore.getState().timerType).toBe("longBreak");
  });

  it("resets to idle", () => {
    useTimerStore.getState().start();
    useTimerStore.getState().reset();
    expect(useTimerStore.getState().phase).toBe("idle");
  });
});
