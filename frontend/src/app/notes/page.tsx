"use client";
import { useState, useEffect } from "react";
import { PenTool, Plus, Trash2, X } from "lucide-react";
import { getNotes, createNote, deleteNote } from "@/actions/notes";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", subject: "" });
  const [loading, setLoading] = useState(true);

  const loadData = async () => { setNotes(await getNotes()); setLoading(false); };
  useEffect(() => { loadData(); }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.content) return;
    await createNote({ title: form.title, content: form.content, subject: form.subject });
    setForm({ title: "", content: "", subject: "" }); setShowForm(false); loadData();
  };
  const handleDelete = async (id: string) => { await deleteNote(id); loadData(); };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-end justify-between border-b pb-4">
        <div><h1 className="font-display text-4xl font-bold tracking-tight flex items-center gap-3"><PenTool className="w-8 h-8 text-primary"/> Tactical Notes</h1><p className="font-mono text-muted-foreground mt-2 uppercase text-sm">{notes.length} notes saved</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-mono text-sm font-bold hover:bg-primary/90 transition"><Plus className="w-4 h-4"/> New Note</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-green-500/30 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.2)] w-full max-w-lg p-6 space-y-4 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
            <h2 className="font-display font-bold text-xl">New Note</h2>
            <div><label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Title</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="mt-1 w-full bg-background border border-green-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.2)]"/></div>
            <div><label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Subject (optional)</label><input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} className="mt-1 w-full bg-background border border-green-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.2)]" placeholder="e.g. Quantitative, Reasoning..."/></div>
            <div><label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Content</label><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={5} className="mt-1 w-full bg-background border border-green-500/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.2)]"/></div>
            <button onClick={handleSubmit} className="w-full py-3 bg-primary text-primary-foreground font-mono font-bold rounded-lg hover:bg-primary/90 transition">Save Note</button>
          </div>
        </div>
      )}
      {loading ? (
        <div className="h-48 flex items-center justify-center font-mono text-muted-foreground uppercase text-sm">Loading...</div>
      ) : notes.length === 0 ? (
        <div className="p-8 rounded-lg border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)] bg-card text-center"><p className="font-mono text-muted-foreground">No notes yet. Click &quot;New Note&quot; to capture your knowledge.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(n => (
            <div key={n.id} className="p-5 rounded-lg border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] bg-card hover:bg-muted/30 transition group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-display font-bold text-base">{n.title}</h3>
                <button onClick={() => handleDelete(n.id)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4"/></button>
              </div>
              {n.subject && <span className="text-[9px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">{n.subject}</span>}
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap line-clamp-4">{n.content}</p>
              <p className="text-[9px] font-mono text-muted-foreground mt-3">{new Date(n.updated_at).toLocaleDateString("en-IN")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}