"use server";
import { prisma } from "@/lib/prisma";

export async function getUserStats() {
  const user = await prisma.user.findFirst();
  if (!user) return null;
  const checkIns = await prisma.dailyCheckIn.findMany({ where: { user_id: user.id }, orderBy: { date: "desc" } });
  let streak = 0;
  const d = new Date(); d.setHours(0, 0, 0, 0);
  for (const ci of checkIns) {
    const ciDate = new Date(ci.date); ciDate.setHours(0, 0, 0, 0);
    if (ciDate.getTime() === d.getTime()) { streak++; d.setDate(d.getDate() - 1); } else break;
  }
  const totalProgress = await prisma.topicProgress.count({ where: { user_id: user.id, status: { not: "not_started" } } });
  const examDate = new Date(user.exam_date);
  const daysLeft = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const xp = await prisma.xPEvent.aggregate({ where: { user_id: user.id }, _sum: { points: true } });
  
  return { name: user.name, streak, topicsStudied: totalProgress, daysLeft, totalXP: xp._sum.points || 0 };
}

export async function addXP(reason: string, points: number) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  await prisma.xPEvent.create({ data: { user_id: user.id, reason, points } });
  const xp = await prisma.xPEvent.aggregate({ where: { user_id: user.id }, _sum: { points: true } });
  return xp._sum.points || 0;
}

export async function createCheckIn(data: { energy: number; focus: number; notes?: string }) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  return prisma.dailyCheckIn.create({ data: { user_id: user.id, energy: data.energy, focus: data.focus, notes: data.notes } });
}

export async function createOrUpdateUser(data: { name: string; examDate: string; dailyHours: number }) {
  const existing = await prisma.user.findFirst();
  if (existing) {
    return prisma.user.update({ where: { id: existing.id }, data: { name: data.name, exam_date: new Date(data.examDate), daily_hours: data.dailyHours } });
  }
  return prisma.user.create({ data: { name: data.name, email: `${data.name.toLowerCase().replace(/\s+/g, "")}@sbi-command.local`, exam_date: new Date(data.examDate), daily_hours: data.dailyHours } });
}
