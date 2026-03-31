"use client";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronRight, Trophy, Flag, Flame, Lock, CheckCircle2, Circle } from "lucide-react";
import { getAllWeeksData } from "@/actions/topics";
import clsx from "clsx";

const PHASES = [
  { id: 1, name: "Foundation", weeks: [1, 2, 3, 4], emoji: "🏗️", color: "from-blue-500 to-cyan-400", dot: "bg-blue-500", desc: "Build strong basics" },
  { id: 2, name: "Build-Up", weeks: [5, 6, 7, 8], emoji: "⚡", color: "from-purple-500 to-pink-400", dot: "bg-purple-500", desc: "Strengthen & start mocks" },
  { id: 3, name: "Mains Prep", weeks: [9, 10, 11, 12], emoji: "🔥", color: "from-orange-500 to-red-400", dot: "bg-orange-500", desc: "Advanced topics + mains" },
  { id: 4, name: "Final Sprint", weeks: [13, 14, 15, 16, 17], emoji: "🏆", color: "from-amber-500 to-yellow-400", dot: "bg-amber-500", desc: "Full mocks & revision" },
];

function getWeekDates(week: number) {
  const start = new Date("2026-04-01");
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

export default function RoadmapPage() {
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllWeeksData().then(d => { setAllTopics(d); setLoading(false); });
  }, []);

  const currentWeek = useMemo(() => {
    const now = new Date();
    const start = new Date("2026-04-01");
    const diff = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, Math.min(17, diff + 1));
  }, []);

  const weekData = useMemo(() => {
    const map: Record<number, { total: number; done: number; topics: any[] }> = {};
    for (let w = 1; w <= 17; w++) {
      const topics = allTopics.filter(t => t.week === w);
      map[w] = { total: topics.length, done: topics.filter(t => t.status !== "not_started").length, topics };
    }
    return map;
  }, [allTopics]);

  const totalDone = allTopics.filter(t => t.status !== "not_started").length;
  const totalTopics = allTopics.length;
  const overallPct = totalTopics > 0 ? Math.round((totalDone / totalTopics) * 100) : 0;

  if (loading) return <div className="h-48 flex items-center justify-center font-mono text-muted-foreground uppercase text-sm tracking-widest">🗺️ Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div className="text-center animate-fade-in">
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          <span className="bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent">🏆 SBI PO Journey</span>
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-2 uppercase tracking-widest">17 Weeks · Apr 1 → Jul 30 · {totalDone}/{totalTopics} Done</p>
        <div className="mt-4 max-w-md mx-auto">
          <div className="w-full h-3 bg-white/3 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 rounded-full transition-all duration-700" style={{ width: `${overallPct}%` }} />
          </div>
          <p className="font-mono text-sm font-bold text-orange-400 mt-1">{overallPct}% Complete 🔥</p>
        </div>
      </div>

      {/* Phases */}
      {PHASES.map(phase => {
        const phaseDone = phase.weeks.reduce((s, w) => s + (weekData[w]?.done || 0), 0);
        const phaseTotal = phase.weeks.reduce((s, w) => s + (weekData[w]?.total || 0), 0);
        const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
        const isCurrentPhase = phase.weeks.includes(currentWeek);

        return (
          <div key={phase.id} className="animate-fade-in-up">
            {/* Phase Header */}
            <div className={clsx("flex items-center gap-4 mb-4 p-4 rounded-2xl card-glow", isCurrentPhase && "border-orange-500/15 glow-accent")}>
              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-gradient-to-br", phase.color, "text-white shadow-lg")}>
                {phasePct === 100 ? "✅" : phase.emoji}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold flex items-center gap-2">
                  {phase.name}
                  {isCurrentPhase && <span className="text-[9px] font-mono bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full tracking-widest">🔥 NOW</span>}
                </h2>
                <p className="text-xs text-muted-foreground">{phase.desc} · {phaseDone}/{phaseTotal} topics</p>
              </div>
              <div className="text-right">
                <span className={clsx("font-display text-xl font-bold", phasePct === 100 ? "text-green-400" : "text-orange-400")}>{phasePct}%</span>
              </div>
            </div>

            {/* Weeks in Phase */}
            <div className="relative ml-6 pl-8 border-l-2 border-[rgba(56,189,248,0.15)] space-y-3">
              {phase.weeks.map(w => {
                const wd = weekData[w] || { total: 0, done: 0, topics: [] };
                const wPct = wd.total > 0 ? Math.round((wd.done / wd.total) * 100) : 0;
                const isNow = w === currentWeek;
                const isFuture = w > currentWeek;
                const isExpanded = expandedWeek === w;

                return (
                  <div key={w}>
                    {/* Week dot on timeline */}
                    <div className={clsx("absolute -left-[9px] w-4 h-4 rounded-full border-2",
                      wPct === 100 ? "bg-green-500 border-green-400" :
                      isNow ? "bg-orange-500 border-orange-400 animate-pulse-glow" :
                      isFuture ? "bg-secondary border-muted-foreground/30" :
                      `${phase.dot} border-white/20`
                    )} style={{ marginTop: "14px" }} />

                    <button
                      onClick={() => setExpandedWeek(isExpanded ? null : w)}
                      className={clsx("w-full card-glow p-4 text-left transition-all hover:border-orange-500/15",
                        isNow && "border-orange-500/15",
                        isFuture && "opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {wPct === 100 ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                           isFuture ? <Lock className="w-4 h-4 text-muted-foreground/30" /> :
                           <Circle className="w-4 h-4 text-muted-foreground/50" />}
                          <div>
                            <span className="font-display font-bold text-sm">Week {w} {isNow && "🔥"}</span>
                            <span className="text-[10px] font-mono text-muted-foreground ml-2">{getWeekDates(w)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-muted-foreground">{wd.done}/{wd.total}</span>
                          <div className="w-16 h-1.5 bg-white/3 rounded-full overflow-hidden hidden sm:block">
                            <div className={clsx("h-full rounded-full bg-gradient-to-r", phase.color)} style={{ width: `${wPct}%` }} />
                          </div>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="mt-1 ml-7 space-y-1 animate-fade-in">
                        {wd.topics.map(t => (
                          <div key={t.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/2">
                            <div className="flex items-center gap-2">
                              {t.status !== "not_started" ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Circle className="w-3 h-3 text-muted-foreground/30" />}
                              <span className={clsx("text-xs", t.status !== "not_started" ? "text-green-400/80 line-through" : "")}>{t.name}</span>
                            </div>
                            <span className="font-mono text-[8px] text-muted-foreground uppercase">{t.subject}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
