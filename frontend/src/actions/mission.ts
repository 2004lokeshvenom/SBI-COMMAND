"use server";

import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/actions/state";
import { fetchAllWeeksDataForUser, fetchSubjectProgressForUser } from "@/actions/topics";
import { fetchOverdueRevisionsForUser } from "@/actions/revision";

function computeCurrentWeek(): number {
  const start = new Date("2026-04-01");
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(Math.floor(diffDays / 7) + 1, 17));
}

/** One server round-trip for the dashboard — avoids many parallel `user.findFirst` + huge Prisma graphs. */
export async function loadMissionDashboard() {
  const user = await ensureUser();
  const week = computeCurrentWeek();

  const [topics, revisions, subjectProgress, practicedRow, goalsRow] = await Promise.all([
    fetchAllWeeksDataForUser(user.id),
    fetchOverdueRevisionsForUser(user.id),
    fetchSubjectProgressForUser(user.id),
    prisma.userState.findUnique({
      where: { user_id_key: { user_id: user.id, key: "practiced_topics" } },
    }),
    prisma.userState.findUnique({
      where: { user_id_key: { user_id: user.id, key: "week_goals" } },
    }),
  ]);

  return {
    week,
    topics,
    revisions,
    subjectProgress,
    practiced: practicedRow ? JSON.parse(practicedRow.value) : null,
    weekGoals: goalsRow ? JSON.parse(goalsRow.value) : null,
  };
}
