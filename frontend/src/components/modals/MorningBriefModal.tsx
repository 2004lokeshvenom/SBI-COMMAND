"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMissionStore } from "@/store/useMissionStore";
import { X, CheckCircle2, ChevronRight, Zap } from "lucide-react";
import clsx from "clsx";
import { getUserStats } from "@/actions/user";
import { getTodaysTopics, getCurrentWeek } from "@/actions/topics";

export function MorningBriefModal() {
  const { isMorningBriefOpen, closeMorningBrief } = useMissionStore();
  const [step, setStep] = useState(1);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [focusToday, setFocusToday] = useState("");
  const [affirmation, setAffirmation] = useState("");

  const [stats, setStats] = useState<any>(null);
  const [todayTopics, setTodayTopics] = useState<any[]>([]);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    if (!isMorningBriefOpen) return;
    async function loadBriefData() {
      try {
        const [userStats, week] = await Promise.all([
          getUserStats(),
          getCurrentWeek(),
        ]);
        const topics = await getTodaysTopics(week);
        setStats(userStats);
        setTodayTopics(topics);
        const examDate = new Date("2026-07-30");
        const today = new Date();
        setDaysLeft(Math.max(0, Math.floor((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))));
      } catch (err) {
        console.error("Failed to load morning brief data:", err);
      }
    }
    loadBriefData();
    setStep(1);
  }, [isMorningBriefOpen]);

  if (!isMorningBriefOpen) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleAcceptMission = () => {
    closeMorningBrief();
  };

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
              Morning Protocol
            </h2>
            <button onClick={closeMorningBrief} className="text-muted-foreground hover:text-foreground transition rounded-full p-1 hover:bg-muted">
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
            {/* Step 1: WAKE CALL — real data */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div>
                  <h3 className="font-display text-3xl font-bold mb-2 text-foreground">Good Morning, Operative.</h3>
                  <p className="font-mono text-muted-foreground font-medium uppercase text-sm">D-{daysLeft} to SBI PO Prelims.</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground font-mono tracking-wider mb-2 uppercase font-semibold">Study Streak</div>
                    <div className="font-display text-2xl text-green-700 dark:text-green-500 font-bold">{stats ? stats.streak : "-"} 🔥</div>
                  </div>
                  <div className="border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg text-center">
                    <div className="text-xs text-muted-foreground font-mono tracking-wider mb-2 uppercase font-semibold">Topics Today</div>
                    <div className="font-display text-2xl text-green-700 dark:text-green-500 font-bold">{todayTopics.length}</div>
                  </div>
                </div>

                <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-500/10 mt-6 rounded-r-lg">
                  <p className="text-sm text-foreground/90 font-medium italic">
                    &quot;The competition is already awake. Every hour matters now.&quot;
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: INTENTION */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="font-display text-2xl text-foreground font-bold mb-6">Daily Intention</h3>

                <div>
                  <label className="block text-xs font-mono tracking-wider text-muted-foreground mb-3 font-semibold uppercase">Energy Level</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setEnergyLevel(lvl)}
                        className={clsx(
                          "flex-1 h-12 rounded-md border transition-all active:scale-95",
                          energyLevel >= lvl ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted text-muted-foreground"
                        )}
                      >
                        <Zap className="w-5 h-5 mx-auto" fill={energyLevel >= lvl ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider text-muted-foreground mb-2 mt-6 font-semibold uppercase">What do you want to focus on today?</label>
                  <input
                    type="text"
                    value={focusToday}
                    onChange={(e) => setFocusToday(e.target.value)}
                    placeholder="e.g. Puzzles, DI practice, RC speed"
                    className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-wider text-muted-foreground mb-2 mt-6 font-semibold uppercase">Personal Affirmation (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. I will conquer Data Interpretation today."
                    value={affirmation}
                    onChange={(e) => setAffirmation(e.target.value)}
                    className="w-full bg-background border border-border rounded-md p-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: BRIEF — real today's topics */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <h3 className="font-display text-2xl font-bold text-foreground mb-6 uppercase">Today&apos;s Mission</h3>

                <div className="space-y-4">
                  <div className="border border-border p-4 rounded-lg bg-card">
                    <h4 className="font-mono tracking-widest text-xs text-muted-foreground mb-4 font-semibold uppercase">Primary Objectives</h4>
                    <ul className="space-y-3">
                      {todayTopics.length > 0 ? todayTopics.map((t, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-foreground">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          {t.title} — {t.task}
                        </li>
                      )) : (
                        <li className="text-sm text-muted-foreground">No topics scheduled for this week.</li>
                      )}
                    </ul>
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
                onClick={handleAcceptMission}
                className="w-full py-4 text-center bg-primary text-primary-foreground rounded-lg font-display tracking-widest font-bold uppercase hover:bg-primary/90 transition-colors shadow-md active:scale-95"
              >
                Accept Mission
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
