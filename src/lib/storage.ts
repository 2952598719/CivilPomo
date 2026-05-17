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

// --- Synchronous (localStorage) for Zustand store init ---

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
  syncProgressToServer(progress);
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
  syncNarrativesToServer(records);
}

export function clearAllData(): void {
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(NARRATIVES_KEY);
  syncProgressToServer(defaultProgress);
  syncNarrativesToServer({});
}

// --- Async (JSON file via API) for persistence ---

function syncProgressToServer(progress: UserProgress) {
  fetch("/api/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(progress),
  }).catch(() => {});
}

function syncNarrativesToServer(narratives: NarrativeRecords) {
  fetch("/api/narratives", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(narratives),
  }).catch(() => {});
}

export async function hydrateFromServer(): Promise<{
  progress: UserProgress;
  narratives: NarrativeRecords;
} | null> {
  try {
    const [progRes, narrRes] = await Promise.all([
      fetch("/api/progress"),
      fetch("/api/narratives"),
    ]);
    const serverProgress = await progRes.json();
    const serverNarratives = await narrRes.json();

    const hasProgress = serverProgress != null && Object.keys(serverProgress).length > 0;
    const hasNarratives = serverNarratives != null && Object.keys(serverNarratives).length > 0;

    if (hasProgress) {
      const merged = { ...defaultProgress, ...serverProgress };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
    }
    if (hasNarratives) {
      localStorage.setItem(NARRATIVES_KEY, JSON.stringify(serverNarratives));
    }

    if (hasProgress || hasNarratives) {
      return {
        progress: hasProgress ? { ...defaultProgress, ...serverProgress } : loadProgress(),
        narratives: hasNarratives ? serverNarratives : loadNarratives(),
      };
    }
    return null;
  } catch {
    return null;
  }
}
