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
let endTimestamp = 0;

function clearTickInterval() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function notifyUser(timerType: string) {
  import("@/lib/capacitor").then(({ showNotification }) => {
    const label = timerType === "work" ? "专注时间结束！" : "休息时间结束！";
    showNotification("CivilPomo", label);
  });
}

function handleElapsed(get: () => TimerState, set: (partial: Partial<TimerState>) => void) {
  const state = get();
  if (state.phase !== "running" && state.phase !== "break") return;

  const now = Date.now();
  const elapsed = Math.floor((now - endTimestamp) / 1000);

  if (elapsed < 0) {
    // Timer hasn't ended yet, update remaining
    set({ secondsRemaining: Math.abs(elapsed) });
    return;
  }

  // Timer completed while in background
  set({ secondsRemaining: 0 });
  clearTickInterval();

  if (state.timerType === "work") {
    import("@/stores/game-store").then(({ useGameStore }) => {
      const totalPomodoros = useGameStore.getState().totalPomodoros + 1;
      const isLongBreak = totalPomodoros % 4 === 0;
      const breakMinutes = isLongBreak ? state.longBreakMinutes : state.shortBreakMinutes;
      endTimestamp = Date.now() + breakMinutes * 60 * 1000;
      set({
        phase: "break",
        timerType: isLongBreak ? "longBreak" : "shortBreak",
        secondsRemaining: breakMinutes * 60,
      });
      startTickInterval(get, set);
      notifyUser("break");
      onWorkComplete?.(totalPomodoros);
    });
  } else {
    set({
      phase: "idle",
      timerType: "work",
      secondsRemaining: state.workMinutes * 60,
    });
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
        import("@/stores/game-store").then(({ useGameStore }) => {
          const totalPomodoros = useGameStore.getState().totalPomodoros + 1;
          const isLongBreak = totalPomodoros % 4 === 0;
          const breakMinutes = isLongBreak ? state.longBreakMinutes : state.shortBreakMinutes;
          endTimestamp = Date.now() + breakMinutes * 60 * 1000;
          set({
            phase: "break",
            timerType: isLongBreak ? "longBreak" : "shortBreak",
            secondsRemaining: breakMinutes * 60,
          });
          startTickInterval(get, set);
          notifyUser("break");
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

// Listen for app coming back to foreground
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // Re-sync timer from endTimestamp
      const store = useTimerStore.getState();
      if (store.phase === "running" || store.phase === "break") {
        handleElapsed(useTimerStore.getState, useTimerStore.setState);
      }
    }
  });
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
      const seconds = state.workMinutes * 60;
      endTimestamp = Date.now() + seconds * 1000;
      set({
        phase: "running",
        timerType: "work",
        secondsRemaining: seconds,
      });
      startTickInterval(get, set);
      notifyUser("work");
    },

    pause: () => {
      set({ phase: "paused" });
      clearTickInterval();
    },

    resume: () => {
      const state = get();
      endTimestamp = Date.now() + state.secondsRemaining * 1000;
      set({ phase: "running" });
      startTickInterval(get, set);
    },

    reset: () => {
      clearTickInterval();
      endTimestamp = 0;
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
      const breakMinutes = isLongBreak ? state.longBreakMinutes : state.shortBreakMinutes;
      endTimestamp = Date.now() + breakMinutes * 60 * 1000;
      set({
        phase: "break",
        timerType: isLongBreak ? "longBreak" : "shortBreak",
        secondsRemaining: breakMinutes * 60,
      });
      startTickInterval(get, set);
      notifyUser("break");
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
