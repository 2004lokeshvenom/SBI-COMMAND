"use client";

import { apiFetch, apiUrl } from "@/lib/api";

const PLAN_START = new Date("2026-04-01T00:00:00+05:30");

export function getCurrentWeekNumber(): number {
  const now = new Date();
  const ms = 7 * 24 * 60 * 60 * 1000;
  const w = Math.floor((now.getTime() - PLAN_START.getTime()) / ms) + 1;
  return Math.min(17, Math.max(1, w));
}

export async function getCurrentWeek(): Promise<number> {
  return getCurrentWeekNumber();
}

async function fetchAllTopics() {
  if (!apiUrl()) return [];
  const res = await apiFetch("/api/topics/all");
  if (!res.ok) throw new Error("topics failed");
  return res.json();
}

export async function getAllWeeksData() {
  return fetchAllTopics();
}

export async function getAllTopics(opts?: { exam_type?: string }) {
  const data = await fetchAllTopics();
  const exam = opts?.exam_type;
  if (!exam || exam === "all") return data;
  return data.filter(
    (t: { exam_type: string }) =>
      t.exam_type === exam || t.exam_type === "both"
  );
}

export async function getSubjectProgress() {
  if (!apiUrl()) return [];
  const res = await apiFetch("/api/topics/subject-progress");
  if (!res.ok) throw new Error("progress failed");
  return res.json();
}

export async function getTodaysTopics(week: number) {
  const all: any[] = await fetchAllTopics();
  return all
    .filter((t) => t.week === week)
    .map((t) => ({
      id: t.id,
      title: t.name,
      task: t.chapter || t.subject,
      status: t.status,
    }));
}

export async function markTopicStudied(topicId: string, confidence: number) {
  if (!apiUrl()) return;
  await apiFetch("/api/topics/mark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topicId,
      confidence,
      status: "studied",
    }),
  });
}

export async function unmarkTopicStudied(topicId: string) {
  if (!apiUrl()) return;
  await apiFetch("/api/topics/mark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topicId,
      confidence: 0,
      status: "not_started",
    }),
  });
}
