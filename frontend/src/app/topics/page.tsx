"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Star, CheckCircle2, Circle, BookOpen, Filter } from "lucide-react";
import clsx from "clsx";
import { getAllTopics, markTopicStudied, unmarkTopicStudied, getSubjectProgress } from "@/actions/topics";

const EXAM_FILTERS = [
  { label: "All", value: "all" },
  { label: "Prelims", value: "prelims" },
  { label: "Mains", value: "mains" },
];

const SUBJECT_FILTERS = [
  { label: "All Subjects", value: "all" },
  { label: "Quant", value: "QA" },
  { label: "Reasoning", value: "RE" },
  { label: "English", value: "EN" },
  { label: "GA/Banking", value: "GA" },
  { label: "Mocks", value: "MOCK" },
  { label: "Revision", value: "REV" },
];

const STATUS_COLORS: Record<string, string> = {
  mastered: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
  revised: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
  studied: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  not_started: "bg-muted text-muted-foreground border-border",
};

const SUBJECT_BORDER: Record<string, string> = {
  blue: "border-l-blue-500",
  purple: "border-l-purple-500",
  green: "border-l-green-500",
  red: "border-l-red-500",
  orange: "border-l-orange-500",
  cyan: "border-l-cyan-500",
};

export default function TopicsPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [examFilter, setExamFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [topicData, progressData] = await Promise.all([
        getAllTopics(), // Fetch ALL data at once
        getSubjectProgress()
      ]);
      setTopics(topicData);
      setProgress(progressData);
    } catch (err) {
      console.error("Failed to load topics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleConfidence = async (topicId: string, confidence: number) => {
    await markTopicStudied(topicId, confidence);
    await loadData();
  };

  const handleToggle = async (topic: any) => {
    if (topic.status !== "not_started") {
      await unmarkTopicStudied(topic.id);
    } else {
      await markTopicStudied(topic.id, 2);
    }
    await loadData();
  };

  const filteredTopics = topics.filter((t) => {
    // 1. Text Search
    const searchMatch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.chapter.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 2. Exam Filter
    const examMatch = examFilter === "all" || t.exam_type === examFilter || t.exam_type === "both";
    
    // 3. Subject Filter
    const subjectMatch = subjectFilter === "all" || t.subjectCode === subjectFilter;
    
    return searchMatch && examMatch && subjectMatch;
  });

  const totalTopics = filteredTopics.length;
  const studiedCount = filteredTopics.filter(t => t.status !== "not_started").length;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-4 gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" /> Syllabus Database
          </h1>
          <p className="font-mono text-muted-foreground mt-2 uppercase text-sm">
            {totalTopics} Topics · {studiedCount} Covered · {totalTopics > 0 ? Math.round((studiedCount / totalTopics) * 100) : 0}% Complete
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search topics, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition shadow-sm"
          />
        </div>
      </div>

      {/* Subject Progress Bars */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {progress.map((sub) => (
          <div key={sub.code} className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
            <h3 className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase font-semibold mb-2">{sub.name}</h3>
            <div className="font-display font-bold text-2xl text-foreground">{sub.percent}%</div>
            <div className="text-[10px] font-mono text-muted-foreground mb-2">{sub.studied}/{sub.total} topics</div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${sub.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span className="font-mono text-xs uppercase font-bold tracking-widest">Filters:</span>
        </div>
        <div className="flex gap-1.5 bg-muted/50 p-1 rounded-lg border">
          {EXAM_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setExamFilter(f.value)}
              className={clsx(
                "px-3 py-1.5 rounded-md font-mono text-[10px] font-bold tracking-widest uppercase transition",
                examFilter === f.value ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 bg-muted/50 p-1 rounded-lg border">
          {SUBJECT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setSubjectFilter(f.value)}
              className={clsx(
                "px-3 py-1.5 rounded-md font-mono text-[10px] font-bold tracking-widest uppercase transition",
                subjectFilter === f.value ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topics List */}
      {loading ? (
        <div className="h-48 flex items-center justify-center border rounded-lg bg-card font-mono text-muted-foreground uppercase text-sm">
          Loading Syllabus...
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="h-48 flex items-center justify-center border rounded-lg bg-card font-mono text-muted-foreground uppercase text-sm">
          No topics match your filters.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={clsx(
                "flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border border-l-4 bg-card shadow-sm hover:bg-muted/30 transition gap-3",
                SUBJECT_BORDER[topic.subjectColor] || "border-l-primary"
              )}
            >
              {/* Left: Topic Info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  onClick={() => handleToggle(topic)}
                  className="mt-0.5 shrink-0"
                  title={topic.status === "not_started" ? "Mark as studied" : "Untick — reset to not started"}
                >
                  {topic.status !== "not_started" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition" />
                  )}
                </button>
                <div className="min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{topic.name}</div>
                  <div className="flex flex-wrap gap-2 mt-1 items-center">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{topic.subject}</span>
                    <span className="text-[10px] text-muted-foreground">·</span>
                    <span className="text-[10px] font-mono text-muted-foreground">W{topic.week}</span>
                    {topic.priority === "high" && (
                      <span className="text-[9px] font-mono font-bold text-red-600 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded uppercase">High Priority</span>
                    )}
                    {topic.exam_type !== "both" && (
                      <span className="text-[9px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">{topic.exam_type}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Status + Confidence */}
              <div className="flex items-center gap-4 shrink-0">
                <span className={clsx("px-2.5 py-1 text-[10px] rounded uppercase font-bold border", STATUS_COLORS[topic.status] || STATUS_COLORS.not_started)}>
                  {topic.status.replace("_", " ")}
                </span>

                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleConfidence(topic.id, star)}
                      className="p-0.5"
                      title={`Set confidence to ${star}`}
                    >
                      <Star
                        className={clsx(
                          "w-4 h-4 transition",
                          star <= topic.confidence
                            ? "text-orange-400 fill-orange-400"
                            : "text-muted-foreground/30 hover:text-orange-300"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
