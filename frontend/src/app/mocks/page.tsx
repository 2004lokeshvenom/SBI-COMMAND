"use client";
import { useState, useEffect, useMemo } from "react";
import { Target, Plus, X, TrendingUp, Award, AlertTriangle, ChevronUp, ChevronDown, Trophy, Flame, Activity, Edit2, Trash2 } from "lucide-react";
import { getMockTests, createMockTest, updateMockTest, deleteMockTest } from "@/actions/mocks";
import clsx from "clsx";

// SBI PO Real Exam Constants (Max Marks)
const SBI_PO = {
  PRELIMS: { english: 40, quant: 30, reasoning: 30, total: 100 },
  MAINS: { reasoning: 60, di: 60, ga: 60, english: 20, desc: 50, total: 250 },
};

const FORMATS = [
  { value: "weekly", label: "🗓️ Weekly Mock" },
  { value: "sectional_quant", label: "📊 Sectional: Quant (Prelims)" },
  { value: "sectional_reasoning", label: "🧠 Sectional: Reasoning" },
  { value: "sectional_di", label: "📈 Sectional: Data Analysis (Mains)" },
  { value: "sectional_english", label: "📝 Sectional: English" },
  { value: "sectional_ga", label: "🌍 Sectional: GA / Economy (Mains)" },
  { value: "sectional_desc", label: "✍️ Sectional: Descriptive (Mains)" },
  { value: "prelims", label: "🟢 Prelims Full" },
  { value: "mains", label: "🔴 Mains Full" },
  { value: "prelims_mains", label: "🔵 Prelims + Mains" },
];

const SUBJECT_COLORS = {
  quant: "bg-blue-400 text-blue-400",
  reasoning: "bg-purple-400 text-purple-400",
  english: "bg-green-400 text-green-400",
  di: "bg-teal-400 text-teal-400",
  ga: "bg-amber-400 text-amber-400",
  desc: "bg-slate-400 text-slate-400"
};

const LABELS: Record<string, string> = {
  quant: "Quant (Prelims)",
  reasoning_pre: "Reasoning (Prelims)",
  reasoning_mains: "Reasoning (Mains)",
  english_pre: "English (Prelims)",
  english_mains: "English (Mains)",
  di: "DI (Mains)",
  ga: "GA (Mains)",
  desc: "Descriptive (Mains)"
};

