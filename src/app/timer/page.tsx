"use client";

import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { useGameStore } from "@/stores/game-store";
import { useState, useCallback, useEffect } from "react";
import { NarrativeModal } from "@/components/game/narrative-modal";
import { NodeSelector } from "@/components/game/node-selector";
import { NodeProgress } from "@/components/game/node-progress";
import { addNarrative } from "@/lib/storage";

export default function TimerPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { currentNodeId, completedPomodoros, tree, currentEraIndex } =
    useGameStore();
  const [showNarrative, setShowNarrative] = useState(false);
  const [narrativeText, setNarrativeText] = useState("");
  const [narrativeLoading, setNarrativeLoading] = useState(false);

  const currentNode = currentNodeId
    ? tree.eras.flatMap((e) => e.nodes).find((n) => n.id === currentNodeId)
    : null;

  const currentEra = tree.eras[currentEraIndex];

  const generateNarrative = useCallback(async () => {
    if (!currentNode) return;
    const progress = useGameStore.getState().completedPomodoros + 1;
    const allNodes = tree.eras.flatMap((e) => e.nodes);
    const prereqDescriptions = currentNode.prerequisites
      .map((id) => allNodes.find((n) => n.id === id)?.description ?? "")
      .filter(Boolean);

    try {
      const res = await fetch("/api/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeName: currentNode.name,
          nodeDescription: currentNode.description,
          currentPomodoro: progress,
          totalPomodoros: currentNode.pomodorosRequired,
          prerequisiteDescriptions: prereqDescriptions,
          isFinalPomodoro: progress >= currentNode.pomodorosRequired,
        }),
      });
      const data = await res.json();
      setNarrativeText(data.narrative ?? "（叙事生成失败）");
    } catch {
      setNarrativeText("（网络错误，无法生成叙事）");
    }
  }, [currentNode, tree]);

  const handleStart = useCallback(() => {
    setNarrativeText("");
    setNarrativeLoading(true);
    setShowNarrative(false);
    generateNarrative().finally(() => setNarrativeLoading(false));
  }, [generateNarrative]);

  const handleWorkComplete = useCallback((_pomodorosCompleted: number) => {
    setShowNarrative(true);
  }, []);

  const handleNarrativeClose = () => {
    setShowNarrative(false);
    if (currentNodeId && narrativeText) {
      addNarrative(currentNodeId, narrativeText);
    }
    useGameStore.getState().completePomodoro();
  };

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
        {currentNode ? (
          <div className="mt-2">
            <p className="text-lg font-medium">
              正在研究：{currentNode.name}
            </p>
            <NodeProgress
              current={completedPomodoros}
              total={currentNode.pomodorosRequired}
            />
          </div>
        ) : (
          <p className="mt-2 text-lg text-muted-foreground">
            请选择一个节点开始研究
          </p>
        )}
      </div>

      <PomodoroTimer onStart={handleStart} onWorkComplete={handleWorkComplete} canStart={!!currentNodeId} />

      <NodeSelector />

      <NarrativeModal
        open={showNarrative}
        narrative={narrativeText}
        loading={narrativeLoading}
        onClose={handleNarrativeClose}
      />
    </div>
  );
}
