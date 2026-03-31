import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const SUBJECTS = [
  { code: "QA", name: "Quantitative Aptitude", color: "blue", icon: "calculator" },
  { code: "RE", name: "Reasoning Ability", color: "purple", icon: "brain" },
  { code: "EN", name: "English Language", color: "green", icon: "book" },
  { code: "GA", name: "General & Banking Awareness", color: "amber", icon: "globe" },
  { code: "DI", name: "Data Analysis & Interpretation", color: "cyan", icon: "chart" },
  { code: "MOCK", name: "Mock Tests", color: "rose", icon: "target" },
  { code: "REV", name: "Revision", color: "slate", icon: "refresh" },
];

// Ordered for optimal learning progression across 17 weeks
const SYLLABUS: { subject: string; chapter: string; topics: { name: string; week: number; priority?: string; exam_type?: string; hours?: number }[] }[] = [
  // ═══ QUANTITATIVE APTITUDE ═══
  { subject: "QA", chapter: "Arithmetic Fundamentals", topics: [
    { name: "Number System & Basics", week: 1, exam_type: "prelims" },
    { name: "Simplification & Approximation", week: 1, priority: "high", exam_type: "prelims" },
    { name: "Surds & Indices", week: 2, exam_type: "prelims" },
    { name: "Percentage", week: 2, priority: "high", exam_type: "both" },
    { name: "Average", week: 2, exam_type: "both" },
  ]},
  { subject: "QA", chapter: "Ratio & Commercial Math", topics: [
    { name: "Ratio & Proportion", week: 3, priority: "high", exam_type: "both" },
    { name: "Profit & Loss", week: 3, exam_type: "both" },
    { name: "Simple & Compound Interest", week: 4, exam_type: "both" },
    { name: "Mixtures & Alligations", week: 4, exam_type: "both" },
  ]},
  { subject: "QA", chapter: "Time-based Problems", topics: [
    { name: "Time & Work", week: 5, priority: "high", exam_type: "both" },
    { name: "Time, Speed & Distance", week: 5, exam_type: "both" },
  ]},
  { subject: "QA", chapter: "Advanced Quant", topics: [
    { name: "Number Series", week: 6, priority: "high", exam_type: "prelims" },
    { name: "Quadratic Equations", week: 6, exam_type: "prelims" },
    { name: "Permutation & Combination", week: 7, exam_type: "both" },
    { name: "Probability", week: 7, exam_type: "both" },
    { name: "Mensuration (Cylinder, Cone, Sphere)", week: 8, exam_type: "prelims" },
  ]},
  { subject: "QA", chapter: "Data Interpretation (Prelims)", topics: [
    { name: "Data Interpretation — Tables & Bar Graphs", week: 8, priority: "high", exam_type: "both" },
  ]},

  // ═══ REASONING ABILITY ═══
  { subject: "RE", chapter: "Logical Foundations", topics: [
    { name: "Inequalities (Direct & Coded)", week: 1, exam_type: "both" },
    { name: "Syllogism", week: 1, priority: "high", exam_type: "both" },
    { name: "Coding-Decoding", week: 2, exam_type: "both" },
    { name: "Blood Relations", week: 2, exam_type: "both" },
    { name: "Direction & Distance", week: 3, exam_type: "prelims" },
    { name: "Order & Ranking", week: 3, exam_type: "both" },
  ]},
  { subject: "RE", chapter: "Series & Patterns", topics: [
    { name: "Alphanumeric Series", week: 4, exam_type: "prelims" },
    { name: "Alphabet Test", week: 4, exam_type: "prelims" },
  ]},
  { subject: "RE", chapter: "Puzzles & Seating (Prelims)", topics: [
    { name: "Linear Seating Arrangement", week: 5, priority: "high", exam_type: "both" },
    { name: "Circular Seating Arrangement", week: 5, priority: "high", exam_type: "both" },
    { name: "Floor-based Puzzles", week: 6, priority: "high", exam_type: "both" },
    { name: "Box-based Puzzles", week: 6, exam_type: "both" },
    { name: "Tabulation", week: 7, exam_type: "prelims" },
  ]},
  { subject: "RE", chapter: "Data & Logic (Prelims)", topics: [
    { name: "Input-Output (Basic)", week: 7, exam_type: "prelims" },
    { name: "Data Sufficiency", week: 8, exam_type: "both" },
    { name: "Logical Reasoning (Basic)", week: 8, exam_type: "both" },
  ]},
  { subject: "RE", chapter: "Advanced Reasoning (Mains)", topics: [
    { name: "Advanced Puzzles & Seating", week: 9, priority: "high", exam_type: "mains" },
    { name: "Input-Output (Advanced)", week: 10, exam_type: "mains" },
    { name: "Critical Reasoning", week: 10, exam_type: "mains" },
    { name: "Course of Action", week: 11, exam_type: "mains" },
    { name: "Analytical Decision Making", week: 11, exam_type: "mains" },
    { name: "Logical Reasoning (Advanced)", week: 12, exam_type: "mains" },
  ]},
  { subject: "RE", chapter: "Computer Aptitude (Mains)", topics: [
    { name: "Basics of Computers & Operating Systems", week: 12, exam_type: "mains" },
    { name: "MS Office & Applications", week: 13, exam_type: "mains" },
    { name: "Internet, Networking & Cyber Security", week: 13, exam_type: "mains" },
    { name: "Computer Memory & I/O Devices", week: 13, exam_type: "mains" },
  ]},

  // ═══ ENGLISH LANGUAGE ═══
  { subject: "EN", chapter: "Grammar & Vocabulary Foundation", topics: [
    { name: "Tenses & Grammar Basics", week: 1, exam_type: "both" },
    { name: "Vocabulary (Synonyms/Antonyms)", week: 1, exam_type: "both" },
    { name: "Word Usage", week: 2, exam_type: "both" },
    { name: "Fill in the Blanks & Double Fillers", week: 3, exam_type: "both" },
  ]},
  { subject: "EN", chapter: "Error & Improvement", topics: [
    { name: "Error Spotting", week: 3, exam_type: "both" },
    { name: "Sentence Improvement", week: 4, exam_type: "both" },
  ]},
  { subject: "EN", chapter: "Comprehension & Arrangement", topics: [
    { name: "Reading Comprehension Level 1", week: 4, priority: "high", exam_type: "both" },
    { name: "Cloze Test", week: 5, exam_type: "both" },
    { name: "Para Jumbles", week: 6, exam_type: "both" },
    { name: "Paragraph Completion", week: 7, exam_type: "prelims" },
  ]},
  { subject: "EN", chapter: "Advanced English (Mains)", topics: [
    { name: "Reading Comprehension (Advanced)", week: 9, priority: "high", exam_type: "mains" },
    { name: "Error Detection (Mains)", week: 10, exam_type: "mains" },
    { name: "Vocabulary & Grammar (Mains)", week: 10, exam_type: "mains" },
    { name: "Cloze Test (Mains)", week: 11, exam_type: "mains" },
    { name: "Word Association & Fillers", week: 12, exam_type: "mains" },
  ]},
  { subject: "EN", chapter: "Descriptive Test (50 Marks)", topics: [
    { name: "Essay Writing", week: 14, priority: "high", exam_type: "mains", hours: 3 },
    { name: "Letter Writing (Formal & Informal)", week: 15, exam_type: "mains", hours: 3 },
    { name: "Email & Report Writing", week: 16, exam_type: "mains", hours: 3 },
  ]},

  // ═══ GENERAL & BANKING AWARENESS (Mains) ═══
  { subject: "GA", chapter: "Banking Basics & Structure", topics: [
    { name: "History & Evolution of Banking in India", week: 5, exam_type: "mains" },
    { name: "Types of Banks & Banking Structure", week: 5, exam_type: "mains" },
    { name: "Nationalization, Scheduled vs Non-Scheduled", week: 6, exam_type: "mains" },
  ]},
  { subject: "GA", chapter: "RBI & Monetary Policy", topics: [
    { name: "RBI: Structure, Functions & Governors", week: 6, priority: "high", exam_type: "mains" },
    { name: "Monetary Policy (Repo, CRR, SLR, MSF, Bank Rate)", week: 7, priority: "high", exam_type: "mains" },
    { name: "Monetary Policy Committee", week: 7, exam_type: "mains" },
  ]},
  { subject: "GA", chapter: "Banking Terms & Products", topics: [
    { name: "Banking Terms (NPA, CASA, MCLR, RLLR, PSL)", week: 8, exam_type: "mains" },
    { name: "Banking Products (Accounts, FD, RD, Loans, KYC)", week: 8, exam_type: "mains" },
  ]},
  { subject: "GA", chapter: "Financial System", topics: [
    { name: "Financial Institutions (NABARD, SIDBI, SEBI, IRDAI, NHB)", week: 9, exam_type: "mains" },
    { name: "Financial Markets (Money, Capital, Treasury)", week: 9, exam_type: "mains" },
    { name: "Digital Banking (NEFT, RTGS, IMPS, UPI)", week: 10, exam_type: "mains" },
  ]},
  { subject: "GA", chapter: "Government & Economy", topics: [
    { name: "Government Schemes (PMJDY, MUDRA, Atal Pension)", week: 10, exam_type: "mains" },
    { name: "Basel Norms (I, II, III) & Capital Adequacy", week: 11, exam_type: "mains" },
    { name: "Committees (Narasimham, Urjit Patel, Nachiket Mor)", week: 11, exam_type: "mains" },
    { name: "Inflation, GDP & Fiscal Policy", week: 12, exam_type: "mains" },
    { name: "Budget & Economic Survey", week: 12, exam_type: "mains" },
  ]},
  { subject: "GA", chapter: "Static GK & Awareness", topics: [
    { name: "Awards, Honors & Important Days", week: 14, exam_type: "mains" },
    { name: "Static GK (Capitals, Currencies, Orgs)", week: 14, exam_type: "mains" },
    { name: "GA Final Revision", week: 16, exam_type: "mains" },
  ]},

  // ═══ DATA ANALYSIS & INTERPRETATION (Mains) ═══
  { subject: "DI", chapter: "Standard DI", topics: [
    { name: "Bar Graph & Line Graph DI", week: 9, exam_type: "mains" },
    { name: "Pie Chart & Tabular DI", week: 9, exam_type: "mains" },
  ]},
  { subject: "DI", chapter: "Advanced DI", topics: [
    { name: "Caselet DI", week: 10, priority: "high", exam_type: "mains" },
    { name: "Missing DI", week: 11, exam_type: "mains" },
    { name: "Radar Graph", week: 11, exam_type: "mains" },
    { name: "Data Sufficiency (DI)", week: 12, exam_type: "mains" },
    { name: "Probability & P&C (DI)", week: 13, exam_type: "mains" },
  ]},

  // ═══ MOCK TESTS ═══
  // Prelims: 6 sectional + 9 full = 15
  { subject: "MOCK", chapter: "Prelims Sectional Mocks", topics: [
    { name: "QA Sectional Mock 1", week: 5, exam_type: "prelims" },
    { name: "RE Sectional Mock 1", week: 6, exam_type: "prelims" },
    { name: "EN Sectional Mock 1", week: 6, exam_type: "prelims" },
    { name: "QA Sectional Mock 2", week: 7, exam_type: "prelims" },
    { name: "RE Sectional Mock 2", week: 7, exam_type: "prelims" },
    { name: "EN Sectional Mock 2", week: 8, exam_type: "prelims" },
  ]},
  { subject: "MOCK", chapter: "Prelims Full Mocks", topics: [
    { name: "Prelims Full Mock 1", week: 8, priority: "high", exam_type: "prelims" },
    { name: "Prelims Full Mock 2", week: 9, priority: "high", exam_type: "prelims" },
    { name: "Prelims Full Mock 3", week: 10, exam_type: "prelims" },
    { name: "Prelims Full Mock 4", week: 11, exam_type: "prelims" },
    { name: "Prelims Full Mock 5", week: 12, exam_type: "prelims" },
    { name: "Prelims Full Mock 6", week: 13, exam_type: "prelims" },
    { name: "Prelims Full Mock 7", week: 14, exam_type: "prelims" },
    { name: "Prelims Full Mock 8", week: 15, exam_type: "prelims" },
    { name: "Prelims Full Mock 9", week: 16, exam_type: "prelims" },
  ]},
  // Mains: 4 sectional + 6 full = 10
  { subject: "MOCK", chapter: "Mains Sectional Mocks", topics: [
    { name: "DI Sectional Mock 1", week: 10, exam_type: "mains" },
    { name: "RE+Computer Sectional Mock 1", week: 11, exam_type: "mains" },
    { name: "GA Sectional Mock 1", week: 11, exam_type: "mains" },
    { name: "EN Mains Sectional Mock 1", week: 12, exam_type: "mains" },
  ]},
  { subject: "MOCK", chapter: "Mains Full Mocks", topics: [
    { name: "Mains Full Mock 1", week: 12, priority: "high", exam_type: "mains" },
    { name: "Mains Full Mock 2", week: 13, priority: "high", exam_type: "mains" },
    { name: "Mains Full Mock 3", week: 14, exam_type: "mains" },
    { name: "Mains Full Mock 4", week: 15, exam_type: "mains" },
    { name: "Mains Full Mock 5", week: 16, exam_type: "mains" },
    { name: "Mains Full Mock 6", week: 17, exam_type: "mains" },
  ]},
];

