"use client";

import { useState, useRef, useEffect } from "react";
import { useGameStore } from "@/stores/game-store";
import { findNodeById, isTransitionNode } from "@/lib/game-logic";
import { ChevronDown } from "lucide-react";

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

export function InlineNodeSelector() {
  const { tree, currentEraIndex, currentNodeId } = useGameStore();
  const availableIds = useGameStore.getState().getAvailableNodeIds();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const era = tree.eras[currentEraIndex];
  if (!era) return null;

  const availableNodes = availableIds
    .map((id) => findNodeById(tree, id)?.node ?? null)
    .filter(Boolean);

  if (availableNodes.length === 0) return <span>所有节点已完成</span>;

  const currentNode = currentNodeId ? findNodeById(tree, currentNodeId)?.node : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-0.5 hover:opacity-70 transition-opacity"
      >
        <span style={currentNode ? { color: isDark ? adaptForDark(currentNode.color) : currentNode.color } : undefined}>
          {currentNode?.name ?? "选择节点"}
        </span>
        <ChevronDown size={14} className="opacity-40" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] rounded-md border bg-popover shadow-md">
          {availableNodes.map((node) => (
            <button
              key={node!.id}
              onClick={() => {
                useGameStore.getState().selectNode(node!.id);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors ${
                node!.id === currentNodeId ? "bg-accent font-medium" : ""
              }`}
            >
              <span style={{ color: isDark ? adaptForDark(node!.color) : node!.color }}>{node!.name}</span>
              {!isTransitionNode(node!.id) && (
                <span className="ml-1 text-xs text-muted-foreground">
                  {node!.category === "technology" ? "科技" : node!.category === "humanities" ? "人文" : "民政"}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
