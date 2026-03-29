"use client";

import { useState, useEffect, useMemo } from "react";
import { Flame, BarChart2, Moon, Timer, Target, BookOpen, Square, CheckSquare, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { useMissionStore } from "@/store/useMissionStore";
import { getUserStats } from "@/actions/user";
import { getSubjectProgress, getCurrentWeek, markTopicStudied, unmarkTopicStudied, getAllWeeksData } from "@/actions/topics";
import Link from "next/link";
import { loadJsonState, saveJsonState } from "@/lib/clientState";

function getWeekDateRange(week: number): string {
  const start = new Date("2026-04-01");
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function MissionControl() {
  const { openMorningBrief, openNightDebrief } = useMissionStore();

  const [stats, setStats] = useState<any>(null);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);

  // Practice state stored in localStorage (per topic)
  const [practiced, setPracticed] = useState<Record<string, boolean>>({});
  const [weekGoals, setWeekGoals] = useState<Record<string, { revised: boolean; mocked: boolean }>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const week = await getCurrentWeek();
        setCurrentWeek(week);
        const [userStats, allWeeks, progress] = await Promise.all([
          getUserStats(),
          getAllWeeksData(),
          getSubjectProgress(),
        ]);
        setStats(userStats);
        setAllTopics(allWeeks);
        setSubjectProgress(progress);

        const [p, g] = await Promise.all([
          loadJsonState<Record<string, boolean>>("practiced_topics", {}),
          loadJsonState<Record<string, { revised: boolean; mocked: boolean }>>("week_goals", {}),
        ]);
        setPracticed(p);
        setWeekGoals(g);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
    }
    loadData();
  }, []);

  const savePracticed = (next: Record<string, boolean>) => {
    setPracticed(next);
    void saveJsonState("practiced_topics", next);
  };
  const saveGoals = (next: Record<string, { revised: boolean; mocked: boolean }>) => {
    setWeekGoals(next);
    void saveJsonState("week_goals", next);
  };

  // Only current week topics
  const currentTopics = useMemo(() =>
    allTopics.filter(t => t.week === currentWeek),
    [allTopics, currentWeek]
  );

  const goals = weekGoals[`w${currentWeek}`] || { revised: false, mocked: false };

  const handleTopicToggle = async (topic: any) => {
    if (topic.status === "not_started") {
      await markTopicStudied(topic.id, 2);
    } else {
      await unmarkTopicStudied(topic.id);
    }
    const [allWeeks, progress] = await Promise.all([getAllWeeksData(), getSubjectProgress()]);
    setAllTopics(allWeeks);
    setSubjectProgress(progress);
  };

  const handlePracticeToggle = (topicId: string) => {
    const next = { ...practiced, [topicId]: !practiced[topicId] };
    savePracticed(next);
  };

  const handleGoalToggle = (field: "revised" | "mocked") => {
    const key = `w${currentWeek}`;
    const cur = weekGoals[key] || { revised: false, mocked: false };
    const next = { ...weekGoals, [key]: { ...cur, [field]: !cur[field] } };
    saveGoals(next);
  };

  const studiedCount = currentTopics.filter(t => t.status !== "not_started").length;
  const practicedCount = currentTopics.filter(t => practiced[t.id]).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">

      {/* 1. LEFT COLUMN — STATUS PANEL */}
      <div className="md:col-span-3 space-y-6">

        {/* Morning / Night Protocols */}
        <div className="p-5 rounded-lg border bg-card text-card-foreground shadow-sm space-y-3">
          <h2 className="font-mono text-xs text-muted-foreground mb-1 tracking-widest uppercase font-semibold">Daily Protocols</h2>
          <button
            onClick={openMorningBrief}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded transition-colors hover:bg-primary/90 shadow-sm"
          >
            ☀️ Morning Brief
          </button>
          <button onClick={openNightDebrief} className="w-full p-3 rounded flex items-center justify-center gap-3 border bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors group">
            <Moon className="w-4 h-4 group-hover:text-primary transition-colors" />
            <span className="font-mono text-xs tracking-widest uppercase font-semibold">Night Debrief</span>
          </button>
        </div>

        {/* Current Streak */}
        <div className="p-5 rounded-lg border bg-card text-card-foreground flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Flame className={clsx("w-8 h-8", stats?.streak > 0 ? "text-orange-500" : "text-muted")} />
            <div>
              <div className="font-mono text-xs text-muted-foreground tracking-wider uppercase">Study Streak</div>
              <div className="font-display font-medium text-2xl">{stats ? `${stats.streak} Days` : "--"}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h2 className="font-mono text-xs text-muted-foreground tracking-widest uppercase font-semibold px-1">Quick Actions</h2>
          <Link href="/timer" className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition shadow-sm">
            <Timer className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs uppercase font-bold tracking-wider">Start Study Timer</span>
          </Link>
          <Link href="/topics" className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition shadow-sm">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs uppercase font-bold tracking-wider">Browse Syllabus</span>
          </Link>
          <Link href="/mocks" className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition shadow-sm">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-mono text-xs uppercase font-bold tracking-wider">Log Mock Score</span>
          </Link>
        </div>
      </div>

      {/* 2. CENTER COLUMN — CURRENT WEEK ONLY */}
      <div className="md:col-span-6 space-y-6">
        <div className="p-5 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
            <div>
              <h2 className="font-mono text-xs text-muted-foreground tracking-widest uppercase font-semibold">
                Week {currentWeek} — Topics to Cover
              </h2>
              <span className="text-[10px] font-mono text-muted-foreground">{getWeekDateRange(currentWeek)}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-xs font-mono text-primary font-bold">{studiedCount}/{currentTopics.length} Studied</span>
              <span className="text-xs font-mono text-green-600 dark:text-green-500 font-bold">{practicedCount}/{currentTopics.length} Practiced</span>
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest font-semibold">
            <span className="flex-1">Topic</span>
            <div className="flex gap-6 shrink-0">
              <span className="w-16 text-center">Studied</span>
              <span className="w-16 text-center">Practice</span>
            </div>
          </div>

          <div className="space-y-1">
            {currentTopics.map((task) => (
              <div
                key={task.id}
                className={clsx(
                  "flex items-center justify-between p-3 border rounded transition group",
                  task.status !== "not_started" && practiced[task.id]
                    ? "border-green-500/30 bg-green-500/5"
                    : task.status !== "not_started"
                    ? "border-primary/20 bg-primary/5"
                    : "hover:bg-muted bg-background border-border"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className={clsx(
                    "font-medium text-sm transition-colors truncate",
                    task.status !== "not_started" && practiced[task.id]
                      ? "text-green-700 dark:text-green-400 line-through opacity-60"
                      : "text-foreground"
                  )}>
                    {task.name}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground uppercase mt-0.5">
                    {task.subject}
                    {task.priority === "high" && (
                      <span className="ml-2 text-[9px] font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">HIGH</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-6 shrink-0">
                  <button onClick={() => handleTopicToggle(task)} className="w-16 flex justify-center" title={task.status === "not_started" ? "Mark as studied" : "Untick"}>
                    {task.status !== "not_started" ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/60 transition" />
                    )}
                  </button>
                  <button onClick={() => handlePracticeToggle(task.id)} className="w-16 flex justify-center" title={practiced[task.id] ? "Unmark practice" : "Mark practiced"}>
                    {practiced[task.id] ? (
                      <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-500" />
                    ) : (
                      <Square className="w-5 h-5 text-muted-foreground/40 group-hover:text-green-500/60 transition" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {currentTopics.length === 0 && (
              <div className="py-8 text-center text-muted-foreground font-mono text-sm">
                No topics scheduled for this week.
              </div>
            )}
          </div>

          {/* Week-level goals */}
          <div className="mt-5 pt-4 border-t border-border space-y-2">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-3">
              Week {currentWeek} Goals
            </div>
            <button onClick={() => handleGoalToggle("revised")} className={clsx("w-full flex items-center gap-3 p-3 rounded border transition", goals.revised ? "border-orange-500/30 bg-orange-500/5" : "border-border hover:bg-muted")}>
              {goals.revised ? <CheckSquare className="w-5 h-5 text-orange-500 shrink-0" /> : <Square className="w-5 h-5 text-muted-foreground/40 shrink-0" />}
              <span className={clsx("font-medium text-sm", goals.revised ? "text-orange-600 dark:text-orange-400" : "text-foreground")}>♻️ Week {currentWeek} review / notes recap done</span>
            </button>
            <button onClick={() => handleGoalToggle("mocked")} className={clsx("w-full flex items-center gap-3 p-3 rounded border transition", goals.mocked ? "border-purple-500/30 bg-purple-500/5" : "border-border hover:bg-muted")}>
              {goals.mocked ? <CheckSquare className="w-5 h-5 text-purple-500 shrink-0" /> : <Square className="w-5 h-5 text-muted-foreground/40 shrink-0" />}
              <span className={clsx("font-medium text-sm", goals.mocked ? "text-purple-600 dark:text-purple-400" : "text-foreground")}>🎯 Week {currentWeek} Mock Test Done</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN — ANALYTICS */}
      <div className="md:col-span-3 space-y-6">
        {/* Subject Progress */}
        <div className="p-5 rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-border pb-2">
            <h2 className="font-mono text-xs text-muted-foreground tracking-widest uppercase font-bold">Subject Readiness</h2>
            <BarChart2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {subjectProgress.map((sub) => (
              <div key={sub.code}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-semibold text-xs uppercase tracking-wider">{sub.name}</span>
                  <span className="text-muted-foreground font-mono text-xs font-bold">{sub.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${sub.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-lg border bg-card text-card-foreground shadow-sm space-y-3">
          <h2 className="font-mono text-xs text-muted-foreground tracking-widest uppercase font-bold border-b border-border pb-2">
            Jump back in
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Use the schedule for week-by-week dues. Syllabus has filters by subject; mocks and notes sync in the cloud when the API is configured.
          </p>
          <Link href="/schedule" className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition text-sm font-medium">
            <span>Full schedule &amp; overdue tracker</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
          <Link href="/topics" className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition text-sm font-medium">
            <span>Syllabus &amp; confidence tags</span>
            <ArrowRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </div>
    </div>
  );
}
