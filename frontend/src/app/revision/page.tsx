"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, RefreshCw, History } from "lucide-react";
import { getOverdueRevisions, markRevisionDone } from "@/actions/revision";
import { getAllTopics } from "@/actions/topics";
import clsx from "clsx";

export default function RevisionPage() {
  const [overdue, setOverdue] = useState<any[]>([]);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => { const [o, t] = await Promise.all([getOverdueRevisions(), getAllTopics()]); setOverdue(o); setAllTopics(t); setLoading(false); };
  useEffect(() => { loadData(); }, []);

  const handleDone = async (topicId: string) => { await markRevisionDone(topicId); await loadData(); };
  const masteredTopics = allTopics.filter(t => t.status === "mastered").length;
  const revisedTopics = allTopics.filter(t => t.status === "revised").length;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-end justify-between border-b pb-4">
        <div><h1 className="font-display text-4xl font-bold tracking-tight flex items-center gap-3"><History className="w-8 h-8 text-primary"/> Revision Queue</h1><p className="font-mono text-muted-foreground mt-2 uppercase text-sm">Spaced repetition system</p></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card"><div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Overdue</div><div className="font-display font-bold text-3xl text-red-500 mt-1">{overdue.length}</div></div>
        <div className="p-4 rounded-lg border bg-card"><div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Mastered</div><div className="font-display font-bold text-3xl text-green-500 mt-1">{masteredTopics}</div></div>
        <div className="p-4 rounded-lg border bg-card"><div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Revised</div><div className="font-display font-bold text-3xl text-orange-500 mt-1">{revisedTopics}</div></div>
      </div>
      {loading ? (
        <div className="h-48 flex items-center justify-center font-mono text-muted-foreground uppercase text-sm">Loading...</div>
      ) : overdue.length === 0 ? (
        <div className="p-8 rounded-lg border bg-card text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
          <h2 className="font-display font-bold text-xl">Revision Queue Clear!</h2>
          <p className="font-mono text-sm text-muted-foreground">All topics are up to date. Keep studying!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {overdue.map(rev => (
            <div key={rev.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition">
              <div>
                <div className="font-medium text-sm text-foreground">{rev.topic}</div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5">{rev.subject}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx("text-[10px] font-mono font-bold px-2 py-1 rounded", rev.days_overdue > 0 ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500")}>{rev.days_overdue > 0 ? `${rev.days_overdue}D overdue` : "Due Today"}</span>
                <button onClick={() => handleDone(rev.topicId)} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded font-mono text-xs font-bold transition"><RefreshCw className="w-3 h-3"/> Done</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
