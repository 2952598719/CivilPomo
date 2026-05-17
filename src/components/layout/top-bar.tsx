"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

const HIDE_ON = ["/settings", "/transition"];

export function TopBar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark"; // default light
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  if (HIDE_ON.includes(pathname)) return null;

  return (
    <header className="flex items-center justify-between px-4 py-4 border-b bg-background">
      <span className="text-base font-semibold">CivilPomo</span>
      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-1 text-muted-foreground">
          {dark ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        <Link href="/settings" className="p-1 text-muted-foreground">
          <Settings size={22} />
        </Link>
      </div>
    </header>
  );
}
