"use client";

import { useState, useEffect, useMemo } from "react";
import { Flag, CheckCircle2, Circle, Lock, Flame, Trophy, ChevronDown, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { getCurrentWeek, getAllWeeksData } from "@/actions/topics";

// Phase definitions
const PHASES = [
  { id: 1, name: "Foundation", weeks: [1, 2, 3, 4], color: "blue", goal: "Build strong basics in all subjects" },
  { id: 2, name: "Core Building", weeks: [5, 6, 7, 8], color: "purple", goal: "Speed, application & first sectional mocks" },
  { id: 3, name: "Advanced + Prelims", weeks: [9, 10, 11, 12], color: "orange", goal: "Full mock tests & advanced topics" },
  { id: 4, name: "Blast + Mains", weeks: [13, 14, 15, 16, 17], color: "red", goal: "Final sprint, descriptive & full mock marathon" },
];

function getWeekDateRange(week: number): string {
  const start = new Date("2026-04-01");
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function RoadmapPage() {
  const [currentWeek, setCurrentWeek] = useState(1);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const week = await getCurrentWeek();
        setCurrentWeek(week);
        setExpandedWeek(week);
        const data = await getAllWeeksData();
        setAllTopics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const topicsByWeek = useMemo(() => {
    const map: Record<number, any[]> = {};
    for (let w = 1; w <= 17; w++) map[w] = [];
    allTopics.forEach(t => { if (map[t.week]) map[t.week].push(t); });
    return map;
  }, [allTopics]);

  const weekProgress = useMemo(() => {
    const result: Record<number, { total: number; done: number; percent: number }> = {};
    for (let w = 1; w <= 17; w++) {
      const topics = topicsByWeek[w] || [];
      const total = topics.length;
      const done = topics.filter(t => t.status !== "not_started").length;
      result[w] = { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
    }
    return result;
  }, [topicsByWeek]);

  // Overall journey progress
  const overallProgress = useMemo(() => {
    const total = allTopics.length;
    const done = allTopics.filter(t => t.status !== "not_started").length;
    return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [allTopics]);

  if (loading) return <div className="h-48 flex items-center justify-center font-mono text-muted-foreground uppercase text-sm">Loading Roadmap...</div>;

  return (
    <div className="space-y-8 pb-20 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 border-b pb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-orange-500" /> SBI PO Journey
        </h1>
        <p className="font-mono text-muted-foreground uppercase text-sm">
          17 Weeks · April 1 → July 30 · {overallProgress.done}/{overallProgress.total} Milestones Reached
        </p>
        {/* Overall progress bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 transition-all duration-700 rounded-full"
              style={{ width: `${overallProgress.percent}%` }}
            />
          </div>
          <div className="text-xs font-mono text-primary font-bold mt-1">{overallProgress.percent}% Complete</div>
        </div>
      </div>

      {/* Road Timeline */}
      <div className="relative">
        {/* Vertical road line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 via-orange-500 to-red-500 rounded-full" />

        {PHASES.map((phase, phaseIdx) => (
          <div key={phase.id} className="relative mb-8">
            {/* Phase marker */}
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg ring-4 ring-background",
                phase.color === "blue" ? "bg-blue-500" :
                phase.color === "purple" ? "bg-purple-500" :
                phase.color === "orange" ? "bg-orange-500" : "bg-red-500"
              )}>
                <Flag className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-lg">Phase {phase.id}: {phase.name}</h2>
                  {phase.weeks.every(w => weekProgress[w]?.percent === 100) && (
                    <span className="text-[9px] font-mono font-bold bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded uppercase">Completed</span>
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{phase.goal}</p>
              </div>
            </div>

            {/* Week milestones */}
            <div className="ml-4 space-y-3">
              {phase.weeks.map(week => {
                const wp = weekProgress[week];
                const isPast = week < currentWeek;
                const isCurrent = week === currentWeek;
                const isFuture = week > currentWeek;
                const isExpanded = expandedWeek === week;
                const topics = topicsByWeek[week] || [];
                const isComplete = wp.percent === 100;

                return (
                  <div key={week} className="relative">
                    {/* Connecting dot on the road */}
                    <div className={clsx(
                      "absolute left-4 top-4 w-3 h-3 rounded-full ring-2 ring-background z-10",
                      isComplete ? "bg-green-500" :
                      isCurrent ? "bg-primary animate-pulse" :
                      isPast ? "bg-orange-500" :
                      "bg-muted-foreground/30"
                    )} />

                    {/* Week Card */}
                    <div className={clsx(
                      "ml-12 rounded-lg border transition-all",
                      isCurrent ? "border-primary/50 bg-primary/5 shadow-md ring-1 ring-primary/20" :
                      isComplete ? "border-green-500/30 bg-green-500/5" :
                      isPast ? "border-orange-500/20 bg-orange-500/5" :
                      "border-border bg-card opacity-80"
                    )}>
                      <button
                        onClick={() => setExpandedWeek(isExpanded ? null : week)}
                        className="w-full flex items-center justify-between p-4 text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Status icon */}
                          {isComplete ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                          ) : isCurrent ? (
                            <Flame className="w-5 h-5 text-primary shrink-0" />
                          ) : isFuture ? (
                            <Lock className="w-5 h-5 text-muted-foreground/30 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-orange-500 shrink-0" />
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={clsx(
                                "font-display font-bold text-sm",
                                isCurrent ? "text-primary" : isComplete ? "text-green-600 dark:text-green-400" : "text-foreground"
                              )}>
                                Week {week}
                              </span>
                              {isCurrent && (
                                <span className="text-[9px] font-mono font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase animate-pulse">
                                  YOU ARE HERE
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">{getWeekDateRange(week)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Progress ring */}
                          <div className="flex items-center gap-2">
                            <span className={clsx(
                              "text-xs font-mono font-bold",
                              isComplete ? "text-green-600 dark:text-green-400" : "text-primary"
                            )}>
                              {wp.done}/{wp.total}
                            </span>
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={clsx(
                                  "h-full rounded-full transition-all duration-500",
                                  isComplete ? "bg-green-500" : "bg-primary"
                                )}
                                style={{ width: `${wp.percent}%` }}
                              />
                            </div>
                          </div>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>

                      {/* Expanded: show actual topics from DB */}
                      {isExpanded && topics.length > 0 && (
                        <div className="px-4 pb-4 border-t border-border/50 space-y-1.5">
                          {topics.map(topic => (
                            <div key={topic.id} className="flex items-center gap-3 py-1.5 px-2">
                              {topic.status !== "not_started" ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                              )}
                              <span className={clsx(
                                "text-sm",
                                topic.status !== "not_started" ? "text-green-600 dark:text-green-400 line-through opacity-60" : "text-foreground"
                              )}>
                                {topic.name}
                              </span>
                              <span className="text-[9px] font-mono text-muted-foreground uppercase ml-auto shrink-0">{topic.subject}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Phase finish line between phases */}
            {phaseIdx < PHASES.length - 1 && (
              <div className="flex items-center gap-4 ml-4 mt-4 mb-2">
                <div className="w-8 border-t-2 border-dashed border-muted-foreground/20" />
                <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">Phase {phase.id} → Phase {phase.id + 1}</span>
                <div className="flex-1 border-t-2 border-dashed border-muted-foreground/20" />
              </div>
            )}
          </div>
        ))}

        {/* Final destination */}
        <div className="flex items-center gap-4 relative z-10 ml-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shrink-0 shadow-lg ring-4 ring-background">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl">🎯 SBI PO Exam Day</h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">July 30, 2026 — You&apos;re ready!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
