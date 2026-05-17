"use client";

import { useGameStore } from "@/stores/game-store";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect, useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { Era } from "@/data/types";

const NODE_R = 28;
const PAD_X = 80;
const PAD_Y = 60;
const COL_W = 140;
const ROW_H = 120;
const STROKE_W = 3;

type NodeStatus = "completed" | "available" | "locked";

function useIsDark() {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

function getNodeStatus(
  nodeId: string,
  completedNodes: string[],
  availableIds: string[]
): NodeStatus {
  if (completedNodes.includes(nodeId)) return "completed";
  if (availableIds.includes(nodeId)) return "available";
  return "locked";
}

function desaturate(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
  const mix = (c: number) => Math.round(c * 0.25 + gray * 0.75);
  const mr = mix(r), mg = mix(g), mb = mix(b);
  return `#${mr.toString(16).padStart(2, "0")}${mg.toString(16).padStart(2, "0")}${mb.toString(16).padStart(2, "0")}`;
}

function adaptForDark(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
  const lighten = (c: number) => Math.round(c * 0.6 + 255 * 0.4);
  const mix = (c: number) => Math.round(lighten(c) * 0.7 + gray * 0.3);
  const mr = mix(r), mg = mix(g), mb = mix(b);
  return `#${Math.min(mr, 255).toString(16).padStart(2, "0")}${Math.min(mg, 255).toString(16).padStart(2, "0")}${Math.min(mb, 255).toString(16).padStart(2, "0")}`;
}

function computeLayout(era: Era, viewW: number, viewH: number) {
  const nodes = era.nodes;
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    dependents.set(n.id, []);
  }
  for (const n of nodes) {
    for (const p of n.prerequisites) {
      inDegree.set(n.id, (inDegree.get(n.id) ?? 0) + 1);
      dependents.get(p)?.push(n.id);
    }
  }

  const layers: string[][] = [];
  const assigned = new Set<string>();

  let frontier = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => n.id);
  while (frontier.length > 0) {
    layers.push(frontier);
    frontier.forEach((id) => assigned.add(id));
    const next: string[] = [];
    for (const id of frontier) {
      for (const dep of dependents.get(id) ?? []) {
        inDegree.set(dep, (inDegree.get(dep) ?? 1) - 1);
        if (inDegree.get(dep) === 0) next.push(dep);
      }
    }
    frontier = next;
  }

  const positions = new Map<string, { x: number; y: number }>();
  const innerW = viewW - PAD_X * 2;
  const innerH = viewH - PAD_Y * 2;
  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    const colW = layer.length > 1 ? innerW / (layer.length - 1) : 0;
    const offsetX = layer.length > 1 ? PAD_X : viewW / 2;
    for (let ni = 0; ni < layer.length; ni++) {
      positions.set(layer[ni], {
        x: layer.length > 1 ? offsetX + ni * colW : offsetX,
        y: PAD_Y + (layers.length > 1 ? li * (innerH / (layers.length - 1)) : innerH / 2),
      });
    }
  }

  return positions;
}

function computeUnifiedViewBox(eras: Era[]): { w: number; h: number } {
  let maxCols = 1;
  let maxLayers = 1;
  for (const era of eras) {
    const inDegree = new Map<string, number>();
    const dependents = new Map<string, string[]>();
    for (const n of era.nodes) {
      inDegree.set(n.id, 0);
      dependents.set(n.id, []);
    }
    for (const n of era.nodes) {
      for (const p of n.prerequisites) {
        inDegree.set(n.id, (inDegree.get(n.id) ?? 0) + 1);
        dependents.get(p)?.push(n.id);
      }
    }
    const layers: string[][] = [];
    let frontier = era.nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => n.id);
    while (frontier.length > 0) {
      layers.push(frontier);
      const next: string[] = [];
      for (const id of frontier) {
        for (const dep of dependents.get(id) ?? []) {
          inDegree.set(dep, (inDegree.get(dep) ?? 1) - 1);
          if (inDegree.get(dep) === 0) next.push(dep);
        }
      }
      frontier = next;
    }
    maxCols = Math.max(maxCols, ...layers.map((l) => l.length));
    maxLayers = Math.max(maxLayers, layers.length);
  }
  return {
    w: maxCols * COL_W + PAD_X * 2,
    h: maxLayers * ROW_H + PAD_Y * 2,
  };
}

function sectorPath(cx: number, cy: number, r: number, progress: number, total: number): string {
  if (total <= 0 || progress <= 0) return "";
  const ratio = Math.min(progress / total, 1);

  if (ratio >= 1) {
    // Full circle: two semicircular arcs
    return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r} Z`;
  }

  const angle = ratio * 2 * Math.PI;
  const startX = cx;
  const startY = cy - r;
  const endX = cx + r * Math.sin(angle);
  const endY = cy - r * Math.cos(angle);
  const large = angle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${startX} ${startY} A ${r} ${r} 0 ${large} 1 ${endX} ${endY} Z`;
}

