# CivilPomo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Pomodoro timer game where completing pomodoros progresses through a Civilization-style tech tree with AI-generated immersive narratives.

**Architecture:** Next.js App Router with Zustand for state management, localStorage for persistence, and a Next.js API route proxying Claude API calls for narrative generation. Tech tree is a static JSON preset; user progress lives in localStorage.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Vitest, Claude API

---

## File Structure

```
CivilPomo/
├── .env.local                              # AI config (base_url, api_key, model_name)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── vitest.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                      # Root layout + navigation
│   │   ├── page.tsx                        # Redirect / → /timer
│   │   ├── timer/
│   │   │   └── page.tsx                    # Main timer page
│   │   ├── tree/
│   │   │   └── page.tsx                    # Tech tree visualization
│   │   ├── chronicle/
│   │   │   └── page.tsx                    # Narrative history
│   │   ├── settings/
│   │   │   └── page.tsx                    # Timer configuration
│   │   └── api/
│   │       └── narrative/
│   │           └── route.ts                # Claude API proxy
│   ├── components/
│   │   ├── timer/
│   │   │   └── pomodoro-timer.tsx          # Timer display + controls
│   │   ├── game/
│   │   │   ├── node-selector.tsx           # Node picker
│   │   │   ├── node-progress.tsx           # Current node progress bar
│   │   │   └── narrative-modal.tsx         # Post-pomodoro narrative popup
│   │   ├── tree/
│   │   │   └── tech-tree-view.tsx          # Tree visualization component
│   │   └── layout/
│   │       └── nav-bar.tsx                 # Navigation bar
│   ├── data/
│   │   ├── types.ts                        # All TypeScript interfaces
│   │   └── tech-tree.json                  # Preset civilization tech tree
│   ├── stores/
│   │   ├── game-store.ts                   # Game state (nodes, progress, eras)
│   │   └── timer-store.ts                  # Timer state (countdown, phase)
│   ├── lib/
│   │   ├── storage.ts                      # localStorage read/write helpers
│   │   └── game-logic.ts                   # Pure functions: prerequisites, era checks
│   └── __tests__/
│       ├── game-logic.test.ts              # Pure function tests
│       ├── storage.test.ts                 # Storage round-trip tests
│       ├── game-store.test.ts              # Game store integration tests
│       └── timer-store.test.ts             # Timer store tests
└── docs/
    └── superpowers/
        └── specs/
            └── 2026-05-16-civilpomo-design.md
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `vitest.config.ts`, `.env.local`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd D:/files/code/FullStack/CivilPomo
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Select: TypeScript YES, ESLint YES, Tailwind YES, `src/` directory YES, App Router YES, import alias `@/*`.

- [ ] **Step 2: Install dependencies**

```bash
npm install zustand
npm install -D vitest @vitest/jsdom @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

Select: Style DEFAULT, Base color NEUTRAL, CSS variables YES.

Then add needed components:

```bash
npx shadcn@latest add button dialog progress card select label input
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `src/__tests__/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 5: Create `.env.local`**

```env
AI_BASE_URL=
AI_API_KEY=
AI_MODEL_NAME=
```

(User will fill in later.)

- [ ] **Step 6: Verify setup**

```bash
npm run build
npm test
```

Expected: Build succeeds, tests pass (no tests yet, but no errors).

- [ ] **Step 7: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js project with Tailwind, shadcn/ui, Zustand, Vitest"
```

---

## Task 2: Type Definitions

**Files:**
- Create: `src/data/types.ts`

- [ ] **Step 1: Write tests for type guards**

Create `src/__tests__/types.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { isNodeUnlocked, isEraComplete } from "@/lib/game-logic";
import type { TechTree, UserProgress } from "@/data/types";

const mockTree: TechTree = {
  id: "test",
  name: "Test Tree",
  eras: [
    {
      id: "era1",
      name: "Era 1",
      nodes: [
        { id: "a", name: "A", description: "Node A", pomodorosRequired: 2, prerequisites: [], category: "technology" },
        { id: "b", name: "B", description: "Node B", pomodorosRequired: 3, prerequisites: ["a"], category: "technology" },
        { id: "c", name: "C", description: "Node C", pomodorosRequired: 1, prerequisites: ["a"], category: "humanities" },
      ],
    },
    {
      id: "era2",
      name: "Era 2",
      nodes: [
        { id: "d", name: "D", description: "Node D", pomodorosRequired: 2, prerequisites: ["b", "c"], category: "technology" },
      ],
    },
  ],
};

describe("isNodeUnlocked", () => {
  it("returns true for node with no prerequisites", () => {
    expect(isNodeUnlocked(mockTree, "a", [])).toBe(true);
  });

  it("returns false when prerequisite not met", () => {
    expect(isNodeUnlocked(mockTree, "b", [])).toBe(false);
  });

  it("returns true when all prerequisites met", () => {
    expect(isNodeUnlocked(mockTree, "b", ["a"])).toBe(true);
  });

  it("returns false when only some prerequisites met", () => {
    expect(isNodeUnlocked(mockTree, "d", ["b"])).toBe(false);
  });

  it("returns true when all prerequisites met (multi-dep)", () => {
    expect(isNodeUnlocked(mockTree, "d", ["b", "c"])).toBe(true);
  });
});

describe("isEraComplete", () => {
  it("returns false when no nodes completed", () => {
    expect(isEraComplete(mockTree, 0, [])).toBe(false);
  });

  it("returns false when only some nodes completed", () => {
    expect(isEraComplete(mockTree, 0, ["a"])).toBe(false);
  });

  it("returns true when all nodes in era completed", () => {
    expect(isEraComplete(mockTree, 0, ["a", "b", "c"])).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```

Expected: FAIL — modules not found.

- [ ] **Step 3: Create type definitions**

Create `src/data/types.ts`:

```typescript
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
  category: "technology" | "humanities";
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
```

- [ ] **Step 4: Create game logic stubs**

Create `src/lib/game-logic.ts`:

```typescript
import type { TechTree } from "@/data/types";

export function isNodeUnlocked(
  tree: TechTree,
  nodeId: string,
  completedNodes: string[]
): boolean {
  const node = tree.eras
    .flatMap((era) => era.nodes)
    .find((n) => n.id === nodeId);
  if (!node) return false;
  return node.prerequisites.every((p) => completedNodes.includes(p));
}

export function isEraComplete(
  tree: TechTree,
  eraIndex: number,
  completedNodes: string[]
): boolean {
  const era = tree.eras[eraIndex];
  if (!era) return false;
  return era.nodes.every((n) => completedNodes.includes(n.id));
}

export function getAvailableNodes(
  tree: TechTree,
  eraIndex: number,
  completedNodes: string[]
): string[] {
  const era = tree.eras[eraIndex];
  if (!era) return [];
  return era.nodes
    .filter(
      (n) =>
        !completedNodes.includes(n.id) &&
        n.prerequisites.every((p) => completedNodes.includes(p))
    )
    .map((n) => n.id);
}

export function findNodeById(tree: TechTree, nodeId: string) {
  for (const era of tree.eras) {
    const node = era.nodes.find((n) => n.id === nodeId);
    if (node) return { node, era };
  }
  return null;
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm test
```

Expected: All 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/types.ts src/lib/game-logic.ts src/__tests__/types.test.ts
git commit -m "feat: add type definitions and core game logic with tests"
```

---

## Task 3: Preset Tech Tree Data

**Files:**
- Create: `src/data/tech-tree.json`

- [ ] **Step 1: Create the preset civilization tech tree**

Create `src/data/tech-tree.json`:

```json
{
  "id": "civ-classic",
  "name": "文明科技树",
  "eras": [
    {
      "id": "ancient",
      "name": "原始时代",
      "nodes": [
        {
          "id": "fire",
          "name": "火",
          "description": "你的族群学会了控制火焰。夜晚不再寒冷，生肉变成了熟食。",
          "pomodorosRequired": 2,
          "prerequisites": [],
          "category": "technology"
        },
        {
          "id": "language",
          "name": "语言",
          "description": "族群成员开始用声音和手势传递复杂信息。狩猎的计划能被描述，经验能被分享。",
          "pomodorosRequired": 3,
          "prerequisites": [],
          "category": "humanities"
        },
        {
          "id": "stone-tools",
          "name": "石器",
          "description": "你学会了敲打石头，制造出锋利的边缘。切割兽皮和刮削木头变得容易了。",
          "pomodorosRequired": 2,
          "prerequisites": [],
          "category": "technology"
        }
      ]
    },
    {
      "id": "neolithic",
      "name": "新石器时代",
      "nodes": [
        {
          "id": "agriculture",
          "name": "农业",
          "description": "你注意到掉落的种子会长出新的植物。你开始有意识地播种，等待收获。",
          "pomodorosRequired": 4,
          "prerequisites": ["fire", "stone-tools"],
          "category": "technology"
        },
        {
          "id": "pottery",
          "name": "陶器",
          "description": "湿泥在火中变硬。你捏出了第一个容器，可以盛水和储存粮食了。",
          "pomodorosRequired": 3,
          "prerequisites": ["fire"],
          "category": "technology"
        },
        {
          "id": "settlement",
          "name": "定居",
          "description": "族群不再四处迁徙。你和族人搭建了固定的住所，一个村落正在成形。",
          "pomodorosRequired": 3,
          "prerequisites": ["agriculture", "language"],
          "category": "humanities"
        }
      ]
    },
    {
      "id": "bronze",
      "name": "青铜时代",
      "nodes": [
        {
          "id": "wheel",
          "name": "轮子",
          "description": "一截圆木从坡上滚下去，你盯着它看了很久。你开始尝试把圆形的木片装到架子下面。",
          "pomodorosRequired": 3,
          "prerequisites": ["stone-tools"],
          "category": "technology"
        },
        {
          "id": "writing",
          "name": "文字",
          "description": "你开始在泥板上刻画符号来记录粮食的数量。符号越来越多，含义越来越丰富。",
          "pomodorosRequired": 4,
          "prerequisites": ["language", "pottery"],
          "category": "humanities"
        },
        {
          "id": "bronze-smelting",
          "name": "青铜冶炼",
          "description": "你发现把两种不同的石头放在一起加热，会流出一种闪亮的液体。冷却后，它比任何石头都坚硬。",
          "pomodorosRequired": 4,
          "prerequisites": ["pottery", "fire"],
          "category": "technology"
        },
        {
          "id": "trade",
          "name": "贸易",
          "description": "邻近的族群带着你没有的东西来了。你用多余的粮食换到了漂亮的贝壳和坚硬的黑曜石。",
          "pomodorosRequired": 3,
          "prerequisites": ["settlement", "wheel"],
          "category": "humanities"
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid and test loading**

Add to `src/__tests__/types.test.ts`:

```typescript
import techTree from "@/data/tech-tree.json";
import type { TechTree } from "@/data/types";

describe("preset tech tree", () => {
  it("conforms to TechTree structure", () => {
    const tree = techTree as TechTree;
    expect(tree.id).toBe("civ-classic");
    expect(tree.eras.length).toBeGreaterThan(0);
    tree.eras.forEach((era) => {
      expect(era.nodes.length).toBeGreaterThan(0);
      era.nodes.forEach((node) => {
        expect(node.id).toBeTruthy();
        expect(node.name).toBeTruthy();
        expect(node.description).toBeTruthy();
        expect(node.pomodorosRequired).toBeGreaterThan(0);
        expect(["technology", "humanities"]).toContain(node.category);
      });
    });
  });

  it("has valid prerequisite references", () => {
    const tree = techTree as TechTree;
    const allNodeIds = new Set(
      tree.eras.flatMap((era) => era.nodes.map((n) => n.id))
    );
    tree.eras.forEach((era) => {
      era.nodes.forEach((node) => {
        node.prerequisites.forEach((prereqId) => {
          expect(allNodeIds.has(prereqId)).toBe(true);
        });
      });
    });
  });

  it("first era has no prerequisites (all nodes have empty prerequisites)", () => {
    const tree = techTree as TechTree;
    tree.eras[0].nodes.forEach((node) => {
      expect(node.prerequisites).toEqual([]);
    });
  });

  it("later eras have prerequisite dependencies", () => {
    const tree = techTree as TechTree;
    const laterNodes = tree.eras.slice(1).flatMap((era) => era.nodes);
    const hasPrereqs = laterNodes.some((n) => n.prerequisites.length > 0);
    expect(hasPrereqs).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/data/tech-tree.json src/__tests__/types.test.ts
git commit -m "feat: add preset civilization tech tree (3 eras, 10 nodes)"
```

---

## Task 4: localStorage Utilities

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/__tests__/storage.test.ts`

- [ ] **Step 1: Write storage tests**

Create `src/__tests__/storage.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test src/__tests__/storage.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement storage utilities**

Create `src/lib/storage.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test src/__tests__/storage.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/__tests__/storage.test.ts
git commit -m "feat: add localStorage utilities with tests"
```

---

## Task 5: Game Store (Zustand)

**Files:**
- Create: `src/stores/game-store.ts`
- Create: `src/__tests__/game-store.test.ts`

- [ ] **Step 1: Write game store tests**

Create `src/__tests__/game-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/stores/game-store";

// Reset store between tests
beforeEach(() => {
  localStorage.clear();
  useGameStore.getState().resetGame();
});

describe("gameStore", () => {
  it("starts with no current node and era 0", () => {
    const state = useGameStore.getState();
    expect(state.currentNodeId).toBeNull();
    expect(state.currentEraIndex).toBe(0);
    expect(state.completedNodes).toEqual([]);
  });

  it("selects a node", () => {
    useGameStore.getState().selectNode("fire");
    expect(useGameStore.getState().currentNodeId).toBe("fire");
    expect(useGameStore.getState().completedPomodoros).toBe(0);
  });

  it("completes a pomodoro and advances progress", () => {
    useGameStore.getState().selectNode("fire");
    useGameStore.getState().completePomodoro();
    const state = useGameStore.getState();
    expect(state.completedPomodoros).toBe(1);
    expect(state.totalPomodoros).toBe(1);
  });

  it("marks node complete when all pomodoros done", () => {
    useGameStore.getState().selectNode("fire"); // fire requires 2 pomodoros
    useGameStore.getState().completePomodoro();
    useGameStore.getState().completePomodoro();
    const state = useGameStore.getState();
    expect(state.completedNodes).toContain("fire");
    expect(state.currentNodeId).toBeNull();
  });

  it("advances era when all nodes in current era are complete", () => {
    const store = useGameStore.getState();
    // Complete all ancient era nodes: fire(2), language(3), stone-tools(2)
    ["fire", "language", "stone-tools"].forEach((nodeId) => {
      store.selectNode(nodeId);
      // Find pomodorosRequired from tree
      const node = store.tree.eras[0].nodes.find((n) => n.id === nodeId)!;
      for (let i = 0; i < node.pomodorosRequired; i++) {
        store.completePomodoro();
      }
    });
    expect(useGameStore.getState().currentEraIndex).toBe(1);
  });

  it("preserves progress when switching nodes", () => {
    useGameStore.getState().selectNode("fire");
    useGameStore.getState().completePomodoro();
    useGameStore.getState().selectNode("language");
    expect(useGameStore.getState().completedPomodoros).toBe(0); // reset for new node
    // Switch back to fire
    useGameStore.getState().selectNode("fire");
    expect(useGameStore.getState().completedPomodoros).toBe(1); // preserved
  });

  it("can switch to another available node", () => {
    useGameStore.getState().selectNode("fire");
    useGameStore.getState().completePomodoro();
    // Switch to language (also available in era 0)
    useGameStore.getState().selectNode("language");
    expect(useGameStore.getState().currentNodeId).toBe("language");
    // Go back to fire, progress preserved
    useGameStore.getState().selectNode("fire");
    expect(useGameStore.getState().completedPomodoros).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test src/__tests__/game-store.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement game store**

Create `src/stores/game-store.ts`:

```typescript
import { create } from "zustand";
import type { TechTree, UserProgress } from "@/data/types";
import { isEraComplete, findNodeById } from "@/lib/game-logic";
import { loadProgress, saveProgress } from "@/lib/storage";
import techTreeData from "@/data/tech-tree.json";

const tree = techTreeData as TechTree;

// Track per-node progress separately (not in localStorage, rebuilt from completedNodes)
// For in-progress nodes, we keep a map of nodeId -> completedPomodoros
const nodeProgressMap = new Map<string, number>();

interface GameState {
  tree: TechTree;
  currentNodeId: string | null;
  completedPomodoros: number; // for current node
  completedNodes: string[];
  currentEraIndex: number;
  totalPomodoros: number;

  selectNode: (nodeId: string) => void;
  completePomodoro: () => void;
  resetGame: () => void;
  getAvailableNodeIds: () => string[];
}

export const useGameStore = create<GameState>((set, get) => {
  const saved = loadProgress();

  return {
    tree,
    currentNodeId: saved.currentNodeId,
    completedPomodoros: saved.completedPomodoros,
    completedNodes: saved.completedNodes,
    currentEraIndex: saved.currentEraIndex,
    totalPomodoros: saved.totalPomodoros,

    selectNode: (nodeId: string) => {
      const state = get();
      // Save current node progress before switching
      if (state.currentNodeId) {
        nodeProgressMap.set(state.currentNodeId, state.completedPomodoros);
      }
      const savedPomodoros = nodeProgressMap.get(nodeId) ?? 0;
      set({ currentNodeId: nodeId, completedPomodoros: savedPomodoros });
    },

    completePomodoro: () => {
      const state = get();
      if (!state.currentNodeId) return;

      const newCompleted = state.completedPomodoros + 1;
      const newTotal = state.totalPomodoros + 1;
      const nodeInfo = findNodeById(tree, state.currentNodeId);

      if (!nodeInfo) return;

      const nodeComplete = newCompleted >= nodeInfo.node.pomodorosRequired;

      let newCompletedNodes = [...state.completedNodes];
      let newCurrentNodeId = state.currentNodeId;
      let newEraIndex = state.currentEraIndex;

      if (nodeComplete) {
        newCompletedNodes.push(state.currentNodeId);
        newCurrentNodeId = null;
        nodeProgressMap.delete(state.currentNodeId);

        // Check if era is complete
        if (isEraComplete(tree, newEraIndex, newCompletedNodes)) {
          if (newEraIndex < tree.eras.length - 1) {
            newEraIndex += 1;
          }
        }
      }

      const newState = {
        completedPomodoros: nodeComplete ? 0 : newCompleted,
        completedNodes: newCompletedNodes,
        currentNodeId: newCurrentNodeId,
        currentEraIndex: newEraIndex,
        totalPomodoros: newTotal,
      };

      set(newState);

      // Persist
      const fullState = get();
      saveProgress({
        currentNodeId: fullState.currentNodeId,
        completedPomodoros: fullState.completedPomodoros,
        completedNodes: fullState.completedNodes,
        currentEraIndex: fullState.currentEraIndex,
        totalPomodoros: fullState.totalPomodoros,
        timerSettings: loadProgress().timerSettings,
      });
    },

    resetGame: () => {
      nodeProgressMap.clear();
      const defaultProgress: UserProgress = {
        currentNodeId: null,
        completedPomodoros: 0,
        completedNodes: [],
        currentEraIndex: 0,
        totalPomodoros: 0,
        timerSettings: { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15 },
      };
      saveProgress(defaultProgress);
      set({
        currentNodeId: null,
        completedPomodoros: 0,
        completedNodes: [],
        currentEraIndex: 0,
        totalPomodoros: 0,
      });
    },

    getAvailableNodeIds: () => {
      const state = get();
      const era = tree.eras[state.currentEraIndex];
      if (!era) return [];
      return era.nodes
        .filter(
          (n) =>
            !state.completedNodes.includes(n.id) &&
            n.prerequisites.every((p) => state.completedNodes.includes(p))
        )
        .map((n) => n.id);
    },
  };
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test src/__tests__/game-store.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stores/game-store.ts src/__tests__/game-store.test.ts
git commit -m "feat: add game store with node selection, progress, era advancement"
```

---

## Task 6: Timer Store (Zustand)

**Files:**
- Create: `src/stores/timer-store.ts`
- Create: `src/__tests__/timer-store.test.ts`

- [ ] **Step 1: Write timer store tests**

Create `src/__tests__/timer-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useTimerStore } from "@/stores/timer-store";

beforeEach(() => {
  useTimerStore.getState().reset();
});

describe("timerStore", () => {
  it("starts in idle phase", () => {
    const state = useTimerStore.getState();
    expect(state.phase).toBe("idle");
    expect(state.timerType).toBe("work");
  });

  it("starts timer and sets phase to running", () => {
    useTimerStore.getState().start();
    expect(useTimerStore.getState().phase).toBe("running");
  });

  it("pauses and resumes timer", () => {
    useTimerStore.getState().start();
    useTimerStore.getState().pause();
    expect(useTimerStore.getState().phase).toBe("paused");
    useTimerStore.getState().resume();
    expect(useTimerStore.getState().phase).toBe("running");
  });

  it("transitions to break after work completes", () => {
    const store = useTimerStore.getState();
    store.setWorkMinutes(0.01); // ~0.6 seconds for testing
    store.start();
    store.tick(); // simulate time passing
    // After enough ticks, should transition
    // We test the completeWork method directly
    store.completeWork(1); // pomodorosCompleted = 1
    expect(useTimerStore.getState().phase).toBe("break");
    expect(useTimerStore.getState().timerType).toBe("shortBreak");
  });

  it("uses long break after 4 pomodoros", () => {
    const store = useTimerStore.getState();
    store.completeWork(4);
    expect(useTimerStore.getState().timerType).toBe("longBreak");
  });

  it("resets to idle", () => {
    useTimerStore.getState().start();
    useTimerStore.getState().reset();
    expect(useTimerStore.getState().phase).toBe("idle");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test src/__tests__/timer-store.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement timer store**

Create `src/stores/timer-store.ts`:

```typescript
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
        // Work period complete — caller should invoke completeWork
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

    setWorkMinutes: (min: number) => set({ workMinutes: min }),
    setShortBreakMinutes: (min: number) => set({ shortBreakMinutes: min }),
    setLongBreakMinutes: (min: number) => set({ longBreakMinutes: min }),
  };
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test src/__tests__/timer-store.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/stores/timer-store.ts src/__tests__/timer-store.test.ts
git commit -m "feat: add timer store with work/break phases and configurable durations"
```

---

## Task 7: API Route — Narrative Generation

**Files:**
- Create: `src/app/api/narrative/route.ts`

- [ ] **Step 1: Create the API route**

Create `src/app/api/narrative/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

interface NarrativeRequest {
  nodeName: string;
  nodeDescription: string;
  currentPomodoro: number;
  totalPomodoros: number;
  prerequisiteDescriptions: string[];
}

export async function POST(request: NextRequest) {
  const body: NarrativeRequest = await request.json();

  const baseUrl = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const modelName = process.env.AI_MODEL_NAME;

  if (!baseUrl || !apiKey || !modelName) {
    return NextResponse.json(
      { error: "AI configuration missing" },
      { status: 500 }
    );
  }

  const prerequisiteContext =
    body.prerequisiteDescriptions.length > 0
      ? `\n已完成的前置技术：${body.prerequisiteDescriptions.join("；")}`
      : "";

  const prompt = `你是一个沉浸式叙事生成器。

当前节点：${body.nodeName}
节点描述：${body.nodeDescription}
进度：第 ${body.currentPomodoro} / 共 ${body.totalPomodoros} 个番茄${prerequisiteContext}

请用第二人称（"你"）描述当前正在发生的事情。
要求：
- 描述具体发生的事件或场景，不要历史总结
- 不要出现"萌芽""发展""进步"这类抽象词汇
- 画面感强，像在描述一个场景
- 50-100 字
- 只输出叙事文本，不要其他内容`;

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `AI API error: ${errorText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const narrative = data.choices?.[0]?.message?.content?.trim();

    if (!narrative) {
      return NextResponse.json(
        { error: "Empty response from AI" },
        { status: 502 }
      );
    }

    return NextResponse.json({ narrative });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to call AI: ${error}` },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/narrative/route.ts
git commit -m "feat: add narrative generation API route"
```

---

## Task 8: Navigation & Layout

**Files:**
- Create: `src/components/layout/nav-bar.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create navigation bar component**

Create `src/components/layout/nav-bar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/timer", label: "番茄钟" },
  { href: "/tree", label: "科技树" },
  { href: "/chronicle", label: "编年史" },
  { href: "/settings", label: "设置" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="border-b px-4 py-2">
      <div className="mx-auto flex max-w-4xl items-center gap-6">
        <Link href="/timer" className="text-lg font-bold">
          CivilPomo
        </Link>
        <div className="flex gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm transition-colors hover:text-foreground",
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Update root layout**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/layout/nav-bar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CivilPomo",
  description: "番茄钟 × 文明科技树",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={geist.className}>
        <NavBar />
        <main className="mx-auto max-w-4xl p-4">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create redirect page**

Replace `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/timer");
}
```

- [ ] **Step 4: Create placeholder pages**

Create `src/app/tree/page.tsx`:

```tsx
export default function TreePage() {
  return <div>科技树 — 待实现</div>;
}
```

Create `src/app/chronicle/page.tsx`:

```tsx
export default function ChroniclePage() {
  return <div>编年史 — 待实现</div>;
}
```

Create `src/app/settings/page.tsx`:

```tsx
export default function SettingsPage() {
  return <div>设置 — 待实现</div>;
}
```

Create `src/app/timer/page.tsx`:

```tsx
export default function TimerPage() {
  return <div>番茄钟 — 待实现</div>;
}
```

- [ ] **Step 5: Verify build and dev server**

```bash
npm run build
npm run dev
```

Expected: Build succeeds, dev server starts, pages load with nav.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/nav-bar.tsx src/app/layout.tsx src/app/page.tsx src/app/timer/page.tsx src/app/tree/page.tsx src/app/chronicle/page.tsx src/app/settings/page.tsx
git commit -m "feat: add navigation layout and placeholder pages"
```

---

## Task 9: Pomodoro Timer Component

**Files:**
- Create: `src/components/timer/pomodoro-timer.tsx`
- Modify: `src/app/timer/page.tsx`

- [ ] **Step 1: Create the timer component**

Create `src/components/timer/pomodoro-timer.tsx`:

```tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTimerStore } from "@/stores/timer-store";
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
  onWorkComplete?: () => void;
}

export function PomodoroTimer({ onWorkComplete }: PomodoroTimerProps) {
  const {
    phase,
    timerType,
    secondsRemaining,
    start,
    pause,
    resume,
    tick,
    completeWork,
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
    if (phase === "running") {
      intervalRef.current = setInterval(() => {
        const state = useTimerStore.getState();
        state.tick();
        // Check if timer hit zero
        if (useTimerStore.getState().secondsRemaining <= 0) {
          clearTimer();
          if (state.timerType === "work") {
            onWorkCompleteRef.current?.();
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

  const handleStart = () => start();
  const handlePause = () => pause();
  const handleResume = () => resume();

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
            <Button onClick={handleStart} size="lg">
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
              onClick={() => {
                completeBreak();
              }}
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
```

- [ ] **Step 2: Update timer page**

Replace `src/app/timer/page.tsx`:

```tsx
"use client";

import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { useGameStore } from "@/stores/game-store";
import { useState, useCallback } from "react";
import { NarrativeModal } from "@/components/game/narrative-modal";
import { NodeSelector } from "@/components/game/node-selector";
import { NodeProgress } from "@/components/game/node-progress";

export default function TimerPage() {
  const { currentNodeId, completedPomodoros, tree, currentEraIndex } =
    useGameStore();
  const [showNarrative, setShowNarrative] = useState(false);
  const [narrativeText, setNarrativeText] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  const currentNode = currentNodeId
    ? tree.eras.flatMap((e) => e.nodes).find((n) => n.id === currentNodeId)
    : null;

  const currentEra = tree.eras[currentEraIndex];

  const handleWorkComplete = useCallback(async () => {
    if (!currentNode) return;
    setNarrativeLoading(true);
    setShowNarrative(true);

    const progress = useGameStore.getState().completedPomodoros + 1;

    // Get prerequisite descriptions
    const allNodes = tree.eras.flatMap((e) => e.nodes);
    const prereqDescriptions = currentNode.prerequisites
      .map((id) => allNodes.find((n) => n.id === id)?.description ?? "")
      .filter(Boolean);

    try {
      const res = await fetch("/api/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeName: currentNode.name,
          nodeDescription: currentNode.description,
          currentPomodoro: progress,
          totalPomodoros: currentNode.pomodorosRequired,
          prerequisiteDescriptions: prereqDescriptions,
        }),
      });
      const data = await res.json();
      setNarrativeText(data.narrative ?? "（叙事生成失败）");
    } catch {
      setNarrativeText("（网络错误，无法生成叙事）");
    } finally {
      setNarrativeLoading(false);
    }
  }, [currentNode, tree]);

  const handleNarrativeClose = () => {
    setShowNarrative(false);
    // Complete the pomodoro in game state after narrative is dismissed
    useGameStore.getState().completePomodoro();
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{currentEra?.name}</p>
        {currentNode ? (
          <div className="mt-2">
            <p className="text-lg font-medium">
              正在研究：{currentNode.name}
            </p>
            <NodeProgress
              current={completedPomodoros}
              total={currentNode.pomodorosRequired}
            />
          </div>
        ) : (
          <p className="mt-2 text-lg text-muted-foreground">
            请选择一个节点开始研究
          </p>
        )}
      </div>

      <PomodoroTimer onWorkComplete={handleWorkComplete} />

      <NodeSelector />

      <NarrativeModal
        open={showNarrative}
        narrative={narrativeText}
        loading={narrativeLoading}
        onClose={handleNarrativeClose}
      />
    </div>
  );
}
```

- [ ] **Step 3: Create stub components**

Create `src/components/game/narrative-modal.tsx`:

```tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NarrativeModalProps {
  open: boolean;
  narrative: string;
  loading: boolean;
  onClose: () => void;
}

export function NarrativeModal({
  open,
  narrative,
  loading,
  onClose,
}: NarrativeModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>进展</DialogTitle>
          <DialogDescription asChild>
            {loading ? (
              <p className="animate-pulse text-muted-foreground">
                正在生成叙事...
              </p>
            ) : (
              <p className="text-base leading-relaxed text-foreground">
                {narrative}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        {!loading && (
          <Button onClick={onClose} className="mt-4 w-full">
            继续
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

Create `src/components/game/node-progress.tsx`:

```tsx
import { Progress } from "@/components/ui/progress";

interface NodeProgressProps {
  current: number;
  total: number;
}

export function NodeProgress({ current, total }: NodeProgressProps) {
  const percent = (current / total) * 100;
  return (
    <div className="mt-2 flex items-center gap-2">
      <Progress value={percent} className="h-2 w-48" />
      <span className="text-sm text-muted-foreground">
        {current}/{total}
      </span>
    </div>
  );
}
```

Create `src/components/game/node-selector.tsx`:

```tsx
"use client";

import { useGameStore } from "@/stores/game-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NodeSelector() {
  const { tree, currentEraIndex, currentNodeId, completedNodes } =
    useGameStore();
  const availableIds = useGameStore.getState().getAvailableNodeIds();

  const era = tree.eras[currentEraIndex];
  if (!era) return null;

  const availableNodes = era.nodes.filter((n) => availableIds.includes(n.id));

  if (availableNodes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        当前时代所有节点已完成
      </p>
    );
  }

  return (
    <div className="w-full max-w-xs">
      <Select
        value={currentNodeId ?? undefined}
        onValueChange={(id) => useGameStore.getState().selectNode(id)}
      >
        <SelectTrigger>
          <SelectValue placeholder="选择研究节点" />
        </SelectTrigger>
        <SelectContent>
          {availableNodes.map((node) => (
            <SelectItem key={node.id} value={node.id}>
              {node.name}{" "}
              <span className="ml-1 text-xs text-muted-foreground">
                ({node.category === "technology" ? "科技" : "人文"})
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: Build succeeds. Dev server: timer page renders with node selector and timer.

- [ ] **Step 5: Commit**

```bash
git add src/components/timer/pomodoro-timer.tsx src/components/game/narrative-modal.tsx src/components/game/node-progress.tsx src/components/game/node-selector.tsx src/app/timer/page.tsx
git commit -m "feat: add timer page with pomodoro timer, node selector, and narrative modal"
```

---

## Task 10: Tech Tree Visualization Page

**Files:**
- Create: `src/components/tree/tech-tree-view.tsx`
- Modify: `src/app/tree/page.tsx`

- [ ] **Step 1: Create tech tree view component**

Create `src/components/tree/tech-tree-view.tsx`:

```tsx
"use client";

import { useGameStore } from "@/stores/game-store";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type NodeStatus = "completed" | "available" | "locked";

function getNodeStatus(
  nodeId: string,
  completedNodes: string[],
  availableIds: string[]
): NodeStatus {
  if (completedNodes.includes(nodeId)) return "completed";
  if (availableIds.includes(nodeId)) return "available";
  return "locked";
}

const statusStyles: Record<NodeStatus, string> = {
  completed: "border-green-500 bg-green-50 dark:bg-green-950",
  available: "border-blue-500 bg-blue-50 dark:bg-blue-950 cursor-pointer",
  locked: "border-gray-300 bg-gray-100 dark:bg-gray-800 opacity-50",
};

const statusLabels: Record<NodeStatus, string> = {
  completed: "已完成",
  available: "可研究",
  locked: "未解锁",
};

export function TechTreeView() {
  const { tree, completedNodes, currentEraIndex, currentNodeId } =
    useGameStore();
  const availableIds = useGameStore.getState().getAvailableNodeIds();

  return (
    <div className="space-y-8">
      {tree.eras.map((era, eraIndex) => {
        const isCurrentEra = eraIndex === currentEraIndex;
        const isPastEra = eraIndex < currentEraIndex;

        return (
          <div key={era.id}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold">{era.name}</h2>
              {isCurrentEra && <Badge variant="default">当前</Badge>}
              {isPastEra && <Badge variant="secondary">已完成</Badge>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {era.nodes.map((node) => {
                const status =
                  eraIndex < currentEraIndex
                    ? "completed"
                    : eraIndex > currentEraIndex
                      ? "locked"
                      : getNodeStatus(node.id, completedNodes, availableIds);
                const isActive = node.id === currentNodeId;

                return (
                  <Card
                    key={node.id}
                    className={cn(
                      "transition-all",
                      statusStyles[status],
                      isActive && "ring-2 ring-primary"
                    )}
                    onClick={() => {
                      if (status === "available") {
                        useGameStore.getState().selectNode(node.id);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium">{node.name}</h3>
                        <Badge
                          variant={
                            node.category === "technology"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {node.category === "technology" ? "科技" : "人文"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {node.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>{statusLabels[status]}</span>
                        <span>{node.pomodorosRequired} 个番茄</span>
                      </div>
                      {node.prerequisites.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          前置：{node.prerequisites.join(", ")}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Update tree page**

Replace `src/app/tree/page.tsx`:

```tsx
import { TechTreeView } from "@/components/tree/tech-tree-view";

export default function TreePage() {
  return (
    <div className="py-8">
      <h1 className="mb-6 text-2xl font-bold">科技树</h1>
      <TechTreeView />
    </div>
  );
}
```

- [ ] **Step 3: Verify build and dev server**

```bash
npm run build
```

Expected: Build succeeds. Tree page shows 3 eras with styled cards.

- [ ] **Step 4: Commit**

```bash
git add src/components/tree/tech-tree-view.tsx src/app/tree/page.tsx
git commit -m "feat: add tech tree visualization page"
```

---

## Task 11: Chronicle Page

**Files:**
- Modify: `src/app/chronicle/page.tsx`

- [ ] **Step 1: Implement chronicle page**

Replace `src/app/chronicle/page.tsx`:

```tsx
"use client";

import { loadNarratives } from "@/lib/storage";
import { useGameStore } from "@/stores/game-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import type { NarrativeRecords } from "@/data/types";

export default function ChroniclePage() {
  const { tree, completedNodes } = useGameStore();
  const [narratives, setNarratives] = useState<NarrativeRecords>({});

  useEffect(() => {
    setNarratives(loadNarratives());
  }, []);

  const completedNodesWithNarratives = tree.eras
    .flatMap((era) =>
      era.nodes
        .filter((n) => completedNodes.includes(n.id) && narratives[n.id]?.length)
        .map((node) => ({ ...node, eraName: era.name }))
    );

  if (completedNodesWithNarratives.length === 0) {
    return (
      <div className="py-8">
        <h1 className="mb-6 text-2xl font-bold">编年史</h1>
        <p className="text-muted-foreground">
          还没有完成任何节点。完成节点后，这里会记录你的文明历程。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-8">
      <h1 className="text-2xl font-bold">编年史</h1>
      {completedNodesWithNarratives.map((node) => (
        <Card key={node.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>{node.name}</span>
              <span className="text-sm font-normal text-muted-foreground">
                {node.eraName}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {narratives[node.id]?.map((text, i) => (
                <p key={i} className="leading-relaxed text-muted-foreground">
                  {text}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/chronicle/page.tsx
git commit -m "feat: add chronicle page for narrative history"
```

---

## Task 12: Settings Page

**Files:**
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: Implement settings page**

Replace `src/app/settings/page.tsx`:

```tsx
"use client";

import { loadProgress, saveProgress } from "@/lib/storage";
import { useTimerStore } from "@/stores/timer-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/stores/game-store";
import { useState, useEffect } from "react";
import type { TimerSettings } from "@/data/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<TimerSettings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const progress = loadProgress();
    setSettings(progress.timerSettings);
  }, []);

  const handleSave = () => {
    const progress = loadProgress();
    progress.timerSettings = settings;
    saveProgress(progress);
    // Update timer store
    useTimerStore.getState().setWorkMinutes(settings.workMinutes);
    useTimerStore.getState().setShortBreakMinutes(settings.shortBreakMinutes);
    useTimerStore.getState().setLongBreakMinutes(settings.longBreakMinutes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm("确定要重置所有进度吗？这将清除所有游戏数据。")) {
      useGameStore.getState().resetGame();
      useTimerStore.getState().reset();
      const progress = loadProgress();
      setSettings(progress.timerSettings);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <h1 className="text-2xl font-bold">设置</h1>

      <Card>
        <CardHeader>
          <CardTitle>番茄钟时长</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="work">工作时长（分钟）</Label>
            <Input
              id="work"
              type="number"
              min={1}
              max={120}
              value={settings.workMinutes}
              onChange={(e) =>
                setSettings({ ...settings, workMinutes: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <Label htmlFor="shortBreak">短休息（分钟）</Label>
            <Input
              id="shortBreak"
              type="number"
              min={1}
              max={30}
              value={settings.shortBreakMinutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  shortBreakMinutes: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="longBreak">长休息（分钟）</Label>
            <Input
              id="longBreak"
              type="number"
              min={1}
              max={60}
              value={settings.longBreakMinutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  longBreakMinutes: Number(e.target.value),
                })
              }
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            {saved ? "已保存" : "保存"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>危险操作</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleReset} className="w-full">
            重置所有进度
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/settings/page.tsx
git commit -m "feat: add settings page with timer configuration and game reset"
```

---

## Task 13: Integration — Save Narratives on Completion

**Files:**
- Modify: `src/app/timer/page.tsx`

- [ ] **Step 1: Wire up narrative saving**

The timer page already calls the narrative API and shows the modal. We need to save the narrative to localStorage when a node is completed. Update the `handleNarrativeClose` function in `src/app/timer/page.tsx`:

```tsx
import { addNarrative } from "@/lib/storage";
```

And in `handleNarrativeClose`:

```tsx
const handleNarrativeClose = () => {
  setShowNarrative(false);
  // Save narrative before completing pomodoro
  if (currentNodeId && narrativeText) {
    addNarrative(currentNodeId, narrativeText);
  }
  // Complete the pomodoro in game state after narrative is dismissed
  useGameStore.getState().completePomodoro();
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/timer/page.tsx
git commit -m "feat: save completed node narratives to localStorage"
```

---

## Task 14: Final Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests PASS.

- [ ] **Step 2: Build production bundle**

```bash
npm run build
```

Expected: No errors, no TypeScript errors.

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```

Test the full flow:
1. Open `/timer` — see empty timer with node selector
2. Select a node (e.g., "火") — timer shows current node
3. Set work time to 1 minute in `/settings` for quick testing
4. Start timer, wait for completion — narrative modal appears
5. Dismiss narrative — progress updates
6. Complete all pomodoros for the node — node marked complete
7. Check `/tree` — node shows as completed
8. Check `/chronicle` — narrative appears
9. Complete all era nodes — era advances

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: integration fixes from smoke testing"
```
