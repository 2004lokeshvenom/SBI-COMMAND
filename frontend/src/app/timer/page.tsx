"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Target, Save, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { logStudySession } from "@/actions/timer";
import { getTodaysTopics, getCurrentWeek } from "@/actions/topics";

const MODES = [
  { name: "S", label: "SPRINT", minutes: 15 },
  { name: "F", label: "FOCUS", minutes: 25 },
  { name: "D", label: "DEEP WORK", minutes: 50 },
  { name: "M", label: "MARATHON", minutes: 90 },
];

export default function TimerPage() {
  const [activeMode, setActiveMode] = useState(MODES[1]);
  const [timeLeft, setTimeLeft] = useState(activeMode.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadTopics() {
      const week = await getCurrentWeek();
      const data = await getTodaysTopics(week);
      setTopics(data);
      if (data.length > 0) setSelectedTopic(data[0].id);
    }
    loadTopics();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        setElapsed((time) => time + 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(activeMode.minutes * 60);
    setElapsed(0);
    setSaveSuccess(false);
  }, [activeMode]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === "Space" && e.target === document.body) {
      e.preventDefault();
      setIsActive((prev) => !prev);
    }
    if (e.code === "KeyR" && e.target === document.body) {
      e.preventDefault();
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleTimer = () => setIsActive(!isActive);

  const setMode = (mode: typeof MODES[0]) => {
    setIsActive(false);
    setActiveMode(mode);
    setTimeLeft(mode.minutes * 60);
    setElapsed(0);
    setSaveSuccess(false);
  };

  const handleLogSession = async () => {
    if (elapsed < 60) return; // ignore less than 1 minute
    setIsSaving(true);
    
    const minutesLogged = Math.round(elapsed / 60);
    await logStudySession(minutesLogged, selectedTopic, "deep_work");
    
    setIsSaving(false);
    setSaveSuccess(true);
    resetTimer();
  };

  const totalSeconds = activeMode.minutes * 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  
  const m = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const s = (timeLeft % 60).toString().padStart(2, "0");
  
  const elapsedMinutes = Math.floor(elapsed / 60);

  return (
    <div className="flex flex-col items-center min-h-[80vh] pb-20 pt-8 relative max-w-4xl mx-auto">
      
      {/* Target Selector */}
      <div className="w-full max-w-md mb-12 space-y-2">
        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Active Objective
        </label>
        <select 
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          disabled={isActive || elapsed > 0}
          className="w-full bg-card border border-border text-foreground font-medium rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none cursor-pointer disabled:opacity-50"
        >
          <option value="">General Drill / No Specific Topic</option>
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.title} - {t.task}</option>
          ))}
        </select>
      </div>

      {/* Modes */}
      <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-card/80 backdrop-blur rounded-xl mb-12 border border-border shadow-sm">
        {MODES.map((mode) => (
          <button
            key={mode.name}
            onClick={() => setMode(mode)}
            disabled={isActive || elapsed > 0}
            className={clsx(
              "px-6 py-2 rounded-lg font-mono text-xs font-bold tracking-widest transition-all",
              activeMode.name === mode.name
                ? "bg-primary text-primary-foreground shadow-md border-transparent"
                : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent disabled:opacity-40"
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center group">
        <svg className="absolute inset-0 w-full h-full -rotate-90 transform drop-shadow-xl" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="transparent" className="stroke-muted opacity-30" strokeWidth="1" />
          <circle 
            cx="50" cy="50" r="46" 
            fill="transparent" 
            className="stroke-primary transition-all duration-1000 ease-linear"
            strokeWidth="3.5" 
            strokeDasharray="289" 
            strokeDashoffset={289 - (289 * progressPercent) / 100}
            strokeLinecap="round"
          />
        </svg>

        <div className="text-center z-10 flex flex-col items-center">
          <div 
            className={clsx(
              "font-display text-[5.5rem] md:text-[7rem] tracking-wider leading-none transition-colors drop-shadow-sm",
              isActive ? "text-primary font-bold" : "text-foreground font-medium"
            )}
          >
            {m}:{s}
          </div>
          <div className="font-mono text-xs md:text-sm tracking-[0.3em] font-medium text-muted-foreground mt-6 uppercase flex items-center gap-2">
            {isActive ? (
              <><span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--color-primary)]" /> Recording Session</>
            ) : elapsed > 0 ? (
               "Timer Paused"
            ) : "Ready for Deployment"}
          </div>
          
          {elapsedMinutes > 0 && !isActive && (
            <div className="mt-4 font-mono text-xs text-green-600 dark:text-green-500 font-bold uppercase tracking-wider bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
              {elapsedMinutes} Min Logged Ready
            </div>
          )}
        </div>
      </div>

      {/* Controls & Saving */}
      <div className="flex flex-col items-center gap-6 mt-16 w-full max-w-sm">
        
        <div className="flex items-center gap-6 justify-center w-full">
          {!isActive && elapsed > 60 && (
            <button
              onClick={handleLogSession}
              disabled={isSaving}
              className="w-16 h-16 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-500 transition-all shadow-lg active:scale-95 disabled:opacity-50 border-2 border-green-500"
              aria-label="Save Session"
            >
              <Save className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-all shadow-xl active:scale-95 border-4 border-background"
            aria-label={isActive ? "Pause" : "Start"}
          >
            {isActive ? <Pause className="w-8 h-8" fill="currentColor" /> : <Play className="w-8 h-8 ml-1" fill="currentColor" />}
          </button>
          
          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full bg-card border-2 border-border text-muted-foreground flex items-center justify-center hover:bg-muted hover:text-foreground transition-all active:scale-95"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>

        {saveSuccess && (
          <div className="text-green-600 dark:text-green-500 font-mono text-sm uppercase tracking-widest font-bold flex items-center gap-2 mt-4">
            <CheckCircle2 className="w-5 h-5" /> Session Uploaded Output Logged
          </div>
        )}

      </div>
    </div>
  );
}
