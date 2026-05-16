import { describe, it, expect } from "vitest";
import { isNodeUnlocked, isEraComplete, getAvailableNodes, findNodeById } from "@/lib/game-logic";
import type { TechTree } from "@/data/types";
import techTree from "@/data/tech-tree.json";

const mockTree: TechTree = {
  id: "test",
  name: "Test Tree",
  eras: [
    {
      id: "era1",
      name: "Era 1",
      nodes: [
        { id: "a", name: "A", description: "Node A", pomodorosRequired: 2, prerequisites: [], category: "technology", color: "#ef4444" },
        { id: "b", name: "B", description: "Node B", pomodorosRequired: 3, prerequisites: ["a"], category: "technology", color: "#3b82f6" },
        { id: "c", name: "C", description: "Node C", pomodorosRequired: 1, prerequisites: ["a"], category: "humanities", color: "#22c55e" },
      ],
    },
    {
      id: "era2",
      name: "Era 2",
      nodes: [
        { id: "d", name: "D", description: "Node D", pomodorosRequired: 2, prerequisites: ["b", "c"], category: "technology", color: "#a855f7" },
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

describe("getAvailableNodes", () => {
  it("returns nodes with no prerequisites in first era", () => {
    expect(getAvailableNodes(mockTree, 0, [])).toEqual(["a"]);
  });

  it("returns unlocked nodes after completing prerequisites", () => {
    expect(getAvailableNodes(mockTree, 0, ["a"])).toEqual(["b", "c"]);
  });

  it("excludes already completed nodes", () => {
    expect(getAvailableNodes(mockTree, 0, ["a", "b"])).toEqual(["c"]);
  });

  it("returns empty when all era nodes completed", () => {
    expect(getAvailableNodes(mockTree, 0, ["a", "b", "c"])).toEqual([]);
  });
});

describe("findNodeById", () => {
  it("finds node and its era", () => {
    const result = findNodeById(mockTree, "b");
    expect(result?.node.id).toBe("b");
    expect(result?.era.id).toBe("era1");
  });

  it("returns null for unknown node", () => {
    expect(findNodeById(mockTree, "z")).toBeNull();
  });
});

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
        expect(["technology", "humanities", "civic"]).toContain(node.category);
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

  it("first era has no prerequisites", () => {
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
