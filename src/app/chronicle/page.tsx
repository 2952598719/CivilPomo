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
