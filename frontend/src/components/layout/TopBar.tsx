"use client";

import { useEffect, useState } from "react";
import { format, differenceInDays, differenceInSeconds } from "date-fns";
import { Bell } from "lucide-react";

export function TopBar() {
  const [now, setNow] = useState<Date | null>(null);
  
  // Exam Date based on 17-week Phase 4 end
  const examDate = new Date("2026-07-30T09:00:00");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return <header className="h-16 border-b bg-background sticky top-0 z-50"></header>;

  // Clock calculations
  const timeString = format(now, "HH:mm:ss");

  // Countdown calculations
  const daysRem = differenceInDays(examDate, now);
  const totalSecondsRem = differenceInSeconds(examDate, now);
  const hrsRem = Math.floor((totalSecondsRem % (3600 * 24)) / 3600);
  const minsRem = Math.floor((totalSecondsRem % 3600) / 60);
  const secsRem = totalSecondsRem % 60;

  const countdownText = `D-${daysRem} | ${hrsRem.toString().padStart(2, "0")}:${minsRem.toString().padStart(2, "0")}:${secsRem.toString().padStart(2, "0")}`;

  return (
    <header className="h-16 border-b bg-background sticky top-0 z-50 flex items-center justify-between px-6">
      
      {/* Left: App Logo */}
      <div className="flex items-center space-x-2">
        <span className="font-display font-bold text-2xl tracking-widest text-primary">
          ΣXAM OS
        </span>
      </div>

      {/* Center: Live Clock */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="font-display text-2xl font-medium tracking-widest text-foreground">
          {timeString}
        </div>
      </div>

      {/* Right: Countdown & Notifications */}
      <div className="flex items-center space-x-6">
        <div className="font-mono font-semibold tracking-wider text-sm md:text-base border border-border px-3 py-1 rounded bg-secondary text-secondary-foreground">
          {countdownText}
        </div>
        
        <button className="relative text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-6 h-6" />
          {/* Unread badge */}
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full"></span>
        </button>
      </div>

    </header>
  );
}
