"use client";

import { Target, BookOpen, AlertCircle, Flame, ShieldCheck, Zap, BrainCircuit, Activity } from "lucide-react";
import clsx from "clsx";

export default function StrategyPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
      
      {/* HEADER SECTION */}
      <div className="md:col-span-12 space-y-2 mb-4 text-center md:text-left">
        <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-primary uppercase">
          Tactical Operations <span className="text-foreground">— Strategy</span>
        </h1>
        <p className="font-mono text-muted-foreground uppercase text-sm font-semibold tracking-widest">
          SBI PO Combat Directives & Rules of Engagement
        </p>
      </div>

      {/* LEFT COLUMN: GOLDEN RULES & SAFE SCORES */}
      <div className="md:col-span-4 space-y-6">
        
        {/* Safe Scores Target */}
        <div className="p-6 rounded-lg border-l-4 border-l-red-500 bg-card shadow-sm">
          <h2 className="font-display text-xl uppercase tracking-widest font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" /> Target Thresholds
          </h2>
          <div className="space-y-4 font-mono text-sm max-w-full">
            <div className="flex justify-between items-end border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground uppercase text-xs">Reasoning Ability</span>
              <span className="text-red-600 dark:text-red-400 font-bold text-lg">28–32</span>
            </div>
            <div className="flex justify-between items-end border-b pb-2 border-border">
              <span className="font-semibold text-muted-foreground uppercase text-xs">Quantitative Aptitude</span>
              <span className="text-red-600 dark:text-red-400 font-bold text-lg">22–25</span>
            </div>
            <div className="flex justify-between items-end pb-1 border-border">
              <span className="font-semibold text-muted-foreground uppercase text-xs">English Language</span>
              <span className="text-red-600 dark:text-red-400 font-bold text-lg">20–25</span>
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 text-right">
              <span className="text-[10px] text-muted-foreground block mb-1">Total Safe Zone</span>
              <span className="font-display text-3xl font-bold text-foreground">70<span className="text-xl text-muted-foreground">+</span></span>
            </div>
          </div>
        </div>

        {/* The 5 Golden Rules */}
        <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
          <h2 className="font-display text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-wide">
            <ShieldCheck className="w-5 h-5 text-primary" /> The 5 Golden Rules
          </h2>
          <div className="space-y-6">
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-5 h-5 bg-primary/20 text-primary font-bold font-mono text-xs flex items-center justify-center rounded">1</div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Revision System</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Daily (15m before sleep): Revise quant formulas & 20 vocab words. Weekly (Sun): Revise all weekly topics.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-5 h-5 bg-primary/20 text-primary font-bold font-mono text-xs flex items-center justify-center rounded">2</div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Error Notebook</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Log ONLY wrong Qs or guesswork from mocks. Revise every 3 days. This yields +10 marks potential.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-5 h-5 bg-primary/20 text-primary font-bold font-mono text-xs flex items-center justify-center rounded">3</div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Editorial Reading</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">The Hindu/Indian Express daily. Prioritize opinion pages. Replaces separate vocab/RC practice.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-5 h-5 bg-primary/20 text-primary font-bold font-mono text-xs flex items-center justify-center rounded">4</div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Mock Analysis Formula</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">2 hours analyzing a 1 hour mock. Identify root cause: Concept error? Silly mistake? Time pressure trap?</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute left-0 top-1 w-5 h-5 bg-primary/20 text-primary font-bold font-mono text-xs flex items-center justify-center rounded">5</div>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">Puzzle Strategy</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">Max 7-8 min per puzzle. If stuck, abort immediately to save the section. Build emotional detachment.</p>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: SECTION-WISE STRATEGIES */}
      <div className="md:col-span-8 space-y-6">
        
        {/* Quantitative Section */}
        <div className="p-6 md:p-8 rounded-xl border bg-card text-card-foreground shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Activity className="w-48 h-48" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider">Quantitative Aptitude</h2>
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold tracking-widest">35 Qs | 20 Mins</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 relative z-10">
            <div>
              <h3 className="text-sm font-bold uppercase text-foreground mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /> Topic Priority Sequence</h3>
              <ol className="text-sm text-muted-foreground space-y-2 font-medium list-decimal list-inside">
                <li>Simplification & Approximation (5 Qs)</li>
                <li>Quadratic Equations (5 Qs)</li>
                <li>Data Interpretation L1 (5-10 Qs)</li>
                <li>Number Series (5 Qs)</li>
                <li>Arithmetic Word Problems (10 Qs)</li>
              </ol>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
                <h4 className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 mb-1">Vedic Math Directive</h4>
                <p className="text-xs text-muted-foreground">First 15 mins of your day must be calculating mental tables up to 30, squares to 30, and cubes to 20. Do not use pen.</p>
              </div>
              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="text-xs font-bold uppercase text-foreground mb-1">Mains Note</h4>
                <p className="text-xs text-muted-foreground">In Mains, Arithmetic concepts are fused into DI. Do not skip T&W, P&L, or Probability.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reasoning Section */}
        <div className="p-6 md:p-8 rounded-xl border bg-card text-card-foreground shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BrainCircuit className="w-48 h-48" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider">Reasoning Ability</h2>
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold tracking-widest">35 Qs | 20 Mins</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 relative z-10">
            <div>
              <h3 className="text-sm font-bold uppercase text-foreground mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500" /> Topic Priority Sequence</h3>
              <ol className="text-sm text-muted-foreground space-y-2 font-medium list-decimal list-inside">
                <li>Syllogism & Inequality (10 Qs)</li>
                <li>Alphanumeric Series (5 Qs)</li>
                <li>Coding-Decoding (5 Qs)</li>
                <li>Blood Relation / Direction (3-5 Qs)</li>
                <li>Puzzles & Seating (15-20 Qs) - Do Last!</li>
              </ol>
            </div>
            <div className="space-y-4">
              <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-lg">
                <h4 className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400 mb-1">Misc Pre-emption</h4>
                <p className="text-xs text-muted-foreground">Clear 15-18 miscellaneous marks in the first 7-8 minutes. Time preserved here is ammo for puzzles.</p>
              </div>
              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="text-xs font-bold uppercase text-foreground mb-1">Puzzle Threads</h4>
                <p className="text-xs text-muted-foreground">Always draw two parallel possibilities from the first line. Do not wait to split branches.</p>
              </div>
            </div>
          </div>
        </div>

        {/* English Section */}
        <div className="p-6 md:p-8 rounded-xl border bg-card text-card-foreground shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BookOpen className="w-48 h-48" />
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-wider">English Language</h2>
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold tracking-widest">30 Qs | 20 Mins</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 relative z-10">
            <div>
              <h3 className="text-sm font-bold uppercase text-foreground mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> Topic Priority Sequence</h3>
              <ol className="text-sm text-muted-foreground space-y-2 font-medium list-decimal list-inside">
                <li>Fill in the Blanks / Cloze Test (5-10 Qs)</li>
                <li>Error Spotting (5 Qs)</li>
                <li>Para Jumbles (5 Qs)</li>
                <li>Reading Comprehension (7-10 Qs)</li>
              </ol>
            </div>
            <div className="space-y-4">
              <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-lg">
                <h4 className="text-xs font-bold uppercase text-green-600 dark:text-green-400 mb-1">Skim Doctrine</h4>
                <p className="text-xs text-muted-foreground">Read the RC questions first (especially the vocab ones). Skim passage for keywords before deep reading.</p>
              </div>
              <div className="bg-muted p-4 rounded-lg border border-border">
                <h4 className="text-xs font-bold uppercase text-foreground mb-1">Tone & Inference</h4>
                <p className="text-xs text-muted-foreground">Mains RCs rely heavily on author&apos;s tone. Read Editorials until you naturally infer implicit meanings.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