// Week N revision in Week N+2 (from W3 to W17)
const REVISION_TOPICS = Array.from({ length: 15 }, (_, i) => ({
  name: `Week ${i + 1} Revision`, week: i + 3,
}));

async function main() {
  console.log("\n🔥 SBI PO Command Center — Complete Syllabus Seed");
  console.log("══════════════════════════════════════════════════\n");

  // Clear all data
  await (prisma as any).userState.deleteMany();
  await prisma.notificationLog.deleteMany();
  await prisma.xPEvent.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.note.deleteMany();
  await prisma.dailyCheckIn.deleteMany();
  await prisma.mockTest.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.revisionSchedule.deleteMany();
  await prisma.topicProgress.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleared existing data");

  const user = await prisma.user.create({
    data: { name: "Operative", email: "operative@sbi-command.local", exam_date: new Date("2026-07-30"), daily_hours: 8 }
  });

  const subjectMap: Record<string, string> = {};
  for (const s of SUBJECTS) {
    const created = await prisma.subject.create({ data: { code: s.code, name: s.name, color: s.color, icon: s.icon } });
    subjectMap[s.code] = created.id;
    console.log(`📘 ${s.name}`);
  }

  let topicCount = 0;
  let chapterIdx = 0;
  for (const entry of SYLLABUS) {
    const chapter = await prisma.chapter.create({
      data: { name: entry.chapter, subject_id: subjectMap[entry.subject], order_index: chapterIdx++ }
    });
    for (const t of entry.topics) {
      const topic = await prisma.topic.create({
        data: { name: t.name, chapter_id: chapter.id, week_number: t.week, estimated_hours: t.hours || 2, priority: t.priority || "medium", exam_type: t.exam_type || "both", phase: Math.ceil(t.week / 4) }
      });
      await prisma.topicProgress.create({ data: { user_id: user.id, topic_id: topic.id } });
      await prisma.revisionSchedule.create({ data: { user_id: user.id, topic_id: topic.id, next_review_date: new Date("2099-01-01") } });
      topicCount++;
    }
  }
  console.log(`✅ ${topicCount} study + mock topics seeded`);

  const revChapter = await prisma.chapter.create({ data: { name: "Weekly Revision", subject_id: subjectMap["REV"], order_index: 0 } });
  for (const r of REVISION_TOPICS) {
    const topic = await prisma.topic.create({
      data: { name: r.name, chapter_id: revChapter.id, week_number: r.week, estimated_hours: 2, priority: "medium", exam_type: "both", phase: Math.ceil(r.week / 4) }
    });
    await prisma.topicProgress.create({ data: { user_id: user.id, topic_id: topic.id } });
    await prisma.revisionSchedule.create({ data: { user_id: user.id, topic_id: topic.id, next_review_date: new Date("2099-01-01") } });
  }
  console.log(`♻️ ${REVISION_TOPICS.length} revision topics seeded`);

  const total = topicCount + REVISION_TOPICS.length;
  console.log(`\n══════════════════════════════════════════════════`);
  console.log(`✅ Total: ${total} items across 17 weeks`);
  console.log(`   📝 Prelims Mocks: 15 (6 sectional + 9 full)`);
  console.log(`   📝 Mains Mocks: 10 (4 sectional + 6 full)`);
  console.log(`🎯 Run npm run dev to begin.\n`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
