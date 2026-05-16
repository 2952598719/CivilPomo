import { describe, it, expect, beforeEach } from "vitest";
import {
  loadProgress,
  saveProgress,
  loadNarratives,
  addNarrative,
  clearAllData,
} from "@/lib/storage";
import type { UserProgress } from "@/data/types";

const defaultProgress: UserProgress = {
  currentNodeId: null,
  completedPomodoros: 0,
  completedNodes: [],
  currentEraIndex: 0,
  totalPomodoros: 0,
  timerSettings: { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 },
};

describe("progress storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns default progress when nothing stored", () => {
    const result = loadProgress();
    expect(result).toEqual(defaultProgress);
  });

  it("round-trips progress through localStorage", () => {
    const progress: UserProgress = {
      ...defaultProgress,
      currentNodeId: "fire",
      completedPomodoros: 1,
      completedNodes: ["language"],
      totalPomodoros: 5,
    };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });

  it("persists timer settings changes", () => {
    const progress: UserProgress = {
      ...defaultProgress,
      timerSettings: { workMinutes: 5, shortBreakMinutes: 1, longBreakMinutes: 3 },
    };
    saveProgress(progress);
    expect(loadProgress().timerSettings.workMinutes).toBe(5);
  });
});

describe("narrative storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns empty object when nothing stored", () => {
    expect(loadNarratives()).toEqual({});
  });

  it("adds narratives for a node", () => {
    addNarrative("fire", "You strike flint against stone...");
    addNarrative("fire", "Sparks fly into the dry tinder...");
    const narratives = loadNarratives();
    expect(narratives["fire"]).toEqual([
      "You strike flint against stone...",
      "Sparks fly into the dry tinder...",
    ]);
  });

  it("keeps narratives for different nodes separate", () => {
    addNarrative("fire", "narrative 1");
    addNarrative("language", "narrative 2");
    const narratives = loadNarratives();
    expect(narratives["fire"]).toEqual(["narrative 1"]);
    expect(narratives["language"]).toEqual(["narrative 2"]);
  });
});

describe("clearAllData", () => {
  it("removes all stored data", () => {
    saveProgress({ ...defaultProgress, totalPomodoros: 10 });
    addNarrative("fire", "test");
    clearAllData();
    expect(loadProgress()).toEqual(defaultProgress);
    expect(loadNarratives()).toEqual({});
  });
});
