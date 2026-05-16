export interface TechTree {
  id: string;
  name: string;
  eras: Era[];
}

export interface Era {
  id: string;
  name: string;
  nodes: TechNode[];
}

export interface TechNode {
  id: string;
  name: string;
  description: string;
  pomodorosRequired: number;
  prerequisites: string[];
  category: "technology" | "humanities" | "civic";
  color: string;
}

export interface UserProgress {
  currentNodeId: string | null;
  completedPomodoros: number;
  completedNodes: string[];
  currentEraIndex: number;
  totalPomodoros: number;
  timerSettings: TimerSettings;
}

export interface TimerSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

export type NarrativeRecords = Record<string, string[]>;

export type TimerPhase = "idle" | "running" | "paused" | "break";
export type TimerType = "work" | "shortBreak" | "longBreak";
