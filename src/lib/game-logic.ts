import type { TechTree, TechNode, Era } from "@/data/types";

export const TRANSITION_PREFIX = "__transition__";

export function isTransitionNode(nodeId: string): boolean {
  return nodeId.startsWith(TRANSITION_PREFIX);
}

export function makeTransitionNode(era: Era): TechNode {
  return {
    id: `${TRANSITION_PREFIX}${era.id}`,
    name: `迈向新时代`,
    description: `你已经掌握了${era.name}的所有知识。是时候翻开新的篇章了。`,
    pomodorosRequired: 1,
    prerequisites: [],
    category: "technology",
    color: "#f59e0b",
  };
}

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

export function findNodeById(
  tree: TechTree,
  nodeId: string
): { node: TechNode; era: Era } | null {
  if (isTransitionNode(nodeId)) {
    const eraId = nodeId.slice(TRANSITION_PREFIX.length);
    const era = tree.eras.find((e) => e.id === eraId);
    if (era) return { node: makeTransitionNode(era), era };
    return null;
  }
  for (const era of tree.eras) {
    const node = era.nodes.find((n) => n.id === nodeId);
    if (node) return { node, era };
  }
  return null;
}
