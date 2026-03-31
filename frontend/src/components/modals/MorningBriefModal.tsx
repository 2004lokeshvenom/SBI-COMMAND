"use client";
import { useState } from "react";
import { X, Sun, Flame, BookOpen } from "lucide-react";
import { createCheckIn } from "@/actions/user";

export function MorningBriefModal({ onClose }: { onClose: () => void }) {
  const [energy, setEnergy] = useState(3);
  const [focus, setFocus] = useState(3);
  const [notes, setNotes] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    await createCheckIn({ energy, focus, notes });
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
            <div className="text-4xl">☀️</div>
            <h2 className="font-display font-bold text-xl text-primary">Mission Accepted!</h2>
            <p className="font-mono text-sm text-muted-foreground">Let&apos;s conquer today.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <Sun className="w-6 h-6 text-orange-400" />
              <h2 className="font-display font-bold text-xl">Morning Brief</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Energy Level</label>
                <div className="flex gap-2 mt-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} onClick={() => setEnergy(v)} className={`w-10 h-10 rounded-lg border font-mono font-bold transition ${energy === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Focus Level</label>
                <div className="flex gap-2 mt-2">
                  {[1,2,3,4,5].map(v => (
                    <button key={v} onClick={() => setFocus(v)} className={`w-10 h-10 rounded-lg border font-mono font-bold transition ${focus === v ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-primary/50"}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Today&apos;s Goal (optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-2 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="What will you crush today?" />
              </div>
            </div>
            <button onClick={handleSubmit} className="w-full py-3 bg-primary text-primary-foreground font-mono font-bold rounded-lg hover:bg-primary/90 transition flex items-center justify-center gap-2">
              <Flame className="w-4 h-4" /> Accept Mission
            </button>
          </>
        )}
      </div>
    </div>
  );
}