function ProgressCircle({
  cx,
  cy,
  progress,
  total,
  status,
  color,
  name,
  isActive,
  isCurrentEra,
  onClick,
}: {
  cx: number;
  cy: number;
  progress: number;
  total: number;
  status: NodeStatus;
  color: string;
  name: string;
  isActive: boolean;
  isCurrentEra: boolean;
  onClick?: () => void;
}) {
  const borderColor = status === "locked" ? desaturate(color) : color;
  const fillColor = status === "locked" ? desaturate(color) : color;
  const ratio = total > 0 ? Math.min(progress / total, 1) : 0;
  const sectorR = NODE_R - STROKE_W / 2;
  const sectorD = sectorPath(cx, cy, sectorR, progress, total);

  const overlayOpacity = status === "locked" ? 0.7 : 0.45;

  return (
    <g
      onClick={onClick}
      style={{ cursor: status === "available" && isCurrentEra ? "pointer" : "default" }}
    >
      {/* Layer 1: opaque white background (covers edges) */}
      <circle cx={cx} cy={cy} r={NODE_R} style={{ fill: "#ffffff" }} />
      {/* Layer 2: opaque sector color */}
      {ratio > 0 && sectorD && (
        <path d={sectorD} style={{ fill: fillColor }} />
      )}
      {/* Layer 3: semi-transparent white overlay (pastel effect) */}
      <circle cx={cx} cy={cy} r={NODE_R} style={{ fill: "#ffffff", opacity: overlayOpacity }} />
      {/* Border on top */}
      <circle
        cx={cx}
        cy={cy}
        r={NODE_R}
        style={{
          fill: "none",
          stroke: borderColor,
          strokeWidth: STROKE_W,
          opacity: status === "locked" ? 0.5 : 1,
        }}
      />
      {isActive && (
        <circle
          cx={cx}
          cy={cy}
          r={NODE_R + 4}
          style={{ fill: "none", stroke: color, strokeWidth: 2, opacity: 0.8 }}
          className="animate-pulse"
        />
      )}
      {status === "locked" ? (
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fill: "#999" }}
          fontSize={18}
        >
          ?
        </text>
      ) : (
        <>
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fill: "#111" }}
            fontSize={11}
            fontWeight="bold"
          >
            {name}
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fill: "#666" }}
            fontSize={9}
          >
            {progress}/{total}
          </text>
        </>
      )}
    </g>
  );
}

function EraGraph({
  era,
  eraIndex,
  currentEraIndex,
  completedNodes,
  availableIds,
  currentNodeId,
  viewBox,
}: {
  era: Era;
  eraIndex: number;
  currentEraIndex: number;
  completedNodes: string[];
  availableIds: string[];
  currentNodeId: string | null;
  viewBox: { w: number; h: number };
}) {
  const positions = useMemo(() => computeLayout(era, viewBox.w, viewBox.h), [era, viewBox]);
  const getNodeProgress = useGameStore((s) => s.getNodeProgress);
  const isCurrentEra = eraIndex === currentEraIndex;
  const isPastEra = eraIndex < currentEraIndex;
  const isDark = useIsDark();

  const nodeColorMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of era.nodes) m.set(n.id, isDark ? adaptForDark(n.color) : n.color);
    return m;
  }, [era, isDark]);

  const edges: { from: string; to: string }[] = [];
  for (const node of era.nodes) {
    for (const p of node.prerequisites) {
      edges.push({ from: p, to: node.id });
    }
  }

  return (
    <TransformWrapper
      minScale={0.3}
      maxScale={4}
      initialScale={1.5}
      centerOnInit
      wheel={{ step: 0.15 }}
    >
      <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
        <svg
          viewBox={`0 0 ${viewBox.w} ${viewBox.h}`}
          style={{ width: "100%", height: "100%" }}
        >
      {/* Edges drawn first, so nodes render on top */}
      {edges.map((e) => {
        const from = positions.get(e.from);
        const to = positions.get(e.to);
        if (!from || !to) return null;
        const edgeColor = nodeColorMap.get(e.from) ?? "#6b7280";
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={edgeColor}
            strokeWidth={1.5}
            opacity={0.35}
          />
        );
      })}
      {/* Nodes drawn on top, covering edge endpoints */}
      {era.nodes.map((node) => {
        const pos = positions.get(node.id);
        if (!pos) return null;
        const status = isPastEra
          ? "completed"
          : getNodeStatus(node.id, completedNodes, availableIds);
        const progress = isPastEra ? node.pomodorosRequired : getNodeProgress(node.id);
        return (
          <ProgressCircle
            key={node.id}
            cx={pos.x}
            cy={pos.y}
            progress={progress}
            total={node.pomodorosRequired}
            status={status}
            color={nodeColorMap.get(node.id) ?? node.color}
            name={node.name}
            isActive={node.id === currentNodeId}
            isCurrentEra={isCurrentEra}
            onClick={() => {
              if (status === "available" && isCurrentEra) {
                useGameStore.getState().selectNode(node.id);
              }
            }}
          />
        );
      })}
    </svg>
      </TransformComponent>
    </TransformWrapper>
  );
}

export function TechTreeView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { tree, completedNodes, currentEraIndex, currentNodeId } =
    useGameStore();
  const availableIds = useGameStore.getState().getAvailableNodeIds();

  const visibleEras = tree.eras.slice(0, currentEraIndex + 1);
  const [selectedTab, setSelectedTab] = useState(String(currentEraIndex));
  const viewBox = useMemo(() => computeUnifiedViewBox(tree.eras), [tree.eras]);

  useEffect(() => {
    setSelectedTab(String(currentEraIndex));
  }, [currentEraIndex]);

  if (!mounted || visibleEras.length === 0) return null;

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
      <TabsList>
        {visibleEras.map((era, i) => (
          <TabsTrigger key={era.id} value={String(i)}>
            {era.name}
            {i === currentEraIndex && (
              <span className="ml-1 text-xs opacity-60">· 当前</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      {visibleEras.map((era, i) => (
        <TabsContent key={era.id} value={String(i)} className="mt-4">
          <div style={{ height: "calc(100vh - 200px)" }}>
          <EraGraph
            era={era}
            eraIndex={i}
            currentEraIndex={currentEraIndex}
            completedNodes={completedNodes}
            availableIds={availableIds}
            currentNodeId={currentNodeId}
            viewBox={viewBox}
          />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
