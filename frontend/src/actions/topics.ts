"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCurrentWeek(): Promise<number> {
  const start = new Date("2026-04-01");
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(Math.floor(diffDays / 7) + 1, 17));
}

export async function getAllTopics(filters?: { subject?: string; exam_type?: string; week?: number }) {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  const topics = await prisma.topic.findMany({
    include: { chapter: { include: { subject: true } }, progress: { where: { user_id: user.id } } },
    orderBy: [{ week_number: "asc" }, { chapter: { order_index: "asc" } }]
  });
  let filtered = topics as any[];
  if (filters?.week) filtered = filtered.filter((t: any) => t.week_number === filters.week);
  if (filters?.exam_type && filters.exam_type !== "all") filtered = filtered.filter((t: any) => t.exam_type === filters.exam_type || t.exam_type === "both");
  if (filters?.subject && filters.subject !== "all") filtered = filtered.filter((t: any) => t.chapter.subject.code === filters.subject);
  return filtered.map((t: any) => ({
    id: t.id, name: t.name, chapter: t.chapter.name, subject: t.chapter.subject.name,
    subjectCode: t.chapter.subject.code, subjectColor: t.chapter.subject.color,
    week: t.week_number, phase: t.phase, hours: t.estimated_hours, priority: t.priority, exam_type: t.exam_type,
    status: t.progress.length > 0 ? t.progress[0].status : "not_started",
    confidence: t.progress.length > 0 ? t.progress[0].confidence : 0,
    lastStudied: t.progress.length > 0 && t.progress[0].last_studied_at ? t.progress[0].last_studied_at.toISOString() : null,
  }));
}

/** Lean fields only — avoids loading huge nested graphs into Node memory. */
export async function getAllWeeksData() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  return fetchAllWeeksDataForUser(user.id);
}

export async function fetchAllWeeksDataForUser(userId: string) {
  const topics = await prisma.topic.findMany({
    select: {
      id: true,
      name: true,
      week_number: true,
      priority: true,
      exam_type: true,
      chapter: {
        select: {
          subject: { select: { name: true, code: true, color: true } },
        },
      },
      progress: {
        where: { user_id: userId },
        select: { status: true, confidence: true },
        take: 1,
      },
    },
    orderBy: [{ week_number: "asc" }, { chapter: { order_index: "asc" } }],
  });
  return topics.map((t) => {
    const p = t.progress[0];
    return {
      id: t.id,
      name: t.name,
      week: t.week_number,
      subject: t.chapter.subject.name,
      subjectCode: t.chapter.subject.code,
      subjectColor: t.chapter.subject.color,
      priority: t.priority,
      exam_type: t.exam_type,
      status: p?.status ?? "not_started",
      confidence: p?.confidence ?? 0,
    };
  });
}

export async function markTopicStudied(topicId: string, confidence: number) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  let status = "studied";
  if (confidence >= 5) status = "mastered"; else if (confidence >= 3) status = "revised"; else if (confidence >= 1) status = "in_progress";
  await prisma.topicProgress.upsert({
    where: { user_id_topic_id: { user_id: user.id, topic_id: topicId } },
    update: { status, confidence, last_studied_at: new Date(), times_revised: { increment: 1 } },
    create: { user_id: user.id, topic_id: topicId, status, confidence, first_studied_at: new Date(), last_studied_at: new Date(), times_revised: 1 }
  });
  const intervalDays = confidence >= 4 ? 7 : confidence >= 3 ? 3 : 1;
  const nextReview = new Date(); nextReview.setDate(nextReview.getDate() + intervalDays);
  await prisma.revisionSchedule.upsert({
    where: { user_id_topic_id: { user_id: user.id, topic_id: topicId } },
    update: { next_review_date: nextReview, last_reviewed_at: new Date(), repetition_count: { increment: 1 } },
    create: { user_id: user.id, topic_id: topicId, next_review_date: nextReview, ease_factor: 2.5, interval_days: intervalDays, repetition_count: 1 }
  });
  revalidatePath("/topics"); revalidatePath("/"); revalidatePath("/revision");
  return { success: true };
}

export async function unmarkTopicStudied(topicId: string) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  await prisma.topicProgress.upsert({
    where: { user_id_topic_id: { user_id: user.id, topic_id: topicId } },
    update: { status: "not_started", confidence: 0 },
    create: { user_id: user.id, topic_id: topicId, status: "not_started", confidence: 0 }
  });
  revalidatePath("/topics"); revalidatePath("/"); revalidatePath("/revision");
  return { success: true };
}

export async function getSubjectProgress() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  return fetchSubjectProgressForUser(user.id);
}

/** Count-based — does NOT load every topic row into RAM (fixes dev OOM on large syllabi). */
export async function fetchSubjectProgressForUser(userId: string) {
  const subjects = await prisma.subject.findMany({
    select: { id: true, code: true, name: true, color: true },
  });
  const out: { code: string; name: string; color: string; total: number; studied: number; percent: number }[] = [];
  for (const s of subjects) {
    const total = await prisma.topic.count({ where: { chapter: { subject_id: s.id } } });
    const studied =
      total === 0
        ? 0
        : await prisma.topic.count({
            where: {
              chapter: { subject_id: s.id },
              progress: { some: { user_id: userId, status: { not: "not_started" } } },
            },
          });
    out.push({
      code: s.code,
      name: s.name,
      color: s.color,
      total,
      studied,
      percent: total > 0 ? Math.round((studied / total) * 100) : 0,
    });
  }

  // Sort strictly by requested curriculum order
  const SUBJECT_ORDER = ["QA", "RE", "EN", "DI", "GA", "REV", "MOCK"];
  out.sort((a, b) => {
    const idxA = SUBJECT_ORDER.indexOf(a.code);
    const idxB = SUBJECT_ORDER.indexOf(b.code);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  return out;
}
