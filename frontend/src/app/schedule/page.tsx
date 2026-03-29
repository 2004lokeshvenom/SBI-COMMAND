"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Square, CheckSquare, ChevronDown, ChevronRight, AlertTriangle, CalendarCheck } from "lucide-react";
import clsx from "clsx";
import { getCurrentWeek, markTopicStudied, unmarkTopicStudied, getAllWeeksData } from "@/actions/topics";
import { loadJsonState, saveJsonState } from "@/lib/clientState";

function getWeekDateRange(week: number): string {
  const start = new Date("2026-04-01");
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function SchedulePage() {
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [tab, setTab] = useState<"schedule" | "overdue">("schedule");
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({});
  const [practiced, setPracticed] = useState<Record<string, boolean>>({});
  const [weekGoals, setWeekGoals] = useState<Record<string, { revised: boolean; mocked: boolean }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const week = await getCurrentWeek();
        setCurrentWeek(week);
        const data = await getAllWeeksData();
        setAllTopics(data);
        setExpandedWeeks({ [week]: true });

        const [p, g] = await Promise.all([
          loadJsonState<Record<string, boolean>>("practiced_topics", {}),
          loadJsonState<Record<string, { revised: boolean; mocked: boolean }>>("week_goals", {}),
        ]);
        setPracticed(p);
        setWeekGoals(g);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const savePracticed = (next: Record<string, boolean>) => {
    setPracticed(next);
    void saveJsonState("practiced_topics", next);
  };
  const saveGoals = (next: Record<string, { revised: boolean; mocked: boolean }>) => {
    setWeekGoals(next);
    void saveJsonState("week_goals", next);
  };

  const topicsByWeek = useMemo(() => {
    const map: Record<number, any[]> = {};
    for (let w = 1; w <= 17; w++) map[w] = [];
    allTopics.forEach(t => { if (map[t.week]) map[t.week].push(t); });
    return map;
  }, [allTopics]);

  const weekOverdue = useMemo(() => {
    const result: Record<number, { studyLeft: number; practiceLeft: number; revisionDone: boolean; mockDone: boolean; total: number; allDone: boolean }> = {};
    for (let w = 1; w <= 17; w++) {
      const wt = topicsByWeek[w] || [];
      const total = wt.length;
      const studyLeft = wt.filter(t => t.status === "not_started").length;
      const practiceLeft = wt.filter(t => !practiced[t.id]).length;
      const g = weekGoals[`w${w}`] || { revised: false, mocked: false };
      result[w] = { studyLeft, practiceLeft, revisionDone: g.revised, mockDone: g.mocked, total, allDone: studyLeft === 0 && practiceLeft === 0 && g.revised && g.mocked };
    }
    return result;
  }, [topicsByWeek, practiced, weekGoals]);

  const handleTopicToggle = async (topic: any) => {
    if (topic.status === "not_started") await markTopicStudied(topic.id, 2);
    else await unmarkTopicStudied(topic.id);
    const data = await getAllWeeksData();
    setAllTopics(data);
  };

  const handlePracticeToggle = (id: string) => {
    savePracticed({ ...practiced, [id]: !practiced[id] });
  };

  const handleGoalToggle = (week: number, field: "revised" | "mocked") => {
    const key = `w${week}`;
    const cur = weekGoals[key] || { revised: false, mocked: false };
    saveGoals({ ...weekGoals, [key]: { ...cur, [field]: !cur[field] } });
  };

  const toggleWeek = (w: number) => setExpandedWeeks(prev => ({ ...prev, [w]: !prev[w] }));

  if (loading) return <div className="h-48 flex items-center justify-center font-mono text-muted-foreground uppercase text-sm">Loading Schedule...</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header + Tabs */}
      <div className="flex items-center gap-4 border-b pb-3">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <CalendarCheck className="w-7 h-7 text-primary" /> Full Schedule
        </h1>
        <div className="flex gap-1.5 bg-muted/50 p-1 rounded-lg border ml-auto">
          <button onClick={() => setTab("schedule")} className={clsx("px-4 py-2 rounded-md font-mono text-[10px] font-bold tracking-widest uppercase transition", tab === "schedule" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}>
            All Weeks
          </button>
          <button onClick={() => setTab("overdue")} className={clsx("px-4 py-2 rounded-md font-mono text-[10px] font-bold tracking-widest uppercase transition", tab === "overdue" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}>
            Overdue Tracker
          </button>
        </div>
      </div>

      {/* All Weeks Tab */}
      {tab === "schedule" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Week {currentWeek} of 17 · {getWeekDateRange(currentWeek)}
            </p>
            <div className="flex gap-2">
              <button onClick={() => { const a: Record<number, boolean> = {}; for (let w = 1; w <= 17; w++) a[w] = true; setExpandedWeeks(a); }} className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest hover:underline">Expand All</button>
              <span className="text-muted-foreground">·</span>
              <button onClick={() => setExpandedWeeks({ [currentWeek]: true })} className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest hover:underline">Collapse</button>
            </div>
          </div>

          {Array.from({ length: 17 }, (_, i) => i + 1).map(week => {
            const topics = topicsByWeek[week] || [];
            const isOpen = expandedWeeks[week] || false;
            const isCurrent = week === currentWeek;
            const isPast = week < currentWeek;
            const overdue = weekOverdue[week];
            const goals = weekGoals[`w${week}`] || { revised: false, mocked: false };
            const studied = topics.filter(t => t.status !== "not_started").length;
            const prac = topics.filter(t => practiced[t.id]).length;

            return (
              <div key={week} className={clsx(
                "rounded-lg border transition-all shadow-sm",
                isCurrent ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" :
                isPast && !overdue.allDone ? "border-red-500/30 bg-red-500/5" :
                isPast && overdue.allDone ? "border-green-500/20 bg-green-500/5" :
                "border-border bg-card"
              )}>
                <button onClick={() => toggleWeek(week)} className="w-full flex items-center justify-between p-4 text-left group">
                  <div className="flex items-center gap-3 min-w-0">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={clsx("font-display font-bold text-sm", isCurrent ? "text-primary" : "text-foreground")}>Week {week}</span>
                        {isCurrent && <span className="text-[9px] font-mono font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase tracking-widest animate-pulse">Current</span>}
                        {isPast && overdue.allDone && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                        {isPast && !overdue.allDone && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{getWeekDateRange(week)} · {topics.length} items</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-primary font-bold">{studied}/{topics.length}</div>
                      <div className="text-[10px] font-mono text-green-600 dark:text-green-500 font-bold">{prac}/{topics.length}</div>
                    </div>
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${topics.length > 0 ? Math.round((studied / topics.length) * 100) : 0}%` }} />
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-1 border-t border-border/50">
                    <div className="flex items-center justify-between px-3 py-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-semibold">
                      <span className="flex-1">Topic</span>
                      <div className="flex gap-6 shrink-0">
                        <span className="w-16 text-center">Studied</span>
                        <span className="w-16 text-center">Practice</span>
                      </div>
                    </div>
                    {topics.map((task: any) => (
                      <div key={task.id} className={clsx("flex items-center justify-between p-3 border rounded transition group", task.status !== "not_started" && practiced[task.id] ? "border-green-500/30 bg-green-500/5" : task.status !== "not_started" ? "border-primary/20 bg-primary/5" : "hover:bg-muted bg-background border-border")}>
                        <div className="flex-1 min-w-0">
                          <div className={clsx("font-medium text-sm transition-colors truncate", task.status !== "not_started" && practiced[task.id] ? "text-green-700 dark:text-green-400 line-through opacity-60" : "text-foreground")}>{task.name}</div>
                          <div className="text-[11px] font-mono text-muted-foreground uppercase mt-0.5">
                            {task.subject}
                            {task.priority === "high" && <span className="ml-2 text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">HIGH</span>}
                          </div>
                        </div>
                        <div className="flex gap-6 shrink-0">
                          <button onClick={() => handleTopicToggle(task)} className="w-16 flex justify-center">
                            {task.status !== "not_started" ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/60 transition" />}
                          </button>
                          <button onClick={() => handlePracticeToggle(task.id)} className="w-16 flex justify-center">
                            {practiced[task.id] ? <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-500" /> : <Square className="w-5 h-5 text-muted-foreground/40 group-hover:text-green-500/60 transition" />}
                          </button>
                        </div>
                      </div>
                    ))}
                    {topics.length === 0 && <div className="py-4 text-center text-muted-foreground font-mono text-sm">No topics scheduled.</div>}
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Week {week} Goals</div>
                      <button onClick={() => handleGoalToggle(week, "revised")} className={clsx("w-full flex items-center gap-3 p-2.5 rounded border transition text-left", goals.revised ? "border-orange-500/30 bg-orange-500/5" : "border-border hover:bg-muted")}>
                        {goals.revised ? <CheckSquare className="w-4 h-4 text-orange-500 shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                        <span className={clsx("font-medium text-xs", goals.revised ? "text-orange-600 dark:text-orange-400" : "text-foreground")}>♻️ Week review / recap done</span>
                      </button>
                      <button onClick={() => handleGoalToggle(week, "mocked")} className={clsx("w-full flex items-center gap-3 p-2.5 rounded border transition text-left", goals.mocked ? "border-purple-500/30 bg-purple-500/5" : "border-border hover:bg-muted")}>
                        {goals.mocked ? <CheckSquare className="w-4 h-4 text-purple-500 shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                        <span className={clsx("font-medium text-xs", goals.mocked ? "text-purple-600 dark:text-purple-400" : "text-foreground")}>🎯 Mock Test Done</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Overdue Tab */}
      {tab === "overdue" && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest px-1">Status for Weeks 1–{currentWeek}</p>
          {Array.from({ length: currentWeek }, (_, i) => i + 1).map(week => {
            const o = weekOverdue[week];
            if (!o || o.total === 0) return null;
            return (
              <div key={week} className={clsx("p-4 rounded-lg border transition-all", o.allDone ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5")}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm">Week {week}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{getWeekDateRange(week)}</span>
                    {week === currentWeek && <span className="text-[9px] font-mono font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase">Current</span>}
                  </div>
                  {o.allDone ? (
                    <span className="text-xs font-mono font-bold text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> No Dues</span>
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                {o.allDone ? (
                  <div className="text-xs font-mono text-green-600 dark:text-green-500 uppercase font-bold tracking-widest">All {o.total} items completed ✓</div>
                ) : (
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    {o.studyLeft > 0 && <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded font-bold">{o.studyLeft} study left</span>}
                    {o.practiceLeft > 0 && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded font-bold">{o.practiceLeft} practice left</span>}
                    {!o.revisionDone && <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded font-bold">Week review pending</span>}
                    {!o.mockDone && <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded font-bold">Mock pending</span>}
                  </div>
                )}
              </div>
            );
          })}
          {currentWeek < 17 && (
            <>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest px-1 pt-4 border-t mt-4">Upcoming Weeks ({currentWeek + 1}–17)</div>
              {Array.from({ length: 17 - currentWeek }, (_, i) => currentWeek + i + 1).map(week => (
                <div key={week} className="p-3 rounded-lg border border-border/50 bg-muted/20 flex justify-between items-center">
                  <div><span className="font-display font-bold text-sm">Week {week}</span><span className="text-[10px] font-mono text-muted-foreground ml-2">{getWeekDateRange(week)}</span></div>
                  <span className="font-mono text-xs text-muted-foreground">{(topicsByWeek[week] || []).length} items</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
