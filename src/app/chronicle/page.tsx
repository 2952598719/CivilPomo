"use client";

import { loadNarratives } from "@/lib/storage";
import { useGameStore } from "@/stores/game-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState, useMemo } from "react";
import type { NarrativeRecords } from "@/data/types";

export default function ChroniclePage() {
  const { tree, completedNodes, currentEraIndex } = useGameStore();
  const getNodeProgress = useGameStore((s) => s.getNodeProgress);
  const [narratives, setNarratives] = useState<NarrativeRecords>({});
  const [selectedTab, setSelectedTab] = useState(String(currentEraIndex));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNarratives(loadNarratives());
  }, []);

  const erasWithData = useMemo(() => {
    return tree.eras
      .map((era, i) => ({
        ...era,
        index: i,
        nodes: era.nodes
          .filter((n) => {
            const isCompleted = completedNodes.includes(n.id);
            const hasNarrative = narratives[n.id]?.length;
            const progress = getNodeProgress(n.id);
            return (isCompleted && hasNarrative) || progress > 0;
          })
          .map((node) => {
            const isCompleted = completedNodes.includes(node.id);
            const progress = isCompleted ? node.pomodorosRequired : getNodeProgress(node.id);
            return {
              ...node,
              texts: narratives[node.id] ?? [],
              progress,
              isCompleted,
            };
          }),
      }))
      .filter((era) => era.nodes.length > 0);
  }, [tree.eras, completedNodes, narratives, getNodeProgress]);

  if (!mounted) return null;

  if (erasWithData.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground">
          还没有开始任何节点。开始研究后，这里会记录你的文明历程。
        </p>
      </div>
    );
  }

  return (
    <div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          {erasWithData.map((era) => (
            <TabsTrigger key={era.id} value={String(era.index)}>
              {era.name}
              {era.index === currentEraIndex && (
                <span className="ml-1 text-xs opacity-60">· 当前</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {erasWithData.map((era) => (
          <TabsContent key={era.id} value={String(era.index)} className="mt-4 space-y-4">
            {era.nodes.map((node) => (
              <Card key={node.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{node.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {node.progress}/{node.pomodorosRequired}
                    </span>
                    {!node.isCompleted && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        进行中
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                {node.texts.length > 0 && (
                  <CardContent>
                    <div className="space-y-3">
                      {node.texts.map((text, i) => (
                        <p key={i} className="leading-relaxed text-muted-foreground">
                          {text}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
