"use client";

import { apiFetch, apiUrl } from "@/lib/api";

export async function logStudySession(
  durationMinutes: number,
  topicId: string,
  sessionType: string
) {
  if (!apiUrl()) return;
  await apiFetch("/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      duration_minutes: durationMinutes,
      topic_id: topicId || null,
      session_type: sessionType,
    }),
  });
}
