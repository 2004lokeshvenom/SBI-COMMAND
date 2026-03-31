"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Star, CheckCircle2, Circle, BookOpen, Filter } from "lucide-react";
import clsx from "clsx";
import { getAllTopics, markTopicStudied, unmarkTopicStudied, getSubjectProgress } from "@/actions/topics";

const EXAM_FILTERS = [{ label: "All", value: "all" }, { label: "Prelims", value: "prelims" }, { label: "Mains", value: "mains" }];
const SUBJECT_FILTERS = [{ label: "All Subjects", value: "all" }, { label: "Quant", value: "QA" }, { label: "Reasoning", value: "RE" }, { label: "English", value: "EN" }, { label: "GA/Banking", value: "GA" }, { label: "DI", value: "DI" }, { label: "Mocks", value: "MOCK" }, { label: "Revision", value: "REV" }];
const STATUS_COLORS: Record<string, string> = { mastered: "bg-green-500/10 text-green-400 border-green-500/20", revised: "bg-amber-500/10 text-amber-400 border-amber-500/20", studied: "bg-purple-500/10 text-purple-400 border-purple-500/20", in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20", not_started: "bg-white/3 text-muted-foreground border-[rgba(56,189,248,0.15)]" };
const SUBJECT_BORDER: Record<string, string> = { blue: "border-l-blue-500", purple: "border-l-purple-500", green: "border-l-green-500", amber: "border-l-amber-500", cyan: "border-l-cyan-500", slate: "border-l-slate-500", rose: "border-l-rose-500" };

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    const [topicData, progressData] = await Promise.all([getAllTopics(), getSubjectProgress()]);
    setTopics(topicData); setProgress(progressData); setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleToggle = async (topic: any) => {
    if (topic.status !== "not_started") await unmarkTopicStudied(topic.id);
    else await markTopicStudied(topic.id, 2);
    await loadData();
  };
  const handleConfidence = async (topicId: string, confidence: number) => { await markTopicStudied(topicId, confidence); await loadData(); };

  const filteredTopics = topics.filter(t => {
    const s = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.chapter.toLowerCase().includes(searchQuery.toLowerCase());
    const e = examFilter === "all" || t.exam_type === examFilter || t.exam_type === "both";
    const sub = subjectFilter === "all" || t.subjectCode === subjectFilter;
    return s && e && sub;
  });
  const studiedCount = filteredTopics.filter(t => t.status !== "not_started").length;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[rgba(56,189,248,0.15)] pb-4 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight flex items-center gap-3">📚 <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Syllabus Database</span></h1>
          <p className="font-mono text-muted-foreground mt-2 uppercase text-[13px]">{filteredTopics.length} Topics · {studiedCount} Covered · {filteredTopics.length>0?Math.round((studiedCount/filteredTopics.length)*100):0}% Complete</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input type="text" placeholder="Search topics, subjects..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full bg-background border border-[rgba(56,189,248,0.25)] rounded-lg pl-10 pr-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary transition" style={{boxShadow:'0 0 0 1px rgba(56,189,248,0.1), inset 0 0 12px rgba(56,189,248,0.03)'}}/>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {progress.map(sub => (
          <div key={sub.code} className="card-glow p-4">
            <h3 className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase font-semibold mb-2">{sub.name}</h3>
            <div className="font-display font-bold text-2xl text-foreground">{sub.percent}%</div>
            <div className="text-[11px] font-mono text-muted-foreground mb-2">{sub.studied}/{sub.total} topics</div>
            <div className="w-full h-1.5 bg-white/3 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500" style={{width:`${sub.percent}%`}}/></div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-1 text-muted-foreground"><Filter className="w-4 h-4"/><span className="font-mono text-xs uppercase font-bold tracking-widest">Filters:</span></div>
        <div className="flex gap-1.5 bg-white/2 p-1 rounded-lg border border-[rgba(56,189,248,0.15)]">
          {EXAM_FILTERS.map(f => <button key={f.value} onClick={()=>setExamFilter(f.value)} className={clsx("px-3 py-1.5 rounded-md font-mono text-[11px] font-bold tracking-widest uppercase transition",examFilter===f.value?"bg-primary text-primary-foreground shadow":"text-muted-foreground hover:text-foreground")}>{f.label}</button>)}
        </div>
        <div className="flex gap-1.5 bg-white/2 p-1 rounded-lg border border-[rgba(56,189,248,0.15)] flex-wrap">
          {SUBJECT_FILTERS.map(f => <button key={f.value} onClick={()=>setSubjectFilter(f.value)} className={clsx("px-3 py-1.5 rounded-md font-mono text-[11px] font-bold tracking-widest uppercase transition",subjectFilter===f.value?"bg-primary text-primary-foreground shadow":"text-muted-foreground hover:text-foreground")}>{f.label}</button>)}
        </div>
      </div>
      {loading ? (
        <div className="h-48 flex items-center justify-center card-glow font-mono text-muted-foreground uppercase text-[13px]">📚 Loading Syllabus...</div>
      ) : filteredTopics.length === 0 ? (
        <div className="h-48 flex items-center justify-center card-glow font-mono text-muted-foreground uppercase text-[13px]">No topics match your filters.</div>
      ) : (
        <div className="space-y-2">
          {filteredTopics.map(topic => (
            <div key={topic.id} className={clsx("flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-[rgba(56,189,248,0.2)] border-l-4 bg-card/50 hover:bg-white/3 transition gap-3", SUBJECT_BORDER[topic.subjectColor]||"border-l-primary")} style={{boxShadow:'0 0 0 1px rgba(56,189,248,0.06), inset 0 0 12px rgba(56,189,248,0.02)'}}>
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button onClick={()=>handleToggle(topic)} className="mt-0.5 shrink-0">{topic.status!=="not_started"?<CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500"/>:<Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition"/>}</button>
                <div className="min-w-0">
                  <div className="font-medium text-[14px] text-foreground truncate">{topic.name}</div>
                  <div className="flex flex-wrap gap-2 mt-1 items-center">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">{topic.subject}</span>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] font-mono text-muted-foreground">W{topic.week}</span>
                    {topic.priority==="high"&&<span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded uppercase">🔥 High</span>}
                    {topic.exam_type!=="both"&&<span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">{topic.exam_type}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className={clsx("px-2.5 py-1 text-[10px] rounded uppercase font-bold border",STATUS_COLORS[topic.status]||STATUS_COLORS.not_started)}>{topic.status.replace("_"," ")}</span>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(star=><button key={star} onClick={()=>handleConfidence(topic.id,star)} className="p-0.5"><Star className={clsx("w-4 h-4 transition",star<=topic.confidence?"text-orange-400 fill-orange-400":"text-muted-foreground/30 hover:text-orange-300")}/></button>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
