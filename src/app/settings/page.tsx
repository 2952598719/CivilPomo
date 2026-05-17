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
  const [settings, setSettings] = useState<TimerSettings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const progress = loadProgress();
    setSettings(progress.timerSettings);
  }, []);

  const handleSave = () => {
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
      setSettings(progress.timerSettings);
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
              type="number"
              min={1}
              max={120}
              value={settings.workMinutes}
              onChange={(e) =>
                setSettings({ ...settings, workMinutes: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <Label htmlFor="shortBreak">短休息（分钟）</Label>
            <Input
              id="shortBreak"
              type="number"
              min={1}
              max={30}
              value={settings.shortBreakMinutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  shortBreakMinutes: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="longBreak">长休息（分钟）</Label>
            <Input
              id="longBreak"
              type="number"
              min={1}
              max={60}
              value={settings.longBreakMinutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  longBreakMinutes: Number(e.target.value),
                })
              }
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
