const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Starting DB reset...");
  try {
    const p = await prisma.topicProgress.deleteMany({});
    console.log(`Deleted ${p.count} TopicProgress records.`);
    
    await prisma.revisionSchedule.deleteMany({});
    await prisma.studySession.deleteMany({});
    
    const m = await prisma.mockTest.deleteMany({});
    console.log(`Deleted ${m.count} MockTest records.`);
    
    await prisma.dailyCheckIn.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.achievement.deleteMany({});
    
    const x = await prisma.xPEvent.deleteMany({});
    console.log(`Deleted ${x.count} XP event records.`);
    
    await prisma.notificationLog.deleteMany({});
    
    const s = await prisma.userState.deleteMany({});
    console.log(`Deleted ${s.count} UserState configs.`);
    
    const u = await prisma.user.deleteMany({});
    console.log(`Deleted ${u.count} User accounts.`);
    
    console.log("===============================");
    console.log("RESET FULLY SUCCESSFUL!");
    console.log("===============================");
  } catch (err) {
    console.error("Error during reset:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
