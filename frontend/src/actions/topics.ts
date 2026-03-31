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

export async function getAllWeeksData() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  const topics = await prisma.topic.findMany({
    include: { chapter: { include: { subject: true } }, progress: { where: { user_id: user.id } } },
    orderBy: [{ week_number: "asc" }, { chapter: { order_index: "asc" } }]
  });
  return topics.map((t: any) => ({
    id: t.id, name: t.name, week: t.week_number, subject: t.chapter.subject.name,
    subjectCode: t.chapter.subject.code, subjectColor: t.chapter.subject.color,
    priority: t.priority, exam_type: t.exam_type,
    status: t.progress.length > 0 ? t.progress[0].status : "not_started",
    confidence: t.progress.length > 0 ? t.progress[0].confidence : 0,
  }));
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
  const subjects = await prisma.subject.findMany({
    include: { chapters: { include: { topics: { include: { progress: { where: { user_id: user.id } } } } } } }
  });
  return subjects.map((s: any) => {
    const allTopics = s.chapters.flatMap((c: any) => c.topics);
    const total = allTopics.length;
    const studied = allTopics.filter((t: any) => t.progress.length > 0 && t.progress[0].status !== "not_started").length;
    return { code: s.code, name: s.name, color: s.color, total, studied, percent: total > 0 ? Math.round((studied / total) * 100) : 0 };
  });
}
