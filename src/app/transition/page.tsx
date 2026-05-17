"use client";

import { useGameStore } from "@/stores/game-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function TransitionPage() {
  const { tree, currentEraIndex } = useGameStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="py-8" />;
  }

  const prevEra = tree.eras[currentEraIndex - 1];
  const nextEra = tree.eras[currentEraIndex];

  if (!prevEra || !nextEra) {
    router.replace("/timer");
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">时代已完成</p>
        <h1 className="mt-2 text-3xl font-bold">{prevEra.name}</h1>
        <p className="mt-2 text-muted-foreground">
          你掌握了 {prevEra.nodes.length} 项技术
        </p>
      </div>

      <div className="flex items-center gap-4 text-4xl">
        <span className="text-muted-foreground">→</span>
      </div>

      <Card className="w-full max-w-md border-primary">
        <CardContent className="p-6 text-center">
          <Badge variant="default" className="mb-3">新时代</Badge>
          <h2 className="text-2xl font-bold">{nextEra.name}</h2>
          <p className="mt-2 text-muted-foreground">
            {nextEra.nodes.length} 项新技术等待探索
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {nextEra.nodes.map((node) => (
              <Badge key={node.id} variant="secondary">
                {node.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={() => router.push("/timer")}>
        继续
      </Button>
    </div>
  );
}