export default function MocksTrackerSBI() {
  const [mocks, setMocks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  // Dynamic Form State
  const [formType, setFormType] = useState("weekly");
  const [testName, setTestName] = useState("");
  const [notes, setNotes] = useState("");
  const [scores, setScores] = useState<Record<string, { obtained: string; outOf: string }>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    // Replace with your actual fetch
    const data = await getMockTests();
    setMocks(data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Set default "out of" values when format changes
  useEffect(() => {
    if (editingId) return; // Do not overwrite user's edit data when formType initializes
    const defaultScores: any = {};
    const setDef = (key: string, outOf: number) => { defaultScores[key] = { obtained: "", outOf: outOf.toString() }; };

    if (formType === "weekly") {
      setDef("quant", SBI_PO.PRELIMS.quant);
      setDef("reasoning_pre", SBI_PO.PRELIMS.reasoning);
      setDef("reasoning_mains", SBI_PO.MAINS.reasoning);
      setDef("english_pre", SBI_PO.PRELIMS.english);
      setDef("english_mains", SBI_PO.MAINS.english);
      setDef("di", SBI_PO.MAINS.di);
      setDef("ga", SBI_PO.MAINS.ga);
      setDef("desc", SBI_PO.MAINS.desc);
    } else {
      if (formType.includes("quant") || formType === "prelims" || formType === "prelims_mains") setDef("quant", SBI_PO.PRELIMS.quant);
      if (formType.includes("reasoning") || formType === "prelims") setDef("reasoning_pre", SBI_PO.PRELIMS.reasoning);
      if (formType === "mains" || formType === "prelims_mains" || formType.includes("reasoning")) setDef("reasoning_mains", SBI_PO.MAINS.reasoning);
      if (formType.includes("di") || formType === "mains" || formType === "prelims_mains") setDef("di", SBI_PO.MAINS.di);
      if (formType.includes("english") || formType === "prelims") setDef("english_pre", SBI_PO.PRELIMS.english);
      if (formType === "mains" || formType === "prelims_mains" || formType.includes("english")) setDef("english_mains", SBI_PO.MAINS.english);
      if (formType.includes("ga") || formType === "mains" || formType === "prelims_mains") setDef("ga", SBI_PO.MAINS.ga);
      if (formType.includes("desc") || formType === "mains" || formType === "prelims_mains") setDef("desc", SBI_PO.MAINS.desc);
    }

    setScores(defaultScores);
  }, [formType]);

  const handleScoreChange = (subject: string, field: "obtained" | "outOf", value: string) => {
    setScores(prev => ({ ...prev, [subject]: { ...prev[subject], [field]: value } }));
  };

  const calculateNormalized = (subject: string) => {
    if (!scores[subject] || !scores[subject].obtained || !scores[subject].outOf) return 0;
    const obtained = parseFloat(scores[subject].obtained);
    const outOf = parseFloat(scores[subject].outOf);
    if (isNaN(obtained) || isNaN(outOf) || outOf === 0) return 0;

    let realMax = 100;
    if (subject === "quant") realMax = SBI_PO.PRELIMS.quant;
    if (subject === "reasoning_pre") realMax = SBI_PO.PRELIMS.reasoning;
    if (subject === "reasoning_mains") realMax = SBI_PO.MAINS.reasoning;
    if (subject === "di") realMax = SBI_PO.MAINS.di;
    if (subject === "english_pre") realMax = SBI_PO.PRELIMS.english;
    if (subject === "english_mains") realMax = SBI_PO.MAINS.english;
    if (subject === "ga") realMax = SBI_PO.MAINS.ga;
    if (subject === "desc") realMax = SBI_PO.MAINS.desc;

    return Number(((obtained / outOf) * realMax).toFixed(2));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setTestName("");
    setNotes("");
    setFormType("weekly");
  };

  const handleSubmit = async () => {
    if (!testName) return;
    
    const formatClean = FORMATS.find(f => f.value === formType)?.label.replace(/^[^\w\s]+/, '').trim() || "Test";
    
    const normalizedData: any = {
      test_name: `[${formatClean}] ${testName}`,
      format: formType,
      notes: notes,
      norm_quant: calculateNormalized("quant"),
      norm_reasoning_pre: calculateNormalized("reasoning_pre"),
      norm_reasoning_mains: calculateNormalized("reasoning_mains"),
      norm_di: calculateNormalized("di"),
      norm_english_pre: calculateNormalized("english_pre"),
      norm_english_mains: calculateNormalized("english_mains"),
      norm_ga: calculateNormalized("ga"),
      norm_desc: calculateNormalized("desc"),
    };
    if (!editingId) {
      normalizedData.created_at = new Date().toISOString();
    }

    let totalObtained = 0;
    let totalMax = 0;
    
    Object.keys(scores).forEach(sub => {
      // Only include if user typed a valid number
      if (scores[sub].obtained.trim() !== "" && !isNaN(parseFloat(scores[sub].obtained))) {
        totalObtained += calculateNormalized(sub);
        
        if (sub === "quant") totalMax += SBI_PO.PRELIMS.quant;
        if (sub === "reasoning_pre") totalMax += SBI_PO.PRELIMS.reasoning;
        if (sub === "reasoning_mains") totalMax += SBI_PO.MAINS.reasoning;
        if (sub === "di") totalMax += SBI_PO.MAINS.di;
        if (sub === "english_pre") totalMax += SBI_PO.PRELIMS.english;
        if (sub === "english_mains") totalMax += SBI_PO.MAINS.english;
        if (sub === "ga") totalMax += SBI_PO.MAINS.ga;
        if (sub === "desc") totalMax += SBI_PO.MAINS.desc;
      }
    });

    normalizedData.total_normalized_pct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    if (editingId) {
      await updateMockTest(editingId, normalizedData);
    } else {
      await createMockTest(normalizedData);
    }
    
    closeForm();
    loadData();
  };

  const handleEdit = (m: any) => {
    setEditingId(m.id);
    setFormType(m.format || "prelims");
    setTestName(m.test_name.replace(/^\[.*?\]\s*/, ""));
    setNotes(m.notes || "");
    
    const mapScore = (normValue: number, realMax: number) => {
      if (normValue > 0) return { obtained: parseFloat(normValue.toFixed(1)).toString(), outOf: realMax.toString() };
      return null;
    };
    
    const newScores: any = {};
    if (m.norm_quant > 0 || m.quant_score > 0) newScores.quant = mapScore(m.norm_quant || m.quant_score, SBI_PO.PRELIMS.quant);
    const rePre = m.norm_reasoning_pre || (!m.format || m.format === 'prelims' || m.format.includes('sectional') ? m.norm_reasoning || m.reasoning_score : 0);
    if (rePre > 0) newScores.reasoning_pre = mapScore(rePre, SBI_PO.PRELIMS.reasoning);
    const reMains = m.norm_reasoning_mains || (m.format === 'mains' || m.format === 'prelims_mains' ? m.norm_reasoning : 0);
    if (reMains > 0) newScores.reasoning_mains = mapScore(reMains, SBI_PO.MAINS.reasoning);
    const enPre = m.norm_english_pre || (!m.format || m.format === 'prelims' || m.format.includes('sectional') ? m.norm_english || m.english_score : 0);
    if (enPre > 0) newScores.english_pre = mapScore(enPre, SBI_PO.PRELIMS.english);
    const enMains = m.norm_english_mains || (m.format === 'mains' || m.format === 'prelims_mains' ? m.norm_english : 0);
    if (enMains > 0) newScores.english_mains = mapScore(enMains, SBI_PO.MAINS.english);
    if (m.norm_di > 0) newScores.di = mapScore(m.norm_di, SBI_PO.MAINS.di);
    if (m.norm_ga > 0 || m.ga_score > 0) newScores.ga = mapScore(m.norm_ga || m.ga_score, SBI_PO.MAINS.ga);
    if (m.norm_desc > 0) newScores.desc = mapScore(m.norm_desc, SBI_PO.MAINS.desc);
    
    Object.keys(newScores).forEach(k => { if (!newScores[k]) delete newScores[k]; });
    setScores(newScores);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("First confirm: Are you sure you want to delete this mock?")) {
      if (window.confirm("Second confirm: Are you REALLY sure? This action is permanent!")) {
        await deleteMockTest(id);
        loadData();
      }
    }
  };

  const filteredMocks = useMemo(() => {
    if (filterType === "all") return mocks;
    return mocks.filter(m => (m.format || "").includes(filterType) || m.test_name.toLowerCase().includes(filterType));
  }, [mocks, filterType]);

  const stats = useMemo(() => {
    if (mocks.length === 0) return null;
    
    // Core Subject Averages (Using only Normalized Data + Legacy fallback)
    const getSubAvg = (key: string, realMax: number, oldKeys: string[] = []) => {
      const valid = mocks.filter(m => m[key] > 0 || oldKeys.some(k => m[k] > 0));
      if (valid.length === 0) return { avg: 0, pct: 0, max: realMax };
      
      const sum = valid.reduce((acc, m) => {
        let val = m[key];
        if (!val || val === 0) {
          for (const ok of oldKeys) { if (m[ok] > 0) { val = m[ok]; break; } }
        }
        return acc + (val || 0);
      }, 0);
      const avg = sum / valid.length;
      return { avg: Number(avg.toFixed(1)), pct: Math.round((avg / realMax) * 100), max: realMax };
    };

    const sectionAvg = [
      { key: "quant", label: "Quant (Prelims)", short: "QA(P)", data: getSubAvg("norm_quant", SBI_PO.PRELIMS.quant, ["quant_score"]), style: SUBJECT_COLORS.quant },
      { key: "reasoning_pre", label: "Reasoning (Prelims)", short: "RE(P)", data: getSubAvg("norm_reasoning_pre", SBI_PO.PRELIMS.reasoning, ["norm_reasoning", "reasoning_score"]), style: SUBJECT_COLORS.reasoning },
      { key: "reasoning_mains", label: "Reasoning (Mains)", short: "RE(M)", data: getSubAvg("norm_reasoning_mains", SBI_PO.MAINS.reasoning, ["norm_reasoning"]), style: SUBJECT_COLORS.reasoning },
      { key: "english_pre", label: "English (Prelims)", short: "EN(P)", data: getSubAvg("norm_english_pre", SBI_PO.PRELIMS.english, ["norm_english", "english_score"]), style: SUBJECT_COLORS.english },
      { key: "english_mains", label: "English (Mains)", short: "EN(M)", data: getSubAvg("norm_english_mains", SBI_PO.MAINS.english, ["norm_english"]), style: SUBJECT_COLORS.english },
      { key: "di", label: "DI (Mains)", short: "DI(M)", data: getSubAvg("norm_di", SBI_PO.MAINS.di), style: SUBJECT_COLORS.di },
      { key: "ga", label: "GA (Mains)", short: "GA(M)", data: getSubAvg("norm_ga", SBI_PO.MAINS.ga, ["ga_score"]), style: SUBJECT_COLORS.ga },
    ].filter(s => s.data.avg > 0);

    const pcts = mocks.map(m => m.total_normalized_pct || (m.total_marks > 0 ? (m.total_score / m.total_marks * 100) : 0)).filter(p => p > 0);
    const overallAvg = pcts.length > 0 ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
    const best = pcts.length > 0 ? Math.round(Math.max(...pcts)) : 0;
    const latest = pcts.length > 0 ? Math.round(pcts[0]) : 0;
    
    const weakest = sectionAvg.length > 0 ? [...sectionAvg].sort((a, b) => a.data.pct - b.data.pct)[0] : null;
    const strongest = sectionAvg.length > 0 ? [...sectionAvg].sort((a, b) => b.data.pct - a.data.pct)[0] : null;

    return { overallAvg, best, latest, sectionAvg, weakest, strongest };
  }, [mocks]);

  if (loading) return <div className="h-48 flex items-center justify-center font-mono text-muted-foreground uppercase text-sm tracking-widest">🎯 Initializing SBI PO Engine...</div>;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
            🎯 <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">SBI PO Mock Engine</span>
          </h1>
          <p className="font-mono text-muted-foreground mt-1 text-xs uppercase tracking-widest">Normalized Tracking • {mocks.length} Tests Logged</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-mono text-xs font-bold tracking-wider hover:opacity-90 transition shadow-[0_0_15px_rgba(249,115,22,0.4)]">
          <Plus className="w-4 h-4" /> Log Normalized Mock
        </button>
      </div>

      {stats && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Activity className="w-3.5 h-3.5" />, label: "Norm. Average", value: `${stats.overallAvg}%`, color: "text-foreground" },
              { icon: <Trophy className="w-3.5 h-3.5" />, label: "Best Accuracy", value: `${stats.best}%`, color: "text-green-400" },
              { icon: <Flame className="w-3.5 h-3.5" />, label: "Latest Mock", value: `${stats.latest}%`, color: "text-orange-400" },
              { icon: <Target className="w-3.5 h-3.5" />, label: "Target", value: "85%", color: "text-amber-400" },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">{s.icon}<span className="font-mono text-[9px] uppercase tracking-widest">{s.label}</span></div>
                <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Subject Averages (Normalized) */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
              <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-4">📊 Normalized Subject Proficiency</h3>
              <div className="space-y-5">
                {stats.sectionAvg.map(s => (
                  <div key={s.key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className={`font-mono text-xs font-bold ${s.style.split(" ")[1]}`}>{s.label}</span>
                      <span className="font-mono text-xs text-muted-foreground">{s.data.avg} / {s.data.max} <span className="opacity-50">({s.data.pct}%)</span></span>
                    </div>
                    <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${s.style.split(" ")[0]}`} style={{ width: `${s.data.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Insights */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-md">
              <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">💡 Focus Engine</h3>
              {stats.weakest && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-1"><AlertTriangle className="w-3.5 h-3.5 text-red-400" /><span className="font-mono text-[10px] text-red-400 uppercase tracking-widest font-bold">⚠️ Priority Area</span></div>
                  <p className="text-sm font-medium">{stats.weakest.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Normalized Avg: <span className="text-red-400">{stats.weakest.data.avg}/{stats.weakest.data.max}</span></p>
                </div>
              )}
              {stats.strongest && (
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-1"><Award className="w-3.5 h-3.5 text-green-400" /><span className="font-mono text-[10px] text-green-400 uppercase tracking-widest font-bold">💪 Strongest</span></div>
                  <p className="text-sm font-medium">{stats.strongest.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Normalized Avg: <span className="text-green-400">{stats.strongest.data.avg}/{stats.strongest.data.max}</span></p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Dynamic Entry Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 pb-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0f0f11] border border-orange-500/30 rounded-2xl shadow-[0_0_40px_rgba(249,115,22,0.1)] w-full max-w-xl p-6 relative max-h-[80vh] overflow-y-auto">
            <button onClick={closeForm} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition"><X className="w-5 h-5" /></button>
            <h2 className="font-display font-bold text-xl mb-4 text-white">{editingId ? "📝 Edit Test" : "📝 Log Test (Auto-Normalize)"}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Format</label>
                <select value={formType} onChange={e => setFormType(e.target.value)} className="mt-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500">
                  {FORMATS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              
              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Identifier / Provider</label>
                <input type="text" value={testName} onChange={e => setTestName(e.target.value)} placeholder="e.g. PracticeMock Prelims #4" className="mt-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
              </div>

              <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 space-y-3">
                <p className="font-mono text-[10px] text-orange-400 uppercase tracking-widest mb-2">Scores (Leave blank if not taken)</p>
                {Object.keys(scores).map(subject => {
                  const subLabel = LABELS[subject] || subject.toUpperCase();
                  const normValue = calculateNormalized(subject);
                  
                  return (
                    <div key={subject} className="flex items-center gap-3">
                      <div className="w-32 font-mono text-[10px] text-muted-foreground tracking-widest truncate" title={subLabel}>{subLabel}</div>
                      <input type="number" placeholder="Marks" value={scores[subject].obtained} onChange={e => handleScoreChange(subject, "obtained", e.target.value)} className="w-20 bg-black/50 border border-white/10 rounded-md px-2 py-1.5 text-sm text-center focus:border-orange-500 text-white" />
                      <span className="text-muted-foreground text-xs">/</span>
                      <input type="number" placeholder="Out Of" value={scores[subject].outOf} onChange={e => handleScoreChange(subject, "outOf", e.target.value)} className="w-20 bg-black/50 border border-white/10 rounded-md px-2 py-1.5 text-sm text-center focus:border-orange-500 text-white" />
                      
                      <div className="ml-auto text-right w-16">
                        {scores[subject].obtained.trim() !== "" ? (
                          <span className="block font-mono text-[10px] text-green-400">Norm: {normValue}</span>
                        ) : (
                          <span className="block font-mono text-[10px] text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Analysis Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="mt-1 w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" placeholder="Mistakes? Time management issues?" />
              </div>

              <button onClick={handleSubmit} className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-mono font-bold rounded-xl hover:opacity-90 transition shadow-[0_0_20px_rgba(249,115,22,0.3)]">🔥 Process & Save</button>
            </div>
          </div>
        </div>
      )}

      {/* History Log */}
      <div>
        <h3 className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-3">📋 Normalized History</h3>
        <div className="space-y-3">
          {filteredMocks.map((m, idx) => {
            // Fallbacks for older data points seamlessly
            const isOld = !m.format || !m.total_normalized_pct;
            const displayPct = m.total_normalized_pct || (m.total_marks > 0 ? (m.total_score / m.total_marks * 100) : 0);
            
            const qaPre = m.norm_quant || m.quant_score || 0;
            const rePre = m.norm_reasoning_pre || (isOld ? m.reasoning_score : 0) || ((!m.format || m.format === 'prelims' || m.format.includes('sectional')) ? m.norm_reasoning : 0);
            const reMains = m.norm_reasoning_mains || (!isOld && (m.format === 'mains' || m.format === 'prelims_mains') ? m.norm_reasoning : 0);
            const enPre = m.norm_english_pre || (isOld ? m.english_score : 0) || ((!m.format || m.format === 'prelims' || m.format.includes('sectional')) ? m.norm_english : 0);
            const enMains = m.norm_english_mains || (!isOld && (m.format === 'mains' || m.format === 'prelims_mains') ? m.norm_english : 0);
            const gaMains = m.norm_ga || m.ga_score || 0;
            
            const formatName = m.format ? (FORMATS.find(f => f.value === m.format)?.label.replace(/^[^\w\s]+/, '').trim() || m.format) : "Legacy";

            return (
              <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-orange-500/30 transition backdrop-blur-sm group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">{m.test_name}</h4>
                    <p className="text-[9px] font-mono text-muted-foreground mt-0.5">{new Date(m.test_date || m.created_at || Date.now()).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 mr-2">
                      <button onClick={() => handleEdit(m)} className="p-1.5 rounded-md hover:bg-orange-500/20 text-orange-400/70 hover:text-orange-400 transition" title="Edit Mock">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition" title="Delete Mock">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div>
                      <div className={clsx("font-display text-lg font-bold", displayPct >= 80 ? "text-green-400" : displayPct >= 60 ? "text-amber-400" : "text-red-400")}>
                        {displayPct?.toFixed(1)}%
                      </div>
                      <span className="font-mono text-[8px] text-muted-foreground uppercase">{formatName} Score</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3 flex-wrap">
                  {qaPre > 0 && <span className="font-mono text-[10px] text-blue-400 bg-blue-400/10 px-2 py-1 rounded">QA(P): {qaPre}/{SBI_PO.PRELIMS.quant}</span>}
                  {rePre > 0 && <span className="font-mono text-[10px] text-purple-400 bg-purple-400/10 px-2 py-1 rounded">RE(P): {rePre}/{SBI_PO.PRELIMS.reasoning}</span>}
                  {reMains > 0 && <span className="font-mono text-[10px] text-purple-400 bg-purple-400/10 px-2 py-1 rounded">RE(M): {reMains}/{SBI_PO.MAINS.reasoning}</span>}
                  {enPre > 0 && <span className="font-mono text-[10px] text-green-400 bg-green-400/10 px-2 py-1 rounded">EN(P): {enPre}/{SBI_PO.PRELIMS.english}</span>}
                  {enMains > 0 && <span className="font-mono text-[10px] text-green-400 bg-green-400/10 px-2 py-1 rounded">EN(M): {enMains}/{SBI_PO.MAINS.english}</span>}
                  {m.norm_di > 0 && <span className="font-mono text-[10px] text-teal-400 bg-teal-400/10 px-2 py-1 rounded">DI(M): {m.norm_di}/{SBI_PO.MAINS.di}</span>}
                  {gaMains > 0 && <span className="font-mono text-[10px] text-amber-400 bg-amber-400/10 px-2 py-1 rounded">GA(M): {gaMains}/{SBI_PO.MAINS.ga}</span>}
                  {m.norm_desc > 0 && <span className="font-mono text-[10px] text-slate-400 bg-slate-400/10 px-2 py-1 rounded">DESC(M): {m.norm_desc}/{SBI_PO.MAINS.desc}</span>}
                </div>
                {m.notes && <p className="mt-3 text-xs text-muted-foreground border-l-2 border-orange-500/50 pl-2">{m.notes}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}