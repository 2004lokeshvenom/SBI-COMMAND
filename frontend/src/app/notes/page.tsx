"use client";

import { useState, useEffect } from "react";
import { PenTool, Search, PlusCircle, Trash2, Tag, BookOpen } from "lucide-react";
import clsx from "clsx";
import { fetchNotes, saveNote, deleteNote } from "@/actions/notes";

const CATEGORIES = ["All", "General", "Quant", "Reasoning", "English", "Errors"];

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  // View State
  const [selectedNote, setSelectedNote] = useState<any | null>(null);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await fetchNotes(activeCategory);
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [activeCategory]);

  const handleCreate = () => {
    setIsEditing(true);
    setSelectedNote(null);
    setEditTitle("");
    setEditCategory("General");
    setEditContent("");
  };

  const handleSave = async () => {
    if (!editTitle || !editContent) return;
    setSaving(true);
    await saveNote(editTitle, editCategory, editContent);
    await loadNotes();
    setIsEditing(false);
    setSaving(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this tactical note?")) return;
    await deleteNote(id);
    if (selectedNote?.id === id) setSelectedNote(null);
    await loadNotes();
  };

  const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 pb-6">
      
      {/* LEFT: NOTE DIRECTORY */}
      <div className="w-full md:w-1/3 h-full flex flex-col border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        
        {/* Header & Search */}
        <div className="p-4 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display font-bold uppercase tracking-widest flex items-center gap-2 text-foreground">
              <PenTool className="w-4 h-4 text-primary" /> Intelligence Log
            </h1>
            <button 
              onClick={handleCreate}
              className="text-primary hover:text-primary/80 transition"
              title="New Data Entry"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border pl-9 pr-3 py-2 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "px-3 py-1 rounded-full whitespace-nowrap font-mono text-[10px] font-bold tracking-widest uppercase transition-colors",
                  activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-xs font-mono uppercase text-muted-foreground">Decoding Intel...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono uppercase text-muted-foreground opacity-60">No Intelligence Found.</div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotes.map(note => (
                <div 
                  key={note.id} 
                  onClick={() => { setSelectedNote(note); setIsEditing(false); }}
                  className={clsx(
                    "p-4 cursor-pointer hover:bg-muted/50 transition relative group",
                    selectedNote?.id === note.id && "bg-muted/80 border-l-2 border-l-primary"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm truncate pr-6 text-foreground">{note.title}</h3>
                    <button 
                      onClick={(e) => handleDelete(note.id, e)}
                      className="absolute right-4 top-4 text-red-500/0 group-hover:text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                    {new Date(note.updated_at).toLocaleDateString()} • <span className="text-primary">{note.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: NOTE VIEWER / EDITOR */}
      <div className="w-full md:w-2/3 h-full border border-border bg-card rounded-xl flex flex-col overflow-hidden shadow-sm">
        {isEditing ? (
          <div className="h-full flex flex-col p-6 space-y-4">
            <div className="flex justify-between border-b border-border pb-4">
              <h2 className="font-display font-medium uppercase tracking-widest text-primary flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Drafting Intelligence
              </h2>
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 font-mono text-xs uppercase hover:bg-muted rounded text-muted-foreground">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold text-xs uppercase tracking-widest rounded shadow-sm disabled:opacity-50 transition-colors">
                  {saving ? "Encrypting..." : "Save Log"}
                </button>
              </div>
            </div>
            
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Log Title (e.g., Syllogism Reverse Theory)" 
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 bg-background border border-border p-3 rounded font-display text-lg focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <select 
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="bg-background border border-border p-3 rounded font-mono text-xs uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              >
                {CATEGORIES.filter(c => c !== "All").map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <textarea 
              placeholder="Record operational directives, error patterns, or high-value formulae here..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="flex-1 bg-background border border-border p-4 rounded resize-none font-mono text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
            ></textarea>
          </div>
        ) : selectedNote ? (
          <div className="h-full flex flex-col p-8 overflow-y-auto">
            <div className="mb-8 border-b border-border pb-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <Tag className="w-3 h-3" /> {selectedNote.category}
                </span>
                <span className="font-mono text-xs text-muted-foreground uppercase opacity-80">
                  {new Date(selectedNote.updated_at).toLocaleString()}
                </span>
              </div>
              <h1 className="font-display font-bold text-3xl text-foreground leading-tight">
                {selectedNote.title}
              </h1>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none font-sans text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {selectedNote.content}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center text-muted-foreground opacity-50 p-8 text-center bg-card/50">
            <BookOpen className="w-24 h-24 mb-6 stroke-1 shadow-sm" />
            <h2 className="font-display text-2xl font-medium tracking-wide">Awaiting Selection</h2>
            <p className="font-mono text-xs uppercase tracking-widest mt-2 max-w-sm">Select an intelligence log from the directory or initiate a new entry.</p>
          </div>
        )}
      </div>

    </div>
  );
}
