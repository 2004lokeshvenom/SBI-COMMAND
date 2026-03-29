"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMissionStore } from "@/store/useMissionStore";
import { X, ChevronRight, ArrowUpCircle } from "lucide-react";
import clsx from "clsx";
import { completeNightDebrief, getUserStats } from "@/actions/user";
import { getTodaysTopics, getCurrentWeek, getSubjectProgress } from "@/actions/topics";

export function NightDebriefModal() {
  const { isNightDebriefOpen, closeNightDebrief } = useMissionStore();
  const [step, setStep] = useState(1);
  const [difficultyRating, setDifficultyRating] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [learned, setLearned] = useState("");
  const [improve, setImprove] = useState("");

  const [stats, setStats] = useState<any>(null);
  const [topicsDone, setTopicsDone] = useState(0);
  const [totalTopics, setTotalTopics] = useState(0);
  const [overallPercent, setOverallPercent] = useState(0);

  useEffect(() => {
    if (!isNightDebriefOpen) return;
    async function loadDebriefData() {
      try {
        const [userStats, week, progress] = await Promise.all([
          getUserStats(),
          getCurrentWeek(),
          getSubjectProgress()
        ]);
        const topics = await getTodaysTopics(week);
        setStats(userStats);
        setTopicsDone(topics.filter((t: any) => t.status !== "not_started").length);
        setTotalTopics(topics.length);
        const totalStudied = progress.reduce((a: number, b: any) => a + b.studied, 0);
        const totalAll = progress.reduce((a: number, b: any) => a + b.total, 0);
        setOverallPercent(totalAll > 0 ? Math.round((totalStudied / totalAll) * 100) : 0);
      } catch (err) {
        console.error("Failed to load debrief data:", err);
      }
    }
    loadDebriefData();
    setStep(1);
  }, [isNightDebriefOpen]);

  if (!isNightDebriefOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleCompleteMission = async () => {
    await completeNightDebrief(mood || "Neutral", learned, improve, difficultyRating);
    closeNightDebrief();
    window.location.reload();
  };

  const difficultyLevels = ["Easy", "Normal", "Hard", "Brutal"];
  const moods = ["Confident", "Neutral", "Struggling", "Burned Out"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-lg relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border">
            <h2 className="font-display tracking-widest text-primary font-bold text-xl uppercase">
              Night Debrief
            </h2>
            <button onClick={closeNightDebrief} className="text-muted-foreground hover:text-foreground transition rounded-full p-1 hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper */}
          <div className="flex px-6 pt-4 gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={clsx("h-1 flex-1 rounded-full", step >= s ? "bg-primary" : "bg-muted")} />
            ))}
          </div>

          <div className="p-8 pb-10 min-h-[350px]">
            {/* Step 1: DEBRIEF — real data */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h3 className="font-display text-3xl font-bold mb-2 text-foreground">End of Day Report</h3>
                  <p className="text-muted-foreground mt-2 text-sm font-medium">Here&apos;s what you accomplished today.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="border border-border bg-muted/30 p-4 rounded-lg text-center">
                    <div className="text-[10px] text-muted-foreground font-mono tracking-wider mb-2 uppercase font-semibold">Topics Done</div>
                    <div className="font-display text-2xl font-bold text-foreground">{topicsDone}/{totalTopics}</div>
                  </div>
                  <div className="border border-orange-200 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg text-center">
                    <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono tracking-wider mb-2 uppercase font-semibold">Overall Progress</div>
                    <div className="font-display text-xl font-bold text-orange-600 dark:text-orange-500">{overallPercent}%</div>
                    <div className="text-[10px] text-muted-foreground mt-1">syllabus</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: REFLECTION LOG */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="font-display text-2xl font-bold text-foreground mb-6">Reflection Log</h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-mono tracking-wider text-muted-foreground mb-3 font-semibold uppercase">Difficulty</label>
                    <div className="flex flex-col gap-2">
                      {difficultyLevels.map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setDifficultyRating(lvl)}
                          className={clsx(
                            "py-2 px-4 rounded-md border text-left font-mono text-sm font-medium transition-all",
                            difficultyRating === lvl ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-mono tracking-wider text-muted-foreground mb-3 font-semibold uppercase">Mood</label>
                    <div className="flex flex-col gap-2">
                      {moods.map((m) => (
                        <button
                          key={m}
                          onClick={() => setMood(m)}
                          className={clsx(
                            "py-2 px-4 rounded-md border text-left font-mono text-sm font-medium transition-all",
                            mood === m ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-muted-foreground mb-2 font-semibold uppercase">One Thing Learned</label>
                    <input type="text" value={learned} onChange={(e) => setLearned(e.target.value)} className="w-full bg-background border border-border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-muted-foreground mb-2 font-semibold uppercase">Improve Tomorrow</label>
                    <input type="text" value={improve} onChange={(e) => setImprove(e.target.value)} className="w-full bg-background border border-border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: SUCCESS */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center">
                <ArrowUpCircle className="w-16 h-16 text-green-600 dark:text-green-500 mx-auto mb-4" />
                <h3 className="font-display text-3xl font-bold mb-2 text-foreground uppercase tracking-wide">Day Complete</h3>

                <div className="font-mono text-lg font-medium text-green-700 dark:text-green-400 mb-6 uppercase">
                  +1 Day Added to Streak
                </div>

                <div className="border border-border bg-muted/50 p-6 rounded-lg text-left mt-8">
                  <h4 className="font-mono text-xs text-muted-foreground tracking-widest mb-3 font-semibold uppercase">Today&apos;s Summary</h4>
                  <div className="text-sm space-y-2 text-foreground">
                    <p>✅ <span className="font-medium">{topicsDone}/{totalTopics}</span> topics completed this week</p>
                    <p>📈 <span className="font-medium">{overallPercent}%</span> overall syllabus progress</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border flex justify-end bg-muted/30">
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors tracking-wide flex items-center gap-2"
              >
                NEXT <ChevronRight className="w-4 h-4 text-primary-foreground" />
              </button>
            ) : (
              <button
                onClick={handleCompleteMission}
                className="w-full py-4 text-center bg-primary text-primary-foreground rounded-lg font-display tracking-widest font-bold uppercase hover:bg-primary/90 transition-colors shadow-md active:scale-95"
              >
                Mission Complete — Stand Down
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
