import { create } from "zustand";
import type { TimerPhase, TimerType } from "@/data/types";
import { loadProgress } from "@/lib/storage";

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
  tick: () => void;
  completeWork: (pomodorosCompleted: number) => void;
  completeBreak: () => void;
  setWorkMinutes: (min: number) => void;
  setShortBreakMinutes: (min: number) => void;
  setLongBreakMinutes: (min: number) => void;
}

function getSettings() {
  const progress = loadProgress();
  return progress.timerSettings;
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
    },

    pause: () => set({ phase: "paused" }),

    resume: () => set({ phase: "running" }),

    reset: () => {
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

    tick: () => {
      const state = get();
      if (state.phase !== "running") return;
      const newSeconds = state.secondsRemaining - 1;
      if (newSeconds <= 0) {
        set({ secondsRemaining: 0 });
      } else {
        set({ secondsRemaining: newSeconds });
      }
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
    },

    completeBreak: () => {
      const state = get();
      set({
        phase: "idle",
        timerType: "work",
        secondsRemaining: state.workMinutes * 60,
      });
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
  };
});
