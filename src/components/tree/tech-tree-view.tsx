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
