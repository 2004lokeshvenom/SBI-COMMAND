"use client";

import { apiFetch, apiUrl } from "@/lib/api";

export async function getUserStats() {
  if (!apiUrl()) {
    return { streak: 0, hoursLogged: 0, targetHours: 6 };
  }
  const res = await apiFetch("/api/user/stats");
  if (!res.ok) throw new Error("stats failed");
  return res.json();
}

export async function completeNightDebrief(
  mood: string,
  learned: string,
  improve: string,
  difficulty?: string | null
) {
  if (!apiUrl()) return;
  await apiFetch("/api/user/debrief", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mood, learned, improve, difficulty }),
  });
}
