"use client";
import { useState } from "react";
import { X, Moon, CheckCircle2 } from "lucide-react";

export function NightDebriefModal({ onClose }: { onClose: () => void }) {
  const [reflection, setReflection] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = () => {
    setDone(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border rounded-xl shadow-2xl w-full max-w-md p-6 space-y-5 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        {done ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="font-display font-bold text-xl">Day Complete!</h2>
            <p className="font-mono text-sm text-muted-foreground">Rest well. Tomorrow we go again.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Moon className="w-6 h-6 text-blue-400" />
              <h2 className="font-display font-bold text-xl">Night Debrief</h2>
            </div>
            <div>
              <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Today&apos;s Reflection</label>
              <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={4} className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="What did you accomplish? What needs work tomorrow?" />
            </div>
            <button onClick={handleSubmit} className="w-full py-3 bg-primary text-primary-foreground font-mono font-bold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2">
              <Moon className="w-4 h-4" /> End Mission Day
            </button>
          </>
        )}
      </div>
    </div>
  );
}
