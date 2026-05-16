"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTimerStore } from "@/stores/timer-store";
import { useGameStore } from "@/stores/game-store";
import { Button } from "@/components/ui/button";

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

const RADIUS = 120;
const STROKE = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

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
    workMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    start,
    pause,
    resume,
    reset,
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

  const totalSeconds =
    phase === "break"
      ? (timerType === "longBreak" ? longBreakMinutes : shortBreakMinutes) * 60
      : workMinutes * 60;
  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const ringColor =
    phase === "break"
      ? "stroke-emerald-500"
      : phase === "running"
        ? "stroke-primary"
        : "stroke-muted-foreground/30";

  const size = (RADIUS + STROKE) * 2;

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={RADIUS + STROKE}
              cy={RADIUS + STROKE}
              r={RADIUS}
              fill="none"
              strokeWidth={STROKE}
              className="stroke-muted-foreground/10"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-mono font-bold tabular-nums">--:--</span>
          </div>
        </div>
        <Button size="lg" disabled>开始专注</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            className="stroke-muted-foreground/10"
          />
          <circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            strokeWidth={STROKE}
            strokeLinecap="round"
            className={`${ringColor} transition-colors`}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold tabular-nums">
            {formatTime(secondsRemaining)}
          </span>
          <span className="mt-1 text-sm text-muted-foreground">
            {phaseLabels[phase]}
            {phase === "break" &&
              (timerType === "longBreak" ? "（长休息）" : "（短休息）")}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        {phase === "idle" && (
          <Button onClick={handleStart} size="lg" disabled={!canStart}>
            开始专注
          </Button>
        )}
        {phase === "running" && (
          <>
            <Button onClick={handlePause} variant="outline" size="lg">
              暂停
            </Button>
            <Button onClick={() => reset()} variant="ghost" size="lg">
              停止
            </Button>
          </>
        )}
        {phase === "paused" && (
          <>
            <Button onClick={handleResume} size="lg">
              继续
            </Button>
            <Button onClick={() => reset()} variant="ghost" size="lg">
              停止
            </Button>
          </>
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
    </div>
  );
}
