"use client";
import { useState, useEffect, useMemo } from "react";
import { Flame, CheckCircle2, BarChart2, Moon, Timer, Target, BookOpen, Square, CheckSquare, Star, Sparkles, Plus } from "lucide-react";
import clsx from "clsx";
import { useMissionStore } from "@/store/useMissionStore";
import { getUserStats, addXP } from "@/actions/user";
import { getSubjectProgress, getCurrentWeek, markTopicStudied, unmarkTopicStudied, getAllWeeksData } from "@/actions/topics";
import { getOverdueRevisions } from "@/actions/revision";
import { getUserState, setUserState } from "@/actions/state";
import Link from "next/link";

const DAILY_CHECKLIST = [
  { id: "tables", emoji: "🔢", label: "Tables, Squares, Cubes & Random Calculations" },
  { id: "current_affairs", emoji: "📰", label: "Current Affairs (Daily News)" },
  { id: "static_gk", emoji: "🌍", label: "Static GK (15 min revision)" },
  { id: "editorial", emoji: "📝", label: "Editorial Analysis (The Hindu / IE)" },
  { id: "vocab", emoji: "📖", label: "10 New Words + Usage" },
];

function getWeekDateRange(week: number): string {
  const start = new Date("2026-04-01");
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export default function MissionControl() {
  const [missionAccepted, setMissionAccepted] = useState(false);
  const { openMorningBrief, openNightDebrief } = useMissionStore();
  const [stats, setStats] = useState<any>(null);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<any[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [practiced, setPracticed] = useState<Record<string, boolean>>({});
  const [weekGoals, setWeekGoals] = useState<Record<string, { revised: boolean; mocked: boolean }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const week = await getCurrentWeek();
        setCurrentWeek(week);
        const [userStats, allWeeks, overdueRevs, progress] = await Promise.all([getUserStats(), getAllWeeksData(), getOverdueRevisions(), getSubjectProgress()]);
        setStats(userStats); setAllTopics(allWeeks); setRevisions(overdueRevs); setSubjectProgress(progress);
        // Load persisted state from DB
        const [savedP, savedG] = await Promise.all([
          getUserState("practiced_topics"),
          getUserState("week_goals")
        ]);
        if (savedP) setPracticed(savedP);
        if (savedG) setWeekGoals(savedG);
      } catch (err) { console.error("Failed:", err); } finally { setLoading(false); }
    }
    loadData();
  }, []);

  const savePracticed = (next: Record<string, boolean>) => { setPracticed(next); setUserState("practiced_topics", next); };
  const saveGoals = (next: Record<string, { revised: boolean; mocked: boolean }>) => { setWeekGoals(next); setUserState("week_goals", next); };

  const currentTopics = useMemo(() => allTopics.filter(t => t.week === currentWeek), [allTopics, currentWeek]);
  const goals = weekGoals[`w${currentWeek}`] || { revised: false, mocked: false };
  const handleInitiateBrief = () => { openMorningBrief(); setMissionAccepted(true); };
  const handleTopicToggle = async (topic: any) => {
    if (topic.status === "not_started") await markTopicStudied(topic.id, 2);
    else await unmarkTopicStudied(topic.id);
    const [allWeeks, progress] = await Promise.all([getAllWeeksData(), getSubjectProgress()]);
    setAllTopics(allWeeks); setSubjectProgress(progress);
  };
  const handlePracticeToggle = (id: string) => savePracticed({ ...practiced, [id]: !practiced[id] });
  const handleGoalToggle = (field: "revised" | "mocked") => {
    const key = `w${currentWeek}`;
    const cur = weekGoals[key] || { revised: false, mocked: false };
    saveGoals({ ...weekGoals, [key]: { ...cur, [field]: !cur[field] } });
  };
  const studiedCount = currentTopics.filter(t => t.status !== "not_started").length;
  const practicedCount = currentTopics.filter(t => practiced[t.id]).length;

  if (loading) return <div className="h-[60vh] flex items-center justify-center font-mono text-muted-foreground uppercase text-sm tracking-widest">🔥 Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-20">
      {/* LEFT */}
      <div className="lg:col-span-3 space-y-4">
        <div className="card-glow p-4 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-mono text-[11px] tracking-widest uppercase font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Daily Core Habits</span>
            </h2>
          </div>
          <div className="space-y-2 mt-2">
            {DAILY_CHECKLIST.map(item => (
              <div key={item.id} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5">
                <span className="text-lg shrink-0">{item.emoji}</span>
                <span className="text-[13px] text-foreground/90 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glow p-4 space-y-3">
          <h2 className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase font-semibold">⚡ Protocols</h2>
          {!missionAccepted ? (
            <button onClick={handleInitiateBrief} className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium text-sm rounded-lg transition hover:opacity-90 glow-accent">☀️ Start Morning Brief</button>
          ) : (
            <div className="flex items-center gap-2 text-green-400 font-medium text-sm p-3 bg-green-500/5 rounded-lg border border-green-500/15">
              <CheckCircle2 className="w-4 h-4" /><span>✅ Briefing Done</span>
            </div>
          )}
          <button onClick={openNightDebrief} className="w-full p-2.5 rounded-lg flex items-center justify-center gap-3 card-glow hover:bg-white/3 transition">
            <Moon className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-[11px] tracking-widest uppercase font-semibold">🌙 Night Debrief</span>
          </button>
        </div>

        <div className="card-glow p-4 flex items-center gap-3">
          <Flame className={clsx("w-7 h-7", stats?.streak > 0 ? "text-orange-400" : "text-muted-foreground/30")} />
          <div>
            <div className="font-mono text-[11px] text-muted-foreground tracking-widest uppercase">🔥 Streak</div>
            <div className="font-display font-bold text-xl text-orange-400">{stats ? `${stats.streak} Days` : "--"}</div>
          </div>
        </div>

        <div className="space-y-1.5">
          {[
            { href: "/timer", emoji: "⏱️", label: "Study Timer" },
            { href: "/topics", emoji: "📚", label: "Browse Syllabus" },
            { href: "/mocks", emoji: "🎯", label: "Log Mock Score" },
          ].map(item => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 rounded-xl card-glow hover:bg-white/3 transition">
              <span className="text-sm">{item.emoji}</span>
              <span className="font-mono text-[11px] uppercase font-bold tracking-wider">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CENTER */}
      <div className="lg:col-span-6 space-y-5">
        <div className="card-glow p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-[rgba(56,189,248,0.12)]">
            <div>
              <h2 className="font-mono text-[11px] tracking-widest uppercase font-semibold flex items-center gap-2">
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">📋 Week {currentWeek} — Topics</span>
              </h2>
              <span className="text-[11px] font-mono text-muted-foreground">{getWeekDateRange(currentWeek)}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-[13px] font-mono text-orange-400 font-bold">{studiedCount}/{currentTopics.length} Studied</span>
              <span className="text-[13px] font-mono text-green-400 font-bold">{practicedCount}/{currentTopics.length} Practiced</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-3 py-1.5 text-[11px] font-mono text-muted-foreground uppercase tracking-widest font-semibold">
            <span className="flex-1">Topic</span>
            <div className="flex gap-6 shrink-0"><span className="w-14 text-center">Study</span><span className="w-14 text-center">Practice</span></div>
          </div>

          <div className="space-y-1">
            {currentTopics.map(task => (
              <div key={task.id} className={clsx("flex items-center justify-between p-3 rounded-lg transition group",
                task.status !== "not_started" && practiced[task.id] ? "bg-green-500/3 border border-green-500/15" :
                task.status !== "not_started" ? "bg-orange-500/3 border border-orange-500/15" :
                "hover:bg-white/3 bg-transparent border border-transparent"
              )}>
                <div className="flex-1 min-w-0">
                  <div className={clsx("font-medium text-[14px] transition-colors", task.status !== "not_started" && practiced[task.id] ? "text-green-400/60 line-through" : "text-foreground")}>{task.name}</div>
                  <div className="text-[11px] font-mono text-muted-foreground uppercase mt-0.5">
                    {task.subject}
                    {task.priority === "high" && <span className="ml-2 text-[9px] font-bold text-red-400 bg-red-500/8 px-1.5 py-0.5 rounded">🔥 HIGH</span>}
                  </div>
                </div>
                <div className="flex gap-6 shrink-0">
                  <button onClick={() => handleTopicToggle(task)} className="w-14 flex justify-center">
                    {task.status !== "not_started" ? <CheckSquare className="w-4 h-4 text-orange-400" /> : <Square className="w-4 h-4 text-muted-foreground/25 group-hover:text-orange-400/40 transition" />}
                  </button>
                  <button onClick={() => handlePracticeToggle(task.id)} className="w-14 flex justify-center">
                    {practiced[task.id] ? <CheckSquare className="w-4 h-4 text-green-400" /> : <Square className="w-4 h-4 text-muted-foreground/25 group-hover:text-green-400/40 transition" />}
                  </button>
                </div>
              </div>
            ))}
            {currentTopics.length === 0 && <div className="py-8 text-center text-muted-foreground font-mono text-sm">No topics scheduled this week.</div>}
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(56,189,248,0.12)] space-y-1.5">
            <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest font-semibold mb-2">🎯 Week {currentWeek} Goals</div>
            <button onClick={() => handleGoalToggle("revised")} className={clsx("w-full flex items-center gap-3 p-2.5 rounded-lg transition", goals.revised ? "bg-amber-500/5 border border-amber-500/15" : "card-glow hover:bg-white/3")}>
              {goals.revised ? <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground/25 shrink-0" />}
              <span className={clsx("font-medium text-[14px]", goals.revised ? "text-amber-400" : "text-foreground")}>♻️ Revision Complete</span>
            </button>
            <button onClick={() => handleGoalToggle("mocked")} className={clsx("w-full flex items-center gap-3 p-2.5 rounded-lg transition", goals.mocked ? "bg-purple-500/5 border border-purple-500/15" : "card-glow hover:bg-white/3")}>
              {goals.mocked ? <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground/25 shrink-0" />}
              <span className={clsx("font-medium text-[14px]", goals.mocked ? "text-purple-400" : "text-foreground")}>🎯 Mock Test Done</span>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="lg:col-span-3 space-y-4">
        <div className="card-glow p-4">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[rgba(56,189,248,0.12)]">
            <h2 className="font-mono text-[11px] tracking-widest uppercase font-bold flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-orange-400" />
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Subject Progress</span>
            </h2>
          </div>
          <div className="space-y-3.5">
            {subjectProgress.map(sub => (
              <div key={sub.code}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-[13px] text-foreground">{sub.name}</span>
                  <span className="text-muted-foreground font-mono text-[11px] font-bold">{sub.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/3 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: `${sub.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glow p-4">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-[rgba(56,189,248,0.12)]">
            <h2 className="font-mono text-[11px] text-red-400 tracking-widest uppercase font-bold">⚠️ Overdue</h2>
            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono text-[11px] font-bold">{revisions.length}</span>
          </div>
          <div className="space-y-2.5">
            {revisions.slice(0, 4).map(rev => (
              <div key={rev.id} className="flex justify-between items-center">
                <div className="min-w-0">
                  <div className="text-[14px] font-medium truncate max-w-[140px]">{rev.topic}</div>
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">{rev.subject}</div>
                </div>
                <span className={clsx("text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0",
                  rev.days_overdue > 0 ? "bg-red-500/10 text-red-400" : "bg-amber-500/10 text-amber-400"
                )}>{rev.days_overdue > 0 ? `${rev.days_overdue}D` : "TODAY"}</span>
              </div>
            ))}
            {revisions.length === 0 && <div className="text-center font-mono text-[13px] text-green-400 py-3 uppercase font-bold tracking-widest">✅ Queue Clear</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
