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
