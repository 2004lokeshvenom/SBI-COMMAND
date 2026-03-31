"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOverdueRevisions() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  const now = new Date();
  const overdue = await prisma.revisionSchedule.findMany({
    where: { user_id: user.id, next_review_date: { lte: now } },
    include: { topic: { include: { chapter: { include: { subject: true } } } } },
    orderBy: { next_review_date: "asc" }, take: 10
  });
  return overdue.map((r: any) => {
    const daysOverdue = Math.floor((now.getTime() - new Date(r.next_review_date).getTime()) / (1000 * 60 * 60 * 24));
    return { id: r.id, topicId: r.topic_id, topic: r.topic.name, subject: r.topic.chapter.subject.name, days_overdue: daysOverdue };
  });
}

export async function markRevisionDone(topicId: string) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  const nextReview = new Date(); nextReview.setDate(nextReview.getDate() + 7);
  await prisma.revisionSchedule.upsert({
    where: { user_id_topic_id: { user_id: user.id, topic_id: topicId } },
    update: { last_reviewed_at: new Date(), next_review_date: nextReview, repetition_count: { increment: 1 } },
    create: { user_id: user.id, topic_id: topicId, next_review_date: nextReview, ease_factor: 2.5, interval_days: 7, repetition_count: 1 }
  });
  revalidatePath("/revision"); revalidatePath("/");
  return { success: true };
}
