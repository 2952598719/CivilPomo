"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTimerStore } from "@/stores/timer-store";
import { useGameStore } from "@/stores/game-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

const phaseLabels = {
  idle: "准备开始",
  running: "专注中",
  paused: "已暂停",
  break: "休息中",
};

interface PomodoroTimerProps {
  onStart?: () => void;
  onWorkComplete?: (pomodorosCompleted: number) => void;
  canStart?: boolean;
}

export function PomodoroTimer({ onStart, onWorkComplete, canStart = true }: PomodoroTimerProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    phase,
    timerType,
    secondsRemaining,
    start,
    pause,
    resume,
    completeBreak,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onWorkCompleteRef = useRef(onWorkComplete);
  onWorkCompleteRef.current = onWorkComplete;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (phase === "running" || phase === "break") {
      intervalRef.current = setInterval(() => {
        const state = useTimerStore.getState();
        state.tick();
        if (useTimerStore.getState().secondsRemaining <= 0) {
          clearTimer();
          if (state.timerType === "work") {
            const totalPomodoros = useGameStore.getState().totalPomodoros + 1;
            state.completeWork(totalPomodoros);
            onWorkCompleteRef.current?.(totalPomodoros);
          } else {
            state.completeBreak();
          }
        }
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [phase, clearTimer]);

  const handleStart = () => { start(); onStart?.(); };
  const handlePause = () => pause();
  const handleResume = () => resume();

  if (!mounted) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <p className="text-sm text-muted-foreground">准备开始</p>
          <p className="text-6xl font-mono font-bold tabular-nums">--:--</p>
          <div className="flex gap-3">
            <Button size="lg" disabled>开始专注</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex flex-col items-center gap-6 p-8">
        <p className="text-sm text-muted-foreground">
          {phaseLabels[phase]}
          {phase === "break" &&
            (timerType === "longBreak" ? "（长休息）" : "（短休息）")}
        </p>
        <p className="text-6xl font-mono font-bold tabular-nums">
          {formatTime(secondsRemaining)}
        </p>
        <div className="flex gap-3">
          {phase === "idle" && (
            <Button onClick={handleStart} size="lg" disabled={!canStart}>
              开始专注
            </Button>
          )}
          {phase === "running" && (
            <Button onClick={handlePause} variant="outline" size="lg">
              暂停
            </Button>
          )}
          {phase === "paused" && (
            <Button onClick={handleResume} size="lg">
              继续
            </Button>
          )}
          {phase === "break" && (
            <Button
              onClick={() => completeBreak()}
              variant="outline"
              size="lg"
            >
              跳过休息
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
