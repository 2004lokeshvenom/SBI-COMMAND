"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { Play, RotateCcw, CheckCircle2, Circle, Clock, Target, Flame, ChevronRight, AlertCircle, Loader2, Sparkles, Activity } from "lucide-react";
import clsx from "clsx";
import { useTimetableStore } from "@/store/useTimetableStore";
import { formatTime, getActiveBlock, getTotalFocusCompleted, getTotalFocusMinutes } from "@/lib/scheduleEngine";
import { generateAITimetable } from "./actions";

const BLOCK_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  warmup:  { bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.3)",  text: "text-amber-400",   glow: "rgba(251,191,36,0.2)" },
  study:   { bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.3)",  text: "text-orange-400",  glow: "rgba(249,115,22,0.25)"  },
  break:   { bg: "rgba(56,189,248,0.05)",  border: "rgba(56,189,248,0.2)",  text: "text-sky-400",     glow: "rgba(56,189,248,0.15)"  },
  lunch:   { bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.3)",   text: "text-green-400",   glow: "rgba(34,197,94,0.2)"  },
  dinner:  { bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.3)",  text: "text-purple-400",  glow: "rgba(168,85,247,0.2)" },
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function TimetablePage() {
  const { dayStarted, blocks, completedBlockIds, startWithBlocks, markBlockComplete, undoBlockComplete, resetDay } = useTimetableStore();
  const [now, setNow] = useState(Date.now());
  const [mounted, setMounted] = useState(false);

  const activeRef = useRef<HTMLDivElement>(null);
  
  // AI generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mount gate + wall clock (real time)
  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll to active block on mount
  useEffect(() => {
    if (dayStarted && activeRef.current) {
      setTimeout(() => activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 500);
    }
  }, [dayStarted]);

  const activeBlock = useMemo(() => getActiveBlock(blocks, now), [blocks, now]);
  
  const totalFocusLeftMs = useMemo(() => {
    return blocks
      .filter(b => b.isFocusBlock && b.endTime > now)
      .reduce((sum, b) => {
        if (now >= b.startTime && now < b.endTime) {
          return sum + Math.max(0, b.endTime - now);
        }
        return sum + (b.endTime - b.startTime);
      }, 0);
  }, [blocks, now]);
  const totalFocusTarget = useMemo(() => getTotalFocusMinutes(blocks), [blocks]);
  
  // -- Automatic completion based on time --
  const totalFocusDone = useMemo(() => {
    return blocks
      .filter(b => b.isFocusBlock && now >= b.endTime)
      .reduce((sum, b) => sum + b.durationMinutes, 0);
  }, [blocks, now]);
  const progressPercent = totalFocusTarget > 0 ? Math.min(100, Math.round((totalFocusDone / totalFocusTarget) * 100)) : 0;

  const countdownMs = activeBlock ? Math.max(0, activeBlock.endTime - now) : 0;
  const blocksCompleted = blocks.filter(b => now >= b.endTime).length;
  const totalBlocks = blocks.length;

  if (!mounted) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-muted-foreground animate-pulse">
      <Loader2 className="w-8 h-8 animate-spin opacity-50" />
      <span className="font-mono uppercase text-xs tracking-[0.2em]">Initializing Systems...</span>
    </div>
  );

  const handleStartDay = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const startTimeMs = now;
      const response = await generateAITimetable(startTimeMs);
      if (!response.success || !response.blocks) {
        setErrorMsg(response.error || "Failed to generate timetable.");
      } else {
        startWithBlocks(response.blocks);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ── PRE-START VIEW ──
  if (!dayStarted) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center gap-12 animate-fade-in relative px-4">
        {/* Modern Minimalist Glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10 flex items-center justify-center">
          <div className="w-[60vw] h-[40vh] bg-orange-500/10 blur-[150px] rounded-full mix-blend-screen" />
        </div>

        <div className="text-center space-y-6 max-w-2xl mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-xs uppercase tracking-[0.2em] shadow-sm backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> Core AI Engine
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight leading-tight">
            <span className="text-foreground">Dynamic</span>
            <br />
            <span className="bg-gradient-to-br from-orange-400 via-red-500 to-rose-500 bg-clip-text text-transparent">
              Study Protocol
            </span>
          </h1>
          <p className="text-muted-foreground/80 font-mono text-sm max-w-md mx-auto">
            A real-time, adaptive schedule synchronized with your environment to maximize deep work.
          </p>
        </div>

        {errorMsg && (
          <div className="border border-red-500/20 bg-red-500/10 backdrop-blur-md p-4 rounded-2xl flex items-start gap-3 max-w-md text-red-400 w-full animate-in slide-in-from-bottom-4">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-6 w-full max-w-sm relative z-10">
          {/* Time Widget */}
          <div className="w-full relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-orange-500/20 to-red-500/20 rounded-[28px] blur-md opacity-50 transition-opacity duration-500" />
            <div className="relative bg-background/60 backdrop-blur-xl p-8 rounded-[24px] border border-white/10 flex flex-col items-center shadow-2xl">
               <Clock className="w-6 h-6 text-orange-400/80 mb-4" />
               <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.25em] font-semibold mb-2 text-center">
                 System Time
               </div>
               <div className="font-mono text-5xl font-bold tracking-tighter text-foreground" suppressHydrationWarning style={{ fontVariantNumeric: "tabular-nums" }}>
                 {new Date(now).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
               </div>
            </div>
          </div>

          <button
            onClick={handleStartDay}
            disabled={isGenerating}
            className={clsx(
              "w-full relative px-8 py-4 rounded-[20px] font-display font-semibold text-lg tracking-wide transition-all duration-300",
              isGenerating 
                ? "bg-white/5 text-muted-foreground cursor-not-allowed border border-white/5" 
                : "bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-orange-500/20 hover:bg-orange-50 border border-transparent"
            )}
          >
            <span className="relative flex items-center justify-center gap-3">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin opacity-70" />
                  Synthesizing Tasks...
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  Initialize Timetable
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    );
  }

  // ── ACTIVE DASHBOARD VIEW ──
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in duration-700 pt-4 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 font-mono text-[10px] uppercase tracking-widest border border-orange-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Protocol Active
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Today&apos;s Mission
          </h1>
          <p className="font-mono text-sm text-muted-foreground uppercase tracking-wider">
            Started {blocks.length > 0 ? formatTime(blocks[0].startTime) : formatTime(now)} • {totalBlocks} Tasks
          </p>
        </div>
        
        <button 
          onClick={resetDay} 
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-muted-foreground hover:text-foreground text-xs font-mono uppercase tracking-wider transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reset Protocol
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div className="bg-background/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="relative w-12 h-12 shrink-0">
            <svg width="48" height="48" className="-rotate-90">
              <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4" stroke="currentColor" className="text-white/5" />
              <circle cx="24" cy="24" r="20" fill="none" strokeWidth="4"
                stroke="currentColor"
                className="text-orange-500"
                strokeDasharray={2 * Math.PI * 20}
                strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-foreground">
              {progressPercent}%
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Focus Done</div>
            <div className="font-sans text-xl font-semibold text-foreground tracking-tight">{formatDuration(totalFocusDone)}</div>
          </div>
        </div>

        {/* Target Card */}
        <div className="bg-background/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
            <Target className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Target</div>
            <div className="font-sans text-xl font-semibold text-foreground tracking-tight">{formatDuration(totalFocusTarget)}</div>
          </div>
        </div>

        {/* Blocks Done Card */}
        <div className="bg-background/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">Completed</div>
            <div className="font-sans text-xl font-semibold text-foreground tracking-tight">{blocksCompleted} <span className="text-muted-foreground text-sm font-normal">/ {totalBlocks}</span></div>
          </div>
        </div>

        {/* Focus Left Card */}
        <div className="bg-orange-500/5 backdrop-blur-md border border-orange-500/20 rounded-2xl p-5 flex items-center gap-4 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <div className="font-mono text-[10px] text-orange-500/70 uppercase tracking-widest mb-0.5">Study Left</div>
            <div className="font-mono text-2xl font-bold tabular-nums text-orange-400" style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatCountdown(totalFocusLeftMs)}
            </div>
          </div>
        </div>
      </div>

      {/* Global Progress Line */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-400 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ── VERTICAL TIMELINE ── */}
      <div className="relative pt-4">
        {/* Continuous Track Line */}
        <div className="absolute left-[27px] top-6 bottom-4 w-[2px] bg-white/5 rounded-full" />

        <div className="space-y-6">
          {blocks.map((block, i) => {
            const isActive = activeBlock?.id === block.id;
            const isPast = now >= block.endTime;
            const isCompleted = isPast;
            const colors = BLOCK_COLORS[block.type] || BLOCK_COLORS.break;

            return (
              <div
                key={block.id}
                ref={isActive ? activeRef : undefined}
                className={clsx(
                  "relative flex items-start gap-5 transition-all duration-500 group",
                  isActive ? "opacity-100" : isPast ? "opacity-40 hover:opacity-60" : "opacity-80 hover:opacity-100"
                )}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {/* Timeline Node Container */}
                <div className="relative z-10 flex w-14 shrink-0 flex-col items-center pt-5">
                  {isCompleted ? (
                    <div className="w-7 h-7 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.2)] bg-background">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                  ) : isActive ? (
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-7 h-7 rounded-full bg-orange-500/30 animate-ping" />
                      <div className="w-7 h-7 rounded-full border-[3px] border-orange-500 bg-background shadow-[0_0_20px_rgba(249,115,22,0.4)] relative z-10" />
                      <div className="absolute w-2 h-2 rounded-full bg-orange-500 z-20" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 bg-background group-hover:border-white/40 transition-colors" />
                  )}
                </div>

                {/* Block Card */}
                <div
                  className={clsx(
                    "flex-1 rounded-2xl p-5 border transition-all duration-300 min-w-0 backdrop-blur-md bg-background/50",
                    isActive ? "scale-[1.02] shadow-2xl" : "hover:bg-white/[0.02]"
                  )}
                  style={{
                    backgroundColor: isActive ? colors.bg : isCompleted ? "transparent" : "rgba(255,255,255,0.01)",
                    borderColor: isActive ? colors.border : isCompleted ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.08)",
                    boxShadow: isActive ? `0 0 40px ${colors.glow}, inset 0 0 20px ${colors.glow}` : "none",
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left content */}
                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                      <div className="text-3xl shrink-0 p-2 rounded-xl bg-white/5 border border-white/5 shadow-inner">
                        {block.emoji}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className={clsx(
                            "font-sans font-semibold text-lg tracking-tight truncate", 
                            isCompleted ? "text-muted-foreground line-through" : isActive ? colors.text : "text-foreground"
                          )}>
                            {block.label}
                          </h3>
                          {isActive && (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Active
                            </span>
                          )}
                          {block.isFocusBlock && !isActive && !isCompleted && (
                            <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-full">
                              Deep Focus
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-sm text-muted-foreground/80 leading-snug line-clamp-2">
                          {block.description}
                        </p>
                      </div>
                    </div>

                    {/* Right content / Times */}
                    <div className="flex items-center gap-6 shrink-0 sm:justify-end border-t border-white/5 sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                      <div className="text-left sm:text-right shrink-0">
                        <div className="font-mono text-sm font-medium text-foreground/90">
                          {formatTime(block.startTime)} <span className="text-muted-foreground/50 mx-1">→</span> {formatTime(block.endTime)}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground mt-1 flex items-center sm:justify-end gap-2">
                          <Clock className="w-3 h-3" />
                          {formatDuration(block.durationMinutes)}
                        </div>
                      </div>

                      {/* Active Countdown Widget */}
                      {isActive && (
                        <div className="font-mono text-2xl font-bold tabular-nums text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg border border-orange-500/20 shadow-inner min-w-[90px] text-center" style={{ fontVariantNumeric: "tabular-nums" }}>
                          {formatCountdown(countdownMs)}
                        </div>
                      )}
                      
                      {/* Tags for fixed blocks */}
                      {(block.type === "lunch" || block.type === "dinner") && !isActive && (
                        <div className={clsx("px-2 py-1.5 rounded-md text-[10px] font-mono font-medium uppercase tracking-widest border",
                          block.type === "lunch" ? "bg-green-500/5 text-green-500/70 border-green-500/10" : "bg-purple-500/5 text-purple-500/70 border-purple-500/10"
                        )}>
                          Fixed
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sleek Active Progress Bar */}
                  {isActive && block.durationMinutes > 0 && (
                    <div className="mt-5 w-full h-1 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,1)]"
                        style={{ width: `${Math.max(0, Math.min(100, ((now - block.startTime) / (block.endTime - block.startTime)) * 100))}%`, transition: "width 1s linear" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}