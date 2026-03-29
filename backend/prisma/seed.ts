import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SUBJECTS = [
  { name: "Quantitative Aptitude", code: "QA", color: "blue", icon: "calc" },
  { name: "Reasoning Ability", code: "RE", color: "purple", icon: "brain" },
  { name: "English Language", code: "EN", color: "green", icon: "book" },
  { name: "General Awareness", code: "GA", color: "orange", icon: "globe" },
  { name: "Mock Drills", code: "MOCK", color: "cyan", icon: "target" },
  { name: "Integration Week", code: "REV", color: "red", icon: "layers" },
] as const;

async function main() {
  for (const s of SUBJECTS) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: { name: s.name, color: s.color, icon: s.icon },
      create: { name: s.name, code: s.code, color: s.color, icon: s.icon },
    });
  }

  const byCode = async (code: string) => {
    const sub = await prisma.subject.findUniqueOrThrow({ where: { code } });
    let ch = await prisma.chapter.findFirst({
      where: { subject_id: sub.id, name: "Syllabus Track" },
    });
    if (!ch) {
      ch = await prisma.chapter.create({
        data: { subject_id: sub.id, name: "Syllabus Track", order_index: 0 },
      });
    }
    return ch;
  };

  for (let week = 1; week <= 17; week++) {
    const phase = week <= 4 ? 1 : week <= 8 ? 2 : week <= 12 ? 3 : 4;
    for (const code of ["QA", "RE", "EN", "GA"] as const) {
      const ch = await byCode(code);
      const name = `Week ${week} — ${code} core`;
      const exists = await prisma.topic.findFirst({
        where: { chapter_id: ch.id, week_number: week, name },
      });
      if (!exists) {
        await prisma.topic.create({
          data: {
            chapter_id: ch.id,
            name,
            phase,
            week_number: week,
            estimated_hours: 3,
            priority: week % 4 === 0 ? "high" : "medium",
            exam_type: "both",
          },
        });
      }
    }
  }

  const mockWeeks = [4, 8, 12, 16];
  for (const week of mockWeeks) {
    const ch = await byCode("MOCK");
    const name = `Week ${week} — full-length mock`;
    const exists = await prisma.topic.findFirst({
      where: { chapter_id: ch.id, week_number: week, name },
    });
    if (!exists) {
      await prisma.topic.create({
        data: {
          chapter_id: ch.id,
          name,
          phase: week <= 8 ? 2 : week <= 12 ? 3 : 4,
          week_number: week,
          estimated_hours: 3,
          priority: "high",
          exam_type: "prelims",
        },
      });
    }
  }

  const revWeeks = [4, 8, 12, 16];
  for (const week of revWeeks) {
    const ch = await byCode("REV");
    const name = `Week ${week} — mixed revision & weak-area sweep`;
    const exists = await prisma.topic.findFirst({
      where: { chapter_id: ch.id, week_number: week, name },
    });
    if (!exists) {
      await prisma.topic.create({
        data: {
          chapter_id: ch.id,
          name,
          phase: week <= 8 ? 2 : week <= 12 ? 3 : 4,
          week_number: week,
          estimated_hours: 2,
          priority: "medium",
          exam_type: "both",
        },
      });
    }
  }

  const userCount = await prisma.user.count();
  if (userCount === 0) {
    await prisma.user.create({ data: { daily_hours: 6 } });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
