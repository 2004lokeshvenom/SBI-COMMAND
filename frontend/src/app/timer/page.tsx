"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Trophy, Flame, Wind, Maximize2 } from "lucide-react";
import { getUserState, setUserState } from "@/actions/state";
import clsx from "clsx";

const MAIN_PRESETS = [
  { label: "1m", min: 1, emoji: "⚡" },
  { label: "5m", min: 5, emoji: "🍵" },
  { label: "10m", min: 10, emoji: "☕" },
  { label: "20m", min: 20, emoji: "📖" },
  { label: "30m", min: 30, emoji: "🍅" },
  { label: "45m", min: 45, emoji: "🔥" },
  { label: "60m", min: 60, emoji: "🚀" },
  { label: "90m", min: 90, emoji: "🧠" },
  { label: "120m", min: 120, emoji: "🐉" },
];

const REST_PRESETS = [
  { label: "5m", min: 5 },
  { label: "10m", min: 10 },
  { label: "15m", min: 15 },
  { label: "30m", min: 30 },
];

export default function TimerPage() {
  // --- Main Timer State ---
  const [remaining, setRemaining] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocus, setTotalFocus] = useState(0);
  const [fullscreenMode, setFullscreenMode] = useState<"main" | "rest" | null>(null);
  
  // --- Rest Timer State ---
  const [restRemaining, setRestRemaining] = useState(5 * 60);
  const [restTotalSeconds, setRestTotalSeconds] = useState(5 * 60);
  const [isRestRunning, setIsRestRunning] = useState(false);

  // --- Refs ---
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const mainAudioTriggered = useRef(false);
  const totalSecondsRef = useRef(totalSeconds);
  
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restEndTimeRef = useRef<number | null>(null);
  const restAudioTriggered = useRef(false);
  const restTotalSecondsRef = useRef(restTotalSeconds);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionsRef = useRef(0);
  const totalFocusRef = useRef(0);

  // Sync refs to avoid stale closures in timeouts (must not run during render — React 19 compiler rules)
  useEffect(() => {
    sessionsRef.current = sessions;
    totalFocusRef.current = totalFocus;
  }, [sessions, totalFocus]);
  useEffect(() => { totalSecondsRef.current = totalSeconds; }, [totalSeconds]);
  useEffect(() => { restTotalSecondsRef.current = restTotalSeconds; }, [restTotalSeconds]);

  // Initialize audio and stats
  useEffect(() => {
    audioRef.current = new Audio('/audio/music2.mp3');
    
    getUserState("timer_stats").then(d => {
      if (d) { setSessions(d.sessions || 0); setTotalFocus(d.totalFocus || 0); }
    });
  }, []);

  // --- Fullscreen API ---
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenMode(null);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const enterMainFullscreen = useCallback(() => {
    setFullscreenMode("main");
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const enterRestFullscreen = useCallback(() => {
    setFullscreenMode("rest");
    document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const playAlarm = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; 
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  }, []);

  // --- Main Timer Logic ---
  const onComplete = useCallback(() => {
    const newSessions = sessionsRef.current + 1;
    const newFocus = totalFocusRef.current + totalSecondsRef.current;
    setSessions(newSessions);
    setTotalFocus(newFocus);
    setUserState("timer_stats", { sessions: newSessions, totalFocus: newFocus });
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (!endTimeRef.current) return;
        const timeLeft = Math.round((endTimeRef.current - Date.now()) / 1000);

        // Trigger music exactly 12 seconds before the end
        if (timeLeft <= 12 && timeLeft > 0 && !mainAudioTriggered.current) {
          playAlarm();
          mainAudioTriggered.current = true;
        }

        if (timeLeft <= 0) {
          setRemaining(0);
          setIsRunning(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          onComplete();
          
          // Wait 2 seconds to show "00:00", then auto-reset
          setTimeout(() => {
            setRemaining(totalSecondsRef.current);
            mainAudioTriggered.current = false;
          }, 2000);

        } else {
          setRemaining(timeLeft);
        }
      }, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, onComplete, playAlarm]);

  const toggleTimer = () => {
    if (!isRunning) {
      // Safety catch: If user clicks play while stuck at 0, reset it first
      let startFrom = remaining;
      if (remaining <= 0) {
        startFrom = totalSeconds;
        setRemaining(totalSeconds);
        mainAudioTriggered.current = false;
      }
      endTimeRef.current = Date.now() + startFrom * 1000;
    }
    setIsRunning(!isRunning);
  };

  const setPreset = (min: number) => { 
    setIsRunning(false); 
    setRemaining(min * 60); 
    setTotalSeconds(min * 60); 
    mainAudioTriggered.current = false;
  };
  const reset = () => { 
    setIsRunning(false); 
    setRemaining(totalSeconds); 
    mainAudioTriggered.current = false; 
  };


  // --- Rest Timer Logic ---
  useEffect(() => {
    if (isRestRunning) {
      restIntervalRef.current = setInterval(() => {
        if (!restEndTimeRef.current) return;
        const timeLeft = Math.round((restEndTimeRef.current - Date.now()) / 1000);

        // Trigger rest music exactly 12 seconds before the end
        if (timeLeft <= 12 && timeLeft > 0 && !restAudioTriggered.current) {
          playAlarm();
          restAudioTriggered.current = true;
        }

        if (timeLeft <= 0) {
          setRestRemaining(0);
          setIsRestRunning(false);
          if (restIntervalRef.current) clearInterval(restIntervalRef.current);
          
          // Wait 2 seconds to show "00:00", then auto-reset
          setTimeout(() => {
            setRestRemaining(restTotalSecondsRef.current);
            restAudioTriggered.current = false;
          }, 2000);

        } else {
          setRestRemaining(timeLeft);
        }
      }, 250);
    } else {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    }
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); };
  }, [isRestRunning, playAlarm]);

  const toggleRestTimer = () => {
    if (!isRestRunning) {
      // Safety catch for rest timer
      let startFrom = restRemaining;
      if (restRemaining <= 0) {
        startFrom = restTotalSeconds;
        setRestRemaining(restTotalSeconds);
        restAudioTriggered.current = false;
      }
      restEndTimeRef.current = Date.now() + startFrom * 1000;
    }
    setIsRestRunning(!isRestRunning);
  };

  const setRestPreset = (min: number) => { 
    setIsRestRunning(false); 
    setRestRemaining(min * 60); 
    setRestTotalSeconds(min * 60); 
    restAudioTriggered.current = false;
  };
  const resetRest = () => { 
    setIsRestRunning(false); 
    setRestRemaining(restTotalSeconds); 
    restAudioTriggered.current = false; 
  };


  // --- Display Variables ---
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const elapsed = totalSeconds - remaining;
  const progress = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;
  const r = 158;
  const circ = 2 * Math.PI * r;

  const restMinutes = Math.floor(restRemaining / 60);
  const restSeconds = restRemaining % 60;
  const restElapsed = restTotalSeconds - restRemaining;
  const restProgress = restTotalSeconds > 0 ? (restElapsed / restTotalSeconds) * 100 : 0;
  const restR = 90;
  const restCirc = 2 * Math.PI * restR;

  const getMotivation = () => {
    if (!isRunning && remaining === totalSeconds) return "🔥 Ready to grind?";
    if (!isRunning && remaining < totalSeconds && remaining > 0) return "⏸️ Don't stop now!";
    if (remaining === 0) return "🏆 Session complete!";
    if (progress > 75) return "💪 Almost there! Push!";
    if (progress > 50) return "🔥 Halfway warrior!";
    if (progress > 25) return "⚡ Keep the fire burning!";
    return "🎯 Amma & Nanna are watching!";
  };

  const statsHidden = isRunning;

  return (
    <>
    {/* ── FULLSCREEN OVERLAY ── */}
    {fullscreenMode === "main" && (
      <div className="fullscreen-timer-overlay">
        <div className="timer-digits">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
        <div className="timer-label">
          {isRunning ? "focusing" : remaining === 0 ? "done" : remaining < totalSeconds ? "paused" : "ready"}
        </div>
      </div>
    )}
    {fullscreenMode === "rest" && (
      <div className="fullscreen-timer-overlay">
        <div className="timer-digits" style={{ color: "#38bdf8" }}>
          {String(restMinutes).padStart(2, "0")}:{String(restSeconds).padStart(2, "0")}
        </div>
        <div className="timer-label" style={{ color: "rgba(56,189,248,0.4)" }}>
          {isRestRunning ? "breathing" : restRemaining === 0 ? "ready" : "idle"}
        </div>
      </div>
    )}

    <div className="min-h-[80vh] flex flex-col xl:flex-row items-center justify-center gap-12 xl:gap-24 overflow-hidden">      
      {/* -------------------- LEFT SIDE: MAIN TIMER -------------------- */}
      <div className="flex flex-col items-center relative">
        <div
          className="pointer-events-none absolute inset-[-200px] transition-opacity duration-1000 -z-10"
          style={{
            opacity: isRunning ? 1 : 0,
            background: "radial-gradient(circle at 50% 50%, rgba(249,115,22,0.06) 0%, transparent 70%)",
          }}
        />

        <p
          className="font-mono text-sm font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4 tracking-widest uppercase transition-all duration-500 text-center"
          style={{ letterSpacing: "0.2em" }}
        >
          {getMotivation()}
        </p>

        {/* Main Presets */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-[400px]">
          {MAIN_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setPreset(p.min)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all duration-300",
                totalSeconds === p.min * 60
                  ? "bg-orange-500/10 border border-orange-500/30 text-orange-400"
                  : "bg-white/5 border border-transparent text-muted-foreground hover:bg-white/10 hover:text-foreground"
              )}
            >
              <span className="text-sm">{p.emoji}</span>
              <span className="font-mono text-[11px] font-bold tracking-widest uppercase">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div
            className="card-glow px-5 py-4 text-center transition-all duration-700 ease-in-out"
            style={{
              opacity: statsHidden ? 0 : 1,
              transform: statsHidden ? "translateX(-32px) scale(0.88)" : "translateX(0) scale(1)",
              pointerEvents: statsHidden ? "none" : "auto",
              filter: statsHidden ? "blur(4px)" : "blur(0px)",
            }}
          >
            <div className="flex items-center gap-1.5 justify-center text-muted-foreground mb-1.5">
              <Trophy className="w-3 h-3" />
              <span className="font-mono text-[9px] uppercase tracking-widest">Sessions</span>
            </div>
            <div className="font-mono text-2xl font-bold text-orange-400">{sessions}</div>
          </div>

          <div className="relative">
            {isRunning && (
              <div
                className="absolute inset-[-40px] rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(249,115,22,0.09) 0%, transparent 70%)",
                  animation: "pulse 2.5s ease-in-out infinite",
                }}
              />
            )}

            <svg width="360" height="360" className="-rotate-90 block">
              <circle cx="180" cy="180" r={r} fill="none" strokeWidth="2" stroke="rgba(255,255,255,0.06)" />
              <circle
                cx="180" cy="180" r={r}
                fill="none"
                strokeWidth="5"
                stroke="url(#timerGrad)"
                strokeDasharray={circ}
                strokeDashoffset={circ - (circ * progress) / 100}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)" }}
              />
              <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-[4.5rem] font-bold tracking-tight tabular-nums text-foreground leading-none"
                style={{ fontVariantNumeric: "tabular-nums" }}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] mt-3">
                {isRunning ? "🔥 focusing" : remaining === 0 ? "🏆 done!" : remaining < totalSeconds ? "⏸ paused" : "ready"}
              </div>
            </div>
          </div>

          <div
            className="card-glow px-5 py-4 text-center transition-all duration-700 ease-in-out"
            style={{
              opacity: statsHidden ? 0 : 1,
              transform: statsHidden ? "translateX(32px) scale(0.88)" : "translateX(0) scale(1)",
              pointerEvents: statsHidden ? "none" : "auto",
              filter: statsHidden ? "blur(4px)" : "blur(0px)",
            }}
          >
            <div className="flex items-center gap-1.5 justify-center text-muted-foreground mb-1.5">
              <Flame className="w-3 h-3" />
              <span className="font-mono text-[9px] uppercase tracking-widest">Total Focus</span>
            </div>
            <div className="font-mono text-2xl font-bold text-orange-400">{Math.floor(totalFocus / 60)}m</div>
          </div>
        </div>

        <div className="flex items-center gap-5 mt-6">
          <button onClick={reset} className="p-3 rounded-full card-glow text-muted-foreground hover:text-foreground transition">
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={toggleTimer}
            className={clsx(
              "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95",
              isRunning
                ? "bg-gradient-to-br from-red-500 to-orange-600 glow-fire"
                : "bg-gradient-to-br from-orange-500 to-amber-500 glow-accent"
            )}
          >
            {isRunning ? <Pause className="w-7 h-7 text-white" /> : <Play className="w-7 h-7 text-white ml-0.5" />}
          </button>
          <button onClick={enterMainFullscreen} className="p-3 rounded-full card-glow text-muted-foreground hover:text-foreground transition" title="Fullscreen Timer (ESC to exit)">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* -------------------- RIGHT SIDE: REST TIMER -------------------- */}
      <div className="flex flex-col items-center p-8 rounded-[2rem] bg-card/30 border border-white/5 shadow-2xl backdrop-blur-sm relative overflow-hidden">
        {isRestRunning && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
            style={{
              background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(56,189,248,0.08) 0%, transparent 80%)",
            }}
          />
        )}
        
        <div className="flex items-center gap-2 mb-6 text-sky-400">
          <Wind className="w-5 h-5" />
          <span className="font-mono text-sm font-bold tracking-widest uppercase">Rest & Recover</span>
        </div>

        {/* Rest Presets */}
        <div className="flex gap-2 mb-8">
          {REST_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => setRestPreset(p.min)}
              className={clsx(
                "px-3 py-1.5 rounded-lg font-mono text-xs font-bold tracking-wider transition-all",
                restTotalSeconds === p.min * 60
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-transparent"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Rest Ring */}
        <div className="relative mb-6">
          <svg width="220" height="220" className="-rotate-90 block">
            <circle cx="110" cy="110" r={restR} fill="none" strokeWidth="2" stroke="rgba(255,255,255,0.04)" />
            <circle
              cx="110" cy="110" r={restR}
              fill="none"
              strokeWidth="4"
              stroke="url(#restGrad)"
              strokeDasharray={restCirc}
              strokeDashoffset={restCirc - (restCirc * restProgress) / 100}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)" }}
            />
            <defs>
              <linearGradient id="restGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="font-mono text-4xl font-bold tracking-tight text-foreground" style={{ fontVariantNumeric: "tabular-nums" }}>
              {String(restMinutes).padStart(2, "0")}:{String(restSeconds).padStart(2, "0")}
            </div>
            <div className="font-mono text-[9px] text-sky-400/70 uppercase tracking-[0.2em] mt-2">
              {isRestRunning ? "breathing" : remaining === 0 ? "ready" : "idle"}
            </div>
          </div>
        </div>

        {/* Rest Controls */}
        <div className="flex items-center gap-4">
          <button onClick={resetRest} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground transition">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleRestTimer}
            className={clsx(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg",
              isRestRunning ? "bg-sky-600 shadow-sky-900/50" : "bg-sky-500 shadow-sky-800/50"
            )}
          >
            {isRestRunning ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
          </button>
          <button onClick={enterRestFullscreen} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground transition" title="Fullscreen Timer (ESC to exit)">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.06); opacity: 1; }
        }
      `}</style>
    </div>
    </>
  );
}