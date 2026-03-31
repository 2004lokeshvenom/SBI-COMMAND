"use client";
export default function StrategyPage() {
  return (
    <div className="space-y-6 pb-20">
      <div className="border-b pb-4">
        <h1 className="font-display text-4xl font-bold">Strategy & Tips</h1>
        <p className="font-mono text-muted-foreground mt-2 uppercase text-sm">Your exam winning playbook</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "1. Revision System", body: "Daily (15m before sleep): Revise quant formulas, 20 vocab words. Weekly (Sun): Revise all topics covered that week." },
          { title: "2. Error Notebook", body: "Log ONLY wrong Qs or guesswork. Revise every 3 days. This alone can add 10+ marks to your score." },
          { title: "3. Editorial Reading", body: "The Hindu / Indian Express daily. Boosts RC, vocabulary, and current affairs simultaneously." },
          { title: "4. Mock Analysis Formula", body: "2 hours of analysis per mock. Identify: Concept error? Silly mistake? Time pressure? Log everything." },
          { title: "5. Puzzle Strategy", body: "Max 7-8 min per puzzle. If stuck, leave immediately. Build exam reflexes — never get stuck." },
          { title: "6. Safe Scores Target", body: "Reasoning: 28-32 | Quant: 22-25 | English: 20-25. Hit these and you're in the merit list." },
        ].map(item => (
          <div key={item.title} className="p-5 rounded-lg border bg-card">
            <h2 className="font-display font-bold text-base mb-2">{item.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
