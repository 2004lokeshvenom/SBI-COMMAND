"use client";
import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, Square, CheckSquare, ChevronDown, ChevronRight, AlertTriangle, CalendarCheck } from "lucide-react";
import clsx from "clsx";
import { getCurrentWeek, markTopicStudied, unmarkTopicStudied, getAllWeeksData } from "@/actions/topics";
import { getUserState, setUserState } from "@/actions/state";

function getWeekDateRange(week: number): string {
  const start = new Date("2026-04-01");
  start.setDate(start.getDate() + (week - 1) * 7);
  const end = new Date(start); end.setDate(end.getDate() + 6);
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
      const week = await getCurrentWeek();
      setCurrentWeek(week);
      const data = await getAllWeeksData();
      setAllTopics(data);
      setExpandedWeeks({ [week]: true });
      const [savedP, savedG] = await Promise.all([getUserState("practiced_topics"), getUserState("week_goals")]);
      if (savedP) setPracticed(savedP);
      if (savedG) setWeekGoals(savedG);
      setLoading(false);
    }
    load();
  }, []);

  const savePracticed = (next: Record<string, boolean>) => { setPracticed(next); setUserState("practiced_topics", next); };
  const saveGoals = (next: Record<string, { revised: boolean; mocked: boolean }>) => { setWeekGoals(next); setUserState("week_goals", next); };
  const topicsByWeek = useMemo(() => { const m: Record<number,any[]> = {}; for(let w=1;w<=17;w++) m[w]=[]; allTopics.forEach(t=>{if(m[t.week])m[t.week].push(t);}); return m; }, [allTopics]);
  const weekOverdue = useMemo(() => {
    const r: Record<number,any> = {};
    for(let w=1;w<=17;w++){const wt=topicsByWeek[w]||[];const sl=wt.filter(t=>t.status==="not_started").length;const pl=wt.filter(t=>!practiced[t.id]).length;const g=weekGoals[`w${w}`]||{revised:false,mocked:false};r[w]={studyLeft:sl,practiceLeft:pl,revisionDone:g.revised,mockDone:g.mocked,total:wt.length,allDone:sl===0&&pl===0&&g.revised&&g.mocked};}
    return r;
  }, [topicsByWeek, practiced, weekGoals]);

  const handleTopicToggle = async (topic: any) => {
    if (topic.status === "not_started") await markTopicStudied(topic.id, 2);
    else await unmarkTopicStudied(topic.id);
    setAllTopics(await getAllWeeksData());
  };
  const toggleWeek = (w: number) => setExpandedWeeks(prev => ({ ...prev, [w]: !prev[w] }));

  if (loading) return <div className="h-48 flex items-center justify-center font-mono text-muted-foreground uppercase text-sm">Loading Schedule...</div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4 border-b border-[rgba(56,189,248,0.15)] pb-3">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">📅 <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Full Schedule</span></h1>
        <div className="flex gap-1.5 bg-white/2 p-1 rounded-lg border border-[rgba(56,189,248,0.15)] ml-auto">
          <button onClick={() => setTab("schedule")} className={clsx("px-4 py-2 rounded-md font-mono text-[11px] font-bold tracking-widest uppercase transition", tab==="schedule" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}>All Weeks</button>
          <button onClick={() => setTab("overdue")} className={clsx("px-4 py-2 rounded-md font-mono text-[11px] font-bold tracking-widest uppercase transition", tab==="overdue" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}>Overdue Tracker</button>
        </div>
      </div>

      {tab === "schedule" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Week {currentWeek} of 17 · {getWeekDateRange(currentWeek)}</p>
            <div className="flex gap-2">
              <button onClick={() => { const a:Record<number,boolean>={}; for(let w=1;w<=17;w++) a[w]=true; setExpandedWeeks(a); }} className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest hover:underline">Expand All</button>
              <span className="text-muted-foreground">·</span>
              <button onClick={() => setExpandedWeeks({ [currentWeek]: true })} className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest hover:underline">Collapse</button>
            </div>
          </div>
          {Array.from({length:17},(_,i)=>i+1).map(week => {
            const topics = topicsByWeek[week]||[]; const isOpen=expandedWeeks[week]; const isCurrent=week===currentWeek; const isPast=week<currentWeek; const o=weekOverdue[week]; const g=weekGoals[`w${week}`]||{revised:false,mocked:false};
            const studied=topics.filter(t=>t.status!=="not_started").length; const prac=topics.filter(t=>practiced[t.id]).length;
            return (
              <div key={week} className={clsx("rounded-xl transition-all", isCurrent?"card-glow border-sky-500/25 bg-sky-500/5":isPast&&!o.allDone?"card-glow border-red-500/20 bg-red-500/5":isPast&&o.allDone?"card-glow border-green-500/20 bg-green-500/5":"card-glow opacity-60 border-white/5 bg-white/5")}>
                <button onClick={()=>toggleWeek(week)} className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0"/> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0"/>}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={clsx("font-display font-bold text-sm",isCurrent?"text-primary":"text-foreground")}>Week {week}</span>
                        {isCurrent && <span className="text-[9px] font-mono font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase animate-pulse">Current</span>}
                        {isPast && o.allDone && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0"/>}
                        {isPast && !o.allDone && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0"/>}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{getWeekDateRange(week)} · {topics.length} items</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right"><div className="text-[10px] font-mono text-primary font-bold">{studied}/{topics.length}</div><div className="text-[10px] font-mono text-green-600 dark:text-green-500 font-bold">{prac}/{topics.length}</div></div>
                    <div className="w-16 h-1.5 bg-white/3 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 rounded-full" style={{width:`${topics.length>0?Math.round((studied/topics.length)*100):0}%`}}/></div>
                  </div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-1 border-t border-[rgba(56,189,248,0.1)]">
                    <div className="flex items-center justify-between px-3 py-2 text-[11px] font-mono text-muted-foreground uppercase tracking-widest font-semibold"><span className="flex-1">Topic</span><div className="flex gap-6 shrink-0"><span className="w-16 text-center">Studied</span><span className="w-16 text-center">Practice</span></div></div>
                    {topics.map((t:any) => (
                      <div key={t.id} className={clsx("flex items-center justify-between p-3 rounded-lg transition group",t.status!=="not_started"&&practiced[t.id]?"bg-green-500/3 border border-green-500/15":t.status!=="not_started"?"bg-orange-500/3 border border-orange-500/15":"hover:bg-white/3 bg-transparent border border-transparent")}>
                        <div className="flex-1 min-w-0"><div className={clsx("font-medium text-[14px] truncate",t.status!=="not_started"&&practiced[t.id]?"text-green-400 line-through opacity-60":"text-foreground")}>{t.name}</div><div className="text-[11px] font-mono text-muted-foreground uppercase mt-0.5">{t.subject}{t.priority==="high"&&<span className="ml-2 text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">🔥 HIGH</span>}</div></div>
                        <div className="flex gap-6 shrink-0">
                          <button onClick={()=>handleTopicToggle(t)} className="w-16 flex justify-center">{t.status!=="not_started"?<CheckSquare className="w-5 h-5 text-primary"/>:<Square className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary/60 transition"/>}</button>
                          <button onClick={()=>savePracticed({...practiced,[t.id]:!practiced[t.id]})} className="w-16 flex justify-center">{practiced[t.id]?<CheckSquare className="w-5 h-5 text-green-600"/>:<Square className="w-5 h-5 text-muted-foreground/40 group-hover:text-green-500/60 transition"/>}</button>
                        </div>
                      </div>
                    ))}
                    {topics.length===0 && <div className="py-4 text-center text-muted-foreground font-mono text-sm">No topics scheduled.</div>}
                    <div className="mt-3 pt-3 border-t border-[rgba(56,189,248,0.1)] space-y-2">
                      <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">🎯 Week {week} Goals</div>
                      <button onClick={()=>{const key=`w${week}`;const cur=weekGoals[key]||{revised:false,mocked:false};saveGoals({...weekGoals,[key]:{...cur,revised:!cur.revised}});}} className={clsx("w-full flex items-center gap-3 p-2.5 rounded-lg transition text-left",g.revised?"bg-amber-500/5 border border-amber-500/15":"card-glow hover:bg-white/3")}>
                        {g.revised?<CheckSquare className="w-4 h-4 text-amber-400 shrink-0"/>:<Square className="w-4 h-4 text-muted-foreground/25 shrink-0"/>}
                        <span className={clsx("font-medium text-[13px]",g.revised?"text-amber-400":"text-foreground")}>♻️ Revision Complete</span>
                      </button>
                      <button onClick={()=>{const key=`w${week}`;const cur=weekGoals[key]||{revised:false,mocked:false};saveGoals({...weekGoals,[key]:{...cur,mocked:!cur.mocked}});}} className={clsx("w-full flex items-center gap-3 p-2.5 rounded-lg transition text-left",g.mocked?"bg-purple-500/5 border border-purple-500/15":"card-glow hover:bg-white/3")}>
                        {g.mocked?<CheckSquare className="w-4 h-4 text-purple-400 shrink-0"/>:<Square className="w-4 h-4 text-muted-foreground/25 shrink-0"/>}
                        <span className={clsx("font-medium text-[13px]",g.mocked?"text-purple-400":"text-foreground")}>🎯 Mock Test Done</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "overdue" && (
        <div className="space-y-3">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest px-1">Status for Weeks 1–{currentWeek}</p>
          {Array.from({length:currentWeek},(_,i)=>i+1).map(week => {
            const o=weekOverdue[week]; if(!o||o.total===0) return null;
            const isCurrent = week === currentWeek;
            
            const containerClass = isCurrent
              ? "p-4 rounded-lg border transition-all border-sky-500/20 bg-sky-500/5"
              : o.allDone
                ? "p-4 rounded-lg border transition-all border-green-500/20 bg-green-500/5"
                : "p-4 rounded-lg border transition-all border-red-500/20 bg-red-500/5";

            return (
              <div key={week} className={containerClass}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm">Week {week}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{getWeekDateRange(week)}</span>
                    {isCurrent && <span className="text-[9px] font-mono font-bold bg-sky-500 text-white px-1.5 py-0.5 rounded uppercase">Current</span>}
                  </div>
                  {!isCurrent ? (
                    o.allDone 
                      ? <span className="text-xs font-mono font-bold text-green-600 dark:text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> No Dues</span> 
                      : <span className="text-xs font-mono font-bold text-red-500 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Overdue</span>
                  ) : (
                    <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1">In Progress</span>
                  )}
                </div>
                
                {o.allDone && !isCurrent ? (
                  <div className="text-xs font-mono text-green-600 dark:text-green-500 uppercase font-bold">All {o.total} items completed ✓</div>
                ) : (
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    {/* Items pending */}
                    {o.studyLeft>0 && <span className={clsx("px-2 py-1 rounded font-bold", isCurrent ? "bg-white/10 text-foreground/80" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400")}>{o.studyLeft} study left</span>}
                    {o.practiceLeft>0 && <span className={clsx("px-2 py-1 rounded font-bold", isCurrent ? "bg-white/10 text-foreground/80" : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400")}>{o.practiceLeft} practice left</span>}
                    {!o.revisionDone && <span className={clsx("px-2 py-1 rounded font-bold", isCurrent ? "bg-white/10 text-foreground/80" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400")}>Revision pending</span>}
                    {!o.mockDone && <span className={clsx("px-2 py-1 rounded font-bold", isCurrent ? "bg-white/10 text-foreground/80" : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400")}>Mock pending</span>}
                  </div>
                )}
              </div>
            );
          })}
          {currentWeek<17&&<><div className="font-mono text-xs text-muted-foreground uppercase tracking-widest px-1 pt-4 border-t mt-4">Upcoming Weeks ({currentWeek+1}–17)</div>{Array.from({length:17-currentWeek},(_,i)=>currentWeek+i+1).map(week=><div key={week} className="p-3 rounded-lg bg-white/5 border border-white/10 opacity-50 flex justify-between items-center"><div><span className="font-display font-bold text-sm text-foreground/60">Week {week}</span><span className="text-[10px] font-mono text-muted-foreground ml-2">{getWeekDateRange(week)}</span></div><span className="font-mono text-xs text-muted-foreground">{(topicsByWeek[week]||[]).length} items</span></div>)}</>}
        </div>
      )}
    </div>
  );
}
