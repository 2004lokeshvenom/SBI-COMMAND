"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, AlertTriangle, Crosshair, Target, X, PlusCircle } from "lucide-react";
import clsx from "clsx";
import { getMockHistory, submitMockScore } from "@/actions/mocks";

const MocksChart = dynamic(
  () => import("@/components/charts/MocksChart").then((m) => m.MocksChart),
  { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center font-mono text-xs text-muted-foreground uppercase">Loading Chart...</div> }
);

export default function MocksPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ total: "", qa: "", reas: "", eng: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const history = await getMockHistory();
      if (history.length === 0) {
        setData([{ name: "Baseline 0", score: 0, qa: 0, reas: 0, eng: 0 }]);
      } else {
        setData(history);
      }
    } catch (err) {
      console.error("Failed to load mock data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await submitMockScore(Number(form.total), Number(form.qa), Number(form.reas), Number(form.eng));
    await loadData();
    setIsModalOpen(false);
    setForm({ total: "", qa: "", reas: "", eng: "" });
    setSubmitting(false);
  };

  const latest = data.length > 0 ? data[data.length - 1] : { score: 0, qa: 0, reas: 0, eng: 0 };
  const previous = data.length > 1 ? data[data.length - 2] : null;
  const diff = previous ? latest.score - previous.score : 0;

  const subjects = [
    { name: "Quant", avg: data.length ? data.reduce((a: number, b: any) => a + b.qa, 0) / data.length : 0 },
    { name: "Reasoning", avg: data.length ? data.reduce((a: number, b: any) => a + b.reas, 0) / data.length : 0 },
    { name: "English", avg: data.length ? data.reduce((a: number, b: any) => a + b.eng, 0) / data.length : 0 },
  ].sort((a, b) => a.avg - b.avg);
  const weakest = subjects[0];

  return (
    <div className="space-y-8 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b pb-4 space-y-4 md:space-y-0">
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Combat Simulations</h1>
          <p className="font-mono text-muted-foreground mt-2 uppercase text-sm">Mock Test Analytics & Performance</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground transition rounded font-mono uppercase tracking-widest font-semibold shadow-md active:scale-95"
        >
          <Target className="w-5 h-5" /> Initiate New Simulation
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center font-mono text-muted-foreground uppercase text-sm border border-border rounded-lg">
          Loading Simulation Data...
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg border bg-card flex flex-col justify-between shadow-sm">
              <div className="text-xs font-mono tracking-widest text-muted-foreground mb-2 uppercase">Latest Score</div>
              <div className="flex items-end gap-3">
                <span className="font-display text-4xl text-foreground font-semibold">{latest.score.toFixed(1)}</span>
                <span className="text-muted-foreground font-mono mb-1">/ 100</span>
              </div>
              <div
                className={clsx(
                  "mt-4 text-xs font-mono flex items-center gap-1 font-semibold uppercase",
                  diff >= 0 ? "text-green-600 dark:text-green-500" : "text-red-500"
                )}
              >
                {diff !== 0 && <TrendingUp className={clsx("w-4 h-4", diff < 0 && "rotate-180")} />}
                {diff > 0 ? "+" : ""}{diff.toFixed(1)} FROM LAST MOCK
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-card flex flex-col justify-between shadow-sm">
              <div className="text-xs font-mono tracking-widest text-muted-foreground mb-2 uppercase">Trajectory</div>
              <div className="flex items-end gap-3">
                <span className="font-display text-4xl text-foreground font-semibold">
                  {data.length > 2 &&
                  data[data.length - 1].score > data[data.length - 2].score &&
                  data[data.length - 2].score > data[data.length - 3].score
                    ? "Bullish"
                    : "Neutral"}
                </span>
              </div>
              <div className="mt-4 text-xs font-mono text-muted-foreground uppercase font-medium">BASED ON LAST 3</div>
            </div>

            <div className="p-6 rounded-lg border bg-card flex flex-col justify-between shadow-sm">
              <div className="text-xs font-mono tracking-widest text-muted-foreground mb-2 uppercase">Percentile Estimate</div>
              <div className="flex items-end gap-3">
                <span className="font-display text-4xl text-foreground font-semibold">
                  {latest.score > 60 ? "90th+" : latest.score > 50 ? "80th+" : "Avg"}
                </span>
              </div>
              <div className="mt-4 text-xs font-mono text-muted-foreground uppercase font-medium">
                SAFE ZONE: &gt;95th
              </div>
            </div>

            <div className="p-6 rounded-lg border bg-red-50/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 flex flex-col justify-between shadow-sm">
              <div className="text-xs font-mono tracking-widest text-red-600 dark:text-red-400 mb-2 uppercase font-semibold">Weakest Link</div>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
                <span className="font-display text-2xl text-red-700 dark:text-red-400 font-semibold uppercase">{weakest.name}</span>
              </div>
              <div className="mt-4 text-xs font-mono text-red-600 dark:text-red-400 uppercase font-medium">
                AVG. SCORE: {weakest.avg.toFixed(1)} / {weakest.name === "English" ? 30 : 35}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="font-mono tracking-widest uppercase font-semibold flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-muted-foreground" /> Performance Trajectory
              </h2>
            </div>
            <div className="h-[300px] w-full">
              <MocksChart data={data} />
            </div>
          </div>

          {/* Log History */}
          <div className="rounded-lg overflow-hidden border bg-card shadow-sm">
            <table className="w-full text-left font-mono text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-xs tracking-widest text-muted-foreground font-semibold uppercase">Simulation ID</th>
                  <th className="p-4 text-xs tracking-widest text-muted-foreground font-semibold text-right uppercase">Total (100)</th>
                  <th className="p-4 text-xs tracking-widest text-muted-foreground font-semibold text-right uppercase">Quant (35)</th>
                  <th className="p-4 text-xs tracking-widest text-muted-foreground font-semibold text-right uppercase">Reas (35)</th>
                  <th className="p-4 text-xs tracking-widest text-muted-foreground font-semibold text-right uppercase">Eng (30)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border">
                {[...data]
                  .reverse()
                  .filter((d) => d.name !== "Baseline 0")
                  .map((mock, i) => (
                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium text-foreground uppercase">{mock.name}</td>
                      <td className="p-4 text-right font-display text-lg font-semibold text-foreground">{mock.score}</td>
                      <td className="p-4 text-right text-muted-foreground">{mock.qa}</td>
                      <td className="p-4 text-right text-muted-foreground">{mock.reas}</td>
                      <td className={clsx("p-4 text-right font-medium", mock.eng < 15 ? "text-red-500" : "text-muted-foreground")}>
                        {mock.eng}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* NEW SIMULATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl relative">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="font-display tracking-widest text-primary font-bold text-xl uppercase flex items-center gap-2">
                <Target className="w-5 h-5" /> Enter Simulation Scores
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                    Overall Total Score (Out of 100)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={form.total}
                    onChange={(e) => setForm({ ...form, total: e.target.value })}
                    className="w-full bg-background border border-border p-3 rounded font-display text-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g. 58.75"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                    Quant (Out of 35)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={form.qa}
                    onChange={(e) => setForm({ ...form, qa: e.target.value })}
                    className="w-full bg-muted border border-border p-3 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                    Reasoning (Out of 35)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={form.reas}
                    onChange={(e) => setForm({ ...form, reas: e.target.value })}
                    className="w-full bg-muted border border-border p-3 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                    English (Out of 30)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    required
                    value={form.eng}
                    onChange={(e) => setForm({ ...form, eng: e.target.value })}
                    className="w-full bg-muted border border-border p-3 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-border flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold uppercase tracking-widest px-6 py-3 rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> {submitting ? "Uploading..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
