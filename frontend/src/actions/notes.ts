"use client";

import { apiFetch, apiUrl } from "@/lib/api";

export async function fetchNotes(category: string) {
  if (!apiUrl()) return [];
  const q = category === "All" ? "" : `?category=${encodeURIComponent(category)}`;
  const res = await apiFetch(`/api/notes${q}`);
  if (!res.ok) throw new Error("notes list failed");
  return res.json();
}

export async function saveNote(title: string, category: string, content: string) {
  if (!apiUrl()) return;
  await apiFetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, category, content }),
  });
}

export async function deleteNote(id: string) {
  if (!apiUrl()) return;
  await apiFetch(`/api/notes/${id}`, { method: "DELETE" });
}
