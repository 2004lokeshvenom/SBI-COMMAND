"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Menu, Flame } from "lucide-react";
import { useMissionStore } from "@/store/useMissionStore";

export function TopBar() {
  const [mounted, setMounted] = useState(false);
  const [timeStr, setTimeStr] = useState("--:--:--");
  const [daysLeft, setDaysLeft] = useState(0);
  const toggleSidebar = useMissionStore((s) => s.toggleSidebar);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
      
      // Calculate exact local days difference
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const examMidnight = new Date(2026, 6, 30); // July 30, 2026
      
      const diffTime = examMidnight.getTime() - todayMidnight.getTime();
      const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      setDaysLeft(diffDays);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 border-b border-[rgba(56,189,248,0.2)] flex items-center justify-between px-4 md:px-6 bg-card/80 backdrop-blur-md sticky top-0 z-50" style={{ boxShadow: "0 1px 12px rgba(56,189,248,0.05)" }}>
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="md:hidden p-2 -ml-1 rounded-lg hover:bg-white/5 transition" aria-label="Open menu">
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <Link href="/" prefetch={false} className="flex items-center gap-2 font-mono font-bold text-base tracking-[0.15em] hover:opacity-80 transition">
          <Flame className="w-5 h-5 text-orange-500" />
          <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">FAMILY PRIDE</span>
        </Link>
      </div>
      <div className="font-mono text-base font-bold tabular-nums text-foreground" suppressHydrationWarning>
        {mounted ? timeStr : "--:--:--"}
      </div>
      <div className="flex items-center gap-4">
        <div className="font-mono text-xs text-muted-foreground hidden sm:block" suppressHydrationWarning>
          <span className="text-orange-400 font-bold">{mounted ? `D-${daysLeft}` : "D-..."}</span>
          {" · "}
          <span>🎯 30/07/2026</span>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition">
          <Bell className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
