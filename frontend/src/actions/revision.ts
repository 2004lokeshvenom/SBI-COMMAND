"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOverdueRevisions() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  return fetchOverdueRevisionsForUser(user.id);
}

export async function fetchOverdueRevisionsForUser(userId: string) {
  const now = new Date();
  const overdue = await prisma.revisionSchedule.findMany({
    where: { user_id: userId, next_review_date: { lte: now } },
    select: {
      id: true,
      topic_id: true,
      next_review_date: true,
      topic: {
        select: {
          name: true,
          chapter: { select: { subject: { select: { name: true } } } },
        },
      },
    },
    orderBy: { next_review_date: "asc" },
    take: 10,
  });
  return overdue.map((r) => {
    const daysOverdue = Math.floor((now.getTime() - new Date(r.next_review_date).getTime()) / (1000 * 60 * 60 * 24));
    return {
      id: r.id,
      topicId: r.topic_id,
      topic: r.topic.name,
      subject: r.topic.chapter.subject.name,
      days_overdue: daysOverdue,
    };
  });
}
