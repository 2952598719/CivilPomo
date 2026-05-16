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
