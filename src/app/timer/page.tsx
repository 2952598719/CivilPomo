"use client";

import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { useGameStore } from "@/stores/game-store";
import { useTimerStore } from "@/stores/timer-store";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { NodeProgress } from "@/components/game/node-progress";
import { InlineNodeSelector } from "@/components/game/inline-node-selector";
import { addNarrative } from "@/lib/storage";
import { isTransitionNode, findNodeById } from "@/lib/game-logic";
import { toast } from "sonner";

export default function TimerPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const router = useRouter();
  const { currentNodeId, completedPomodoros, tree, currentEraIndex } =
    useGameStore();

  const currentNode = currentNodeId
    ? findNodeById(tree, currentNodeId)?.node ?? null
    : null;

  const currentEra = tree.eras[currentEraIndex];

  const narrativePromise = useRef<Promise<string> | null>(null);

  async function fetchNarrative(body: object, retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch("/api/narrative", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.narrative) return data.narrative;
      } catch {}
      if (i < retries - 1) await new Promise((r) => setTimeout(r, 1000));
    }
    return "（叙事生成失败）";
  }

  const startNarrativeGeneration = () => {
    const state = useGameStore.getState();
    const node = state.currentNodeId;
    if (!node) return;

    if (isTransitionNode(node)) {
      const era = tree.eras[state.currentEraIndex];
      narrativePromise.current = Promise.resolve(
        `你站在${era?.name ?? "未知时代"}的尽头，回望来时的路。那些曾经陌生的技艺，如今已成为你血脉中的一部分。远方的地平线上，新的曙光正在升起。`
      );
      return;
    }

    const allNodes = state.tree.eras.flatMap((e) => e.nodes);
    const targetNode = allNodes.find((n) => n.id === node);
    if (!targetNode) return;

    const progress = state.completedPomodoros + 1;
    const prereqDescriptions = targetNode.prerequisites
      .map((id) => allNodes.find((n) => n.id === id)?.description ?? "")
      .filter(Boolean);

    narrativePromise.current = fetchNarrative({
      nodeName: targetNode.name,
      nodeDescription: targetNode.description,
      currentPomodoro: progress,
      totalPomodoros: targetNode.pomodorosRequired,
      prerequisiteDescriptions: prereqDescriptions,
      isFinalPomodoro: progress >= targetNode.pomodorosRequired,
    });
  };

  useEffect(() => {
    useTimerStore.getState().setOnWorkComplete(async () => {
      const state = useGameStore.getState();
      const node = state.currentNodeId;
      if (!node) return;

      const nodeInfo = findNodeById(state.tree, node);
      if (!nodeInfo) return;

      const progress = state.completedPomodoros + 1;
      const text = (await narrativePromise.current) ?? "（叙事生成失败）";
      narrativePromise.current = null;

      addNarrative(node, text);
      const didTransition = useGameStore.getState().completePomodoro();

      if (didTransition) {
        toast(text, { description: "时代已完成" });
        router.push("/transition");
      } else {
        toast(text, {
          description: `${nodeInfo.node.name} · ${progress}/${nodeInfo.node.pomodorosRequired}`,
        });
      }
    });
    return () => useTimerStore.getState().setOnWorkComplete(null);
  }, [router]);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-8 py-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">原始时代</p>
          <p className="mt-2 text-lg text-muted-foreground">加载中...</p>
        </div>
        <PomodoroTimer canStart={false} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">{currentEra?.name}</p>
        <div className="mt-2">
          {currentNode ? (
            <div className="text-lg font-medium">
              {isTransitionNode(currentNode.id) ? (
                currentNode.name
              ) : (
                <span className="inline-flex items-center gap-1">
                  正在研究：<InlineNodeSelector />
                </span>
              )}
            </div>
          ) : (
            <div className="text-lg text-muted-foreground">
              <InlineNodeSelector />
            </div>
          )}
          <NodeProgress
            current={currentNode ? completedPomodoros : 0}
            total={currentNode?.pomodorosRequired ?? 0}
          />
        </div>
      </div>

      <PomodoroTimer onStart={startNarrativeGeneration} canStart={!!currentNodeId} />
    </div>
  );
}
