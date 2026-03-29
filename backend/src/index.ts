import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = Number(process.env.PORT) || 5000;

const corsOrigin = process.env.FRONTEND_ORIGIN;
app.use(
  cors({
    origin: corsOrigin && corsOrigin.length > 0 ? corsOrigin.split(",").map((s) => s.trim()) : true,
  })
);
app.use(express.json());

async function ensureDefaultUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { daily_hours: 6 },
    });
  }
  return user;
}

function computeStreakFromNightCheckIns(
  checkIns: { date: string }[]
): number {
  const dates = new Set(checkIns.map((c) => c.date));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 120; i++) {
    const key = d.toISOString().split("T")[0];
    if (dates.has(key)) {
      streak++;
      d.setUTCDate(d.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "Command Center API Online" });
});

app.get("/api/user/stats", async (_req, res) => {
  try {
    const user = await ensureDefaultUser();
    const nightCheckIns = await prisma.dailyCheckIn.findMany({
      where: { user_id: user.id, type: "night" },
      orderBy: { date: "desc" },
      take: 120,
    });
    const streak = computeStreakFromNightCheckIns(nightCheckIns);

    const todaySessions = await prisma.studySession.aggregate({
      where: {
        user_id: user.id,
        started_at: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      _sum: { duration_minutes: true },
    });
    const hoursLogged = (todaySessions._sum.duration_minutes || 0) / 60;

    res.json({
      streak,
      hoursLogged,
      targetHours: user.daily_hours ?? 6,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/user/debrief", async (req, res) => {
  try {
    const { mood, learned, improve, difficulty } = req.body;
    const user = await ensureDefaultUser();
    const todayStr = new Date().toISOString().split("T")[0];
    await prisma.dailyCheckIn.upsert({
      where: {
        user_id_date_type: {
          user_id: user.id,
          date: todayStr,
          type: "night",
        },
      },
      update: {
        mood: mood || "Neutral",
        reflection: `Learned: ${learned || ""}. Improve: ${improve || ""}`,
        difficulty_rating: difficulty || null,
      },
      create: {
        user_id: user.id,
        date: todayStr,
        type: "night",
        mood: mood || "Neutral",
        reflection: `Learned: ${learned || ""}. Improve: ${improve || ""}`,
        difficulty_rating: difficulty || null,
      },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/topics/all", async (_req, res) => {
  try {
    const user = await ensureDefaultUser();
    const rawTopics = await prisma.topic.findMany({
      include: {
        chapter: {
          include: { subject: true },
        },
        progress: {
          where: { user_id: user.id },
          take: 1,
        },
      },
      orderBy: [
        { week_number: "asc" },
        { phase: "asc" },
        { priority: "asc" },
      ],
    });
    const formatted = rawTopics.map((t) => {
      const p = t.progress[0];
      return {
        id: t.id,
        name: t.name,
        week: t.week_number,
        subject: t.chapter.subject.name,
        subjectCode: t.chapter.subject.code,
        subjectColor: t.chapter.subject.color,
        chapter: t.chapter.name,
        priority: t.priority,
        exam_type: t.exam_type,
        status: p?.status || "not_started",
        confidence: p?.confidence ?? 0,
      };
    });
    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/topics/mark", async (req, res) => {
  try {
    const { topicId, confidence, status } = req.body;
    const user = await ensureDefaultUser();
    const newStatus = status || "not_started";
    const newConfidence =
      typeof confidence === "number"
        ? newStatus === "not_started"
          ? 0
          : confidence
        : 0;

    const progress = await prisma.topicProgress.upsert({
      where: {
        user_id_topic_id: {
          user_id: user.id,
          topic_id: topicId,
        },
      },
      update: {
        status: newStatus,
        confidence: newConfidence,
        last_studied_at: newStatus !== "not_started" ? new Date() : null,
      },
      create: {
        user_id: user.id,
        topic_id: topicId,
        status: newStatus,
        confidence: newConfidence,
        first_studied_at: newStatus !== "not_started" ? new Date() : null,
        last_studied_at: newStatus !== "not_started" ? new Date() : null,
      },
    });
    res.json({ success: true, progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/topics/subject-progress", async (_req, res) => {
  try {
    const user = await ensureDefaultUser();
    const subjects = await prisma.subject.findMany({
      include: {
        chapters: {
          include: {
            topics: {
              include: {
                progress: {
                  where: { user_id: user.id },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });
    const progress = subjects.map((sub) => {
      let total = 0;
      let studied = 0;
      sub.chapters.forEach((chap) => {
        chap.topics.forEach((t) => {
          total++;
          const p = t.progress[0];
          if (p && p.status !== "not_started") studied++;
        });
      });
      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        total,
        studied,
        percent: total > 0 ? Math.round((studied / total) * 100) : 0,
      };
    });
    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/state/:key", async (req, res) => {
  try {
    const user = await ensureDefaultUser();
    const { key } = req.params;
    const state = await prisma.userState.findUnique({
      where: {
        user_id_key: {
          user_id: user.id,
          key,
        },
      },
    });
    if (state) res.json(JSON.parse(state.value));
    else res.json(null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/state/:key", async (req, res) => {
  try {
    const user = await ensureDefaultUser();
    const { key } = req.params;
    const value = JSON.stringify(req.body);
    await prisma.userState.upsert({
      where: {
        user_id_key: {
          user_id: user.id,
          key,
        },
      },
      update: { value },
      create: {
        user_id: user.id,
        key,
        value,
      },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/notes", async (req, res) => {
  try {
    const user = await ensureDefaultUser();
    const category = (req.query.category as string) || "All";
    const notes = await prisma.note.findMany({
      where: {
        user_id: user.id,
        ...(category !== "All" ? { category } : {}),
      },
      orderBy: { updated_at: "desc" },
    });
    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/notes", async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const user = await ensureDefaultUser();
    const note = await prisma.note.create({
      data: {
        user_id: user.id,
        title,
        category: category || "General",
        content: content || "",
      },
    });
    res.json(note);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, content } = req.body;
    const user = await ensureDefaultUser();
    const note = await prisma.note.updateMany({
      where: { id, user_id: user.id },
      data: { title, category, content },
    });
    if (note.count === 0) return res.status(404).json({ error: "Not found" });
    const updated = await prisma.note.findFirst({ where: { id, user_id: user.id } });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await ensureDefaultUser();
    await prisma.note.deleteMany({ where: { id, user_id: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/mocks", async (_req, res) => {
  try {
    const user = await ensureDefaultUser();
    const rows = await prisma.mockTest.findMany({
      where: { user_id: user.id },
      orderBy: { date_taken: "asc" },
    });
    const data = rows.map((r, i) => ({
      name: r.test_name || `Mock ${i + 1}`,
      score: r.scored_marks,
      qa: r.qa_score ?? 0,
      reas: r.reasoning_score ?? 0,
      eng: r.english_score ?? 0,
    }));
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/mocks", async (req, res) => {
  try {
    const user = await ensureDefaultUser();
    const { total, qa, reas, eng, time_taken_minutes } = req.body;
    const scored = Number(total);
    const qaN = Number(qa);
    const reN = Number(reas);
    const enN = Number(eng);
    const avgSection = (qaN + reN + enN) / 3;
    const accuracy = Math.min(100, Math.max(0, avgSection));

    const label = `Mock ${new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`;
    await prisma.mockTest.create({
      data: {
        user_id: user.id,
        test_name: label,
        test_type: "prelims",
        total_marks: 100,
        scored_marks: scored,
        qa_score: qaN,
        reasoning_score: reN,
        english_score: enN,
        time_taken_minutes: Number(time_taken_minutes) || 60,
        accuracy_percent: accuracy,
      },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/sessions", async (req, res) => {
  try {
    const user = await ensureDefaultUser();
    const { duration_minutes, topic_id, session_type } = req.body;
    const topicId = topic_id && String(topic_id).length > 0 ? topic_id : null;
    await prisma.studySession.create({
      data: {
        user_id: user.id,
        topic_id: topicId,
        duration_minutes: Number(duration_minutes) || 0,
        session_type: session_type || "deep_work",
        ended_at: new Date(),
      },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
