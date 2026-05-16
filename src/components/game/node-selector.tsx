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
  const { tree, currentEraIndex, currentNodeId } =
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
