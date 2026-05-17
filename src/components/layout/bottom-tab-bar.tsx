"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Split, BookOpen } from "lucide-react";
import { useTimerStore } from "@/stores/timer-store";
import { useState, useEffect } from "react";

const HIDE_ON = ["/settings", "/transition"];

const MINI_R = 34;
const MINI_STROKE = 3.5;
const MINI_CIRCUMFERENCE = 2 * Math.PI * MINI_R;

export function BottomTabBar() {
  const pathname = usePathname();

  if (HIDE_ON.includes(pathname)) return null;

  return (
    <nav className="relative flex items-end justify-around pb-4 pt-2 border-t bg-background">
      <TabItem
        href="/tree"
        icon={<Split size={24} />}
        label="科技树"
        active={pathname === "/tree"}
      />
      <div className="w-20" />
      <TabItem
        href="/chronicle"
        icon={<BookOpen size={24} />}
        label="编年史"
        active={pathname === "/chronicle"}
      />
      <div className="absolute left-1/2 -translate-x-1/2 -top-6">
        {pathname === "/timer" ? (
          <HomeButton />
        ) : (
          <MiniTimer />
        )}
      </div>
    </nav>
  );
}

function TabItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-1 px-4 pt-3 pb-1 ${
        active ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Link>
  );
}

function HomeButton() {
  return (
    <Link
      href="/timer"
      className="flex items-center justify-center w-20 h-20 rounded-full shadow-md border-2 bg-foreground text-background border-foreground"
    >
      <span className="text-xl font-bold">P</span>
    </Link>
  );
}

function MiniTimer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { phase, timerType, secondsRemaining, workMinutes, shortBreakMinutes, longBreakMinutes } =
    useTimerStore();

  if (!mounted) {
    return (
      <Link
        href="/timer"
        className="relative flex items-center justify-center w-20 h-20 rounded-full shadow-md border-2 bg-background border-border"
      >
        <span className="relative text-xs font-mono font-medium">--:--</span>
      </Link>
    );
  }

  const totalSeconds =
    phase === "break"
      ? (timerType === "longBreak" ? longBreakMinutes : shortBreakMinutes) * 60
      : workMinutes * 60;
  const progress = totalSeconds > 0 ? secondsRemaining / totalSeconds : 0;
  const dashOffset = MINI_CIRCUMFERENCE * (1 - progress);

  const m = Math.floor(secondsRemaining / 60);
  const s = secondsRemaining % 60;
  const timeStr = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  const isActive = phase === "running" || phase === "break";
  const strokeColor = phase === "break" ? "#10b981" : "hsl(var(--foreground))";

  return (
    <Link
      href="/timer"
      className="relative flex items-center justify-center w-20 h-20 rounded-full shadow-md border-2 bg-background border-border"
    >
      <svg width="76" height="76" className="absolute">
        <circle
          cx="38" cy="38" r={MINI_R}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={MINI_STROKE}
        />
        <circle
          cx="38" cy="38" r={MINI_R}
          fill="none"
          stroke={strokeColor}
          strokeWidth={MINI_STROKE}
          strokeDasharray={MINI_CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
          opacity={isActive ? 1 : 0.4}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <span className="relative text-xs font-mono font-medium">
        {timeStr}
      </span>
    </Link>
  );
}
