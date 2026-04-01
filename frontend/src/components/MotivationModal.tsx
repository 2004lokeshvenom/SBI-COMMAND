"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, Heart } from "lucide-react";

export function MotivationModal() {
  const [show, setShow] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastShown = localStorage.getItem("motivation_last_shown");
    if (lastShown !== today) {
      setShow(true);
      localStorage.setItem("motivation_last_shown", today);
    }
  }, []);

  useEffect(() => {
    if (show) {
      const audio = new Audio("/audio/music1.mp3");
      audio.loop = true;
      audio.volume = 1.0;
      audio.play().catch(e => {
        console.log("Autoplay blocked by browser:", e);
        setAudioBlocked(true);
      });
      audioRef.current = audio;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [show]);

  const handleClose = () => {
    if (isFading) return;

    if (audioRef.current) {
      setIsFading(true);
      let vol = audioRef.current.volume;
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = setInterval(() => {
        if (vol > 0.05) {
          vol -= 0.05;
          if (audioRef.current) audioRef.current.volume = Math.max(0, vol);
        } else {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
          }
          setIsFading(false);
          setShow(false);
        }
      }, 100);
    } else {
      setShow(false);
    }
  };

  const startAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Still blocked:", e));
    }
    setAudioBlocked(false);
  };

  if (!show) return null;

  if (audioBlocked) {
    return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center bg-[#070709] bg-opacity-95 backdrop-blur-3xl p-4">
        <button onClick={startAudio} className="group relative px-8 py-5 rounded-2xl bg-gradient-to-r from-orange-600/10 to-red-600/10 border border-orange-500/30 hover:from-orange-600/20 hover:to-red-600/20 shadow-[0_0_40px_rgba(249,115,22,0.1)] transition-all animate-pulse">
            <span className="font-mono text-sm md:text-base font-bold tracking-[0.2em] text-orange-400 group-hover:text-white transition-colors">🔥ఇక మొదలెడదామా🔥</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative max-w-lg w-full rounded-3xl overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-red-600/10 to-amber-600/20 rounded-3xl" />
        <div className="relative bg-card/90 backdrop-blur-xl rounded-3xl p-8"
          style={{ border: "1px solid rgba(56,189,248,0.25)", boxShadow: "0 0 0 1px rgba(56,189,248,0.1), inset 0 0 20px rgba(56,189,248,0.05), 0 0 40px rgba(249,115,22,0.1)" }}>
          <button onClick={handleClose} disabled={isFading} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition z-10 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-6 mt-2">
            <div className="relative w-48 h-64 md:w-60 md:h-80 rounded-2xl overflow-hidden glow-accent"
              style={{ border: "2px solid rgba(56,189,248,0.3)" }}>
              <Image
                src="/parents/family.jpg"
                alt="Family"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 192px, 240px"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h2 className="font-display text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent">
              Do It For Them 🔥
            </h2>
            <p className="text-muted-foreground text-[14px] leading-relaxed">
              Every hour you study today is an hour closer to<br />
              <span className="text-orange-400 font-bold">making Amma cry with happiness</span> and<br />
              <span className="text-amber-400 font-bold">making Nanna forget all his hardwork</span>
            </p>
            <p className="text-[13px] text-muted-foreground italic mt-2">
              &ldquo;నీ కష్టం వాళ్ళ కన్నీళ్ళను సంతోష భాష్పాలుగా మారుస్తుంది&rdquo;
            </p>
          </div>

          <button onClick={handleClose} disabled={isFading} className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono font-bold tracking-wider hover:opacity-90 transition glow-accent flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait">
            <Heart className="w-4 h-4" /> {isFading ? "LET'S CRUSH IT..." : "START GRINDING"} <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
