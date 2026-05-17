"use client";

import { loadProgress, saveProgress } from "@/lib/storage";
import { useTimerStore } from "@/stores/timer-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameStore } from "@/stores/game-store";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { TimerSettings } from "@/data/types";

export default function SettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ work: "25", shortBreak: "5", longBreak: "15" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const progress = loadProgress();
    const s = progress.timerSettings;
    setForm({ work: String(s.workMinutes), shortBreak: String(s.shortBreakMinutes), longBreak: String(s.longBreakMinutes) });
  }, []);

  const handleSave = () => {
    const settings: TimerSettings = {
      workMinutes: Math.max(1, Math.min(120, Number(form.work) || 25)),
      shortBreakMinutes: Math.max(1, Math.min(30, Number(form.shortBreak) || 5)),
      longBreakMinutes: Math.max(1, Math.min(60, Number(form.longBreak) || 15)),
    };
    const progress = loadProgress();
    progress.timerSettings = settings;
    saveProgress(progress);
    useTimerStore.getState().setWorkMinutes(settings.workMinutes);
    useTimerStore.getState().setShortBreakMinutes(settings.shortBreakMinutes);
    useTimerStore.getState().setLongBreakMinutes(settings.longBreakMinutes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm("确定要重置所有进度吗？这将清除所有游戏数据。")) {
      useGameStore.getState().resetGame();
      useTimerStore.getState().reset();
      const progress = loadProgress();
      const s = progress.timerSettings;
      setForm({ work: String(s.workMinutes), shortBreak: String(s.shortBreakMinutes), longBreak: String(s.longBreakMinutes) });
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6 pt-3 pb-8 px-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1 text-muted-foreground">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">设置</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>番茄钟时长</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="work">工作时长（分钟）</Label>
            <Input
              id="work"
              type="text"
              inputMode="numeric"
              value={form.work}
              onChange={(e) => setForm({ ...form, work: e.target.value.replace(/\D/g, "") })}
            />
          </div>
          <div>
            <Label htmlFor="shortBreak">短休息（分钟）</Label>
            <Input
              id="shortBreak"
              type="text"
              inputMode="numeric"
              value={form.shortBreak}
              onChange={(e) => setForm({ ...form, shortBreak: e.target.value.replace(/\D/g, "") })}
            />
          </div>
          <div>
            <Label htmlFor="longBreak">长休息（分钟）</Label>
            <Input
              id="longBreak"
              type="text"
              inputMode="numeric"
              value={form.longBreak}
              onChange={(e) => setForm({ ...form, longBreak: e.target.value.replace(/\D/g, "") })}
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            {saved ? "已保存" : "保存"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>危险操作</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleReset} className="w-full">
            重置所有进度
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
