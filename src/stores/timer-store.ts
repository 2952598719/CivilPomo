import { create } from "zustand";
import type { TimerPhase, TimerType } from "@/data/types";
import { loadProgress } from "@/lib/storage";

type WorkCompleteCallback = (pomodorosCompleted: number) => void;

interface TimerState {
  phase: TimerPhase;
  timerType: TimerType;
  secondsRemaining: number;
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;

  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  completeBreak: () => void;
  completeWork: (pomodorosCompleted: number) => void;
  setWorkMinutes: (min: number) => void;
  setShortBreakMinutes: (min: number) => void;
  setLongBreakMinutes: (min: number) => void;
  setOnWorkComplete: (cb: WorkCompleteCallback | null) => void;
}

function getSettings() {
  const progress = loadProgress();
  return progress.timerSettings;
}

let intervalId: ReturnType<typeof setInterval> | null = null;
let onWorkComplete: WorkCompleteCallback | null = null;

function clearTickInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function startTickInterval(get: () => TimerState, set: (partial: Partial<TimerState>) => void) {
  clearTickInterval();
  intervalId = setInterval(() => {
    const state = get();
    if (state.phase !== "running" && state.phase !== "break") {
      clearTickInterval();
      return;
    }
    const newSeconds = state.secondsRemaining - 1;
    if (newSeconds <= 0) {
      set({ secondsRemaining: 0 });
      clearTickInterval();
      if (state.timerType === "work") {
        // Import dynamically to avoid circular dependency
        import("@/stores/game-store").then(({ useGameStore }) => {
          const totalPomodoros = useGameStore.getState().totalPomodoros + 1;
          const isLongBreak = totalPomodoros % 4 === 0;
          const breakMinutes = isLongBreak
            ? state.longBreakMinutes
            : state.shortBreakMinutes;
          set({
            phase: "break",
            timerType: isLongBreak ? "longBreak" : "shortBreak",
            secondsRemaining: breakMinutes * 60,
          });
          startTickInterval(get, set);
          onWorkComplete?.(totalPomodoros);
        });
      } else {
        set({
          phase: "idle",
          timerType: "work",
          secondsRemaining: state.workMinutes * 60,
        });
      }
    } else {
      set({ secondsRemaining: newSeconds });
    }
  }, 1000);
}

export const useTimerStore = create<TimerState>((set, get) => {
  const settings = getSettings();

  return {
    phase: "idle",
    timerType: "work",
    secondsRemaining: settings.workMinutes * 60,
    workMinutes: settings.workMinutes,
    shortBreakMinutes: settings.shortBreakMinutes,
    longBreakMinutes: settings.longBreakMinutes,

    start: () => {
      const state = get();
      set({
        phase: "running",
        timerType: "work",
        secondsRemaining: state.workMinutes * 60,
      });
      startTickInterval(get, set);
    },

    pause: () => {
      set({ phase: "paused" });
      clearTickInterval();
    },

    resume: () => {
      set({ phase: "running" });
      startTickInterval(get, set);
    },

    reset: () => {
      clearTickInterval();
      const settings = getSettings();
      set({
        phase: "idle",
        timerType: "work",
        secondsRemaining: settings.workMinutes * 60,
        workMinutes: settings.workMinutes,
        shortBreakMinutes: settings.shortBreakMinutes,
        longBreakMinutes: settings.longBreakMinutes,
      });
    },

    completeBreak: () => {
      clearTickInterval();
      const state = get();
      set({
        phase: "idle",
        timerType: "work",
        secondsRemaining: state.workMinutes * 60,
      });
    },

    completeWork: (pomodorosCompleted: number) => {
      const state = get();
      const isLongBreak = pomodorosCompleted % 4 === 0;
      const breakMinutes = isLongBreak
        ? state.longBreakMinutes
        : state.shortBreakMinutes;
      set({
        phase: "break",
        timerType: isLongBreak ? "longBreak" : "shortBreak",
        secondsRemaining: breakMinutes * 60,
      });
      startTickInterval(get, set);
    },

    setWorkMinutes: (min: number) => {
      const state = get();
      const updates: Partial<TimerState> = { workMinutes: min };
      if (state.phase === "idle" && state.timerType === "work") {
        updates.secondsRemaining = min * 60;
      }
      set(updates);
    },
    setShortBreakMinutes: (min: number) => set({ shortBreakMinutes: min }),
    setLongBreakMinutes: (min: number) => set({ longBreakMinutes: min }),
    setOnWorkComplete: (cb: WorkCompleteCallback | null) => {
      onWorkComplete = cb;
    },
  };
});
