import type { UserProgress, NarrativeRecords } from "@/data/types";

const PROGRESS_KEY = "civilpomo-progress";
const NARRATIVES_KEY = "civilpomo-narratives";

const defaultProgress: UserProgress = {
  currentNodeId: null,
  completedPomodoros: 0,
  completedNodes: [],
  currentEraIndex: 0,
  totalPomodoros: 0,
  timerSettings: { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 },
};

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadNarratives(): NarrativeRecords {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(NARRATIVES_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function addNarrative(nodeId: string, narrative: string): void {
  const records = loadNarratives();
  records[nodeId] = [...(records[nodeId] ?? []), narrative];
  localStorage.setItem(NARRATIVES_KEY, JSON.stringify(records));
}

export function clearAllData(): void {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(NARRATIVES_KEY);
}
