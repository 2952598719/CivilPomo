"use client";

import { useEffect } from "react";
import { hydrateFromServer } from "@/lib/storage";
import { useGameStore } from "@/stores/game-store";
import { useTimerStore } from "@/stores/timer-store";

export function useHydrateFromServer() {
  useEffect(() => {
    hydrateFromServer().then((result) => {
      if (!result) return;
      const { progress } = result;
      const store = useGameStore.getState();
      store.currentNodeId = progress.currentNodeId;
      store.completedPomodoros = progress.completedPomodoros;
      store.completedNodes = progress.completedNodes;
      store.currentEraIndex = progress.currentEraIndex;
      store.totalPomodoros = progress.totalPomodoros;

      const timer = useTimerStore.getState();
      timer.setWorkMinutes(progress.timerSettings.workMinutes);
      timer.setShortBreakMinutes(progress.timerSettings.shortBreakMinutes);
      timer.setLongBreakMinutes(progress.timerSettings.longBreakMinutes);
    });
  }, []);
}
