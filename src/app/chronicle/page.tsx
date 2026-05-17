"use client";

import { loadNarratives } from "@/lib/storage";
import { useGameStore } from "@/stores/game-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState, useMemo } from "react";
import type { NarrativeRecords } from "@/data/types";

export default function ChroniclePage() {
  const { tree, completedNodes, currentEraIndex } = useGameStore();
  const [narratives, setNarratives] = useState<NarrativeRecords>({});
  const [selectedTab, setSelectedTab] = useState(String(currentEraIndex));

  useEffect(() => {
    setNarratives(loadNarratives());
  }, []);

  const erasWithNarratives = useMemo(() => {
    return tree.eras
      .map((era, i) => ({
        ...era,
        index: i,
        nodes: era.nodes
          .filter((n) => completedNodes.includes(n.id) && narratives[n.id]?.length)
          .map((node) => ({ ...node, texts: narratives[node.id]! })),
      }))
      .filter((era) => era.nodes.length > 0);
  }, [tree.eras, completedNodes, narratives]);

  if (erasWithNarratives.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground">
          还没有完成任何节点。完成节点后，这里会记录你的文明历程。
        </p>
      </div>
    );
  }

  return (
    <div>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          {erasWithNarratives.map((era) => (
            <TabsTrigger key={era.id} value={String(era.index)}>
              {era.name}
              {era.index === currentEraIndex && (
                <span className="ml-1 text-xs opacity-60">· 当前</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        {erasWithNarratives.map((era) => (
          <TabsContent key={era.id} value={String(era.index)} className="mt-4 space-y-4">
            {era.nodes.map((node) => (
              <Card key={node.id}>
                <CardHeader>
                  <CardTitle>{node.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {node.texts.map((text, i) => (
                      <p key={i} className="leading-relaxed text-muted-foreground">
                        {text}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
