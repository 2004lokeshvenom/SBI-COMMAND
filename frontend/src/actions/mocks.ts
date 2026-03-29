"use client";

import { apiFetch, apiUrl } from "@/lib/api";

export async function getMockHistory() {
  if (!apiUrl()) return [];
  const res = await apiFetch("/api/mocks");
  if (!res.ok) throw new Error("mocks failed");
  return res.json();
}

export async function submitMockScore(
  total: number,
  qa: number,
  reas: number,
  eng: number
) {
  if (!apiUrl()) return;
  await apiFetch("/api/mocks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ total, qa, reas, eng }),
  });
}
