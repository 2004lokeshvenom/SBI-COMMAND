import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Starting complete progress reset...");
  
  await prisma.topicProgress.deleteMany({});
  await prisma.revisionSchedule.deleteMany({});
  await prisma.studySession.deleteMany({});
  await prisma.mockTest.deleteMany({});
  await prisma.dailyCheckIn.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.xPEvent.deleteMany({});
  await prisma.notificationLog.deleteMany({});
  await prisma.userState.deleteMany({});
  
  // Deleting user forces standard onboarding exactly like a new visit
  await prisma.user.deleteMany({});
  
  console.log("Database reset complete. All user records have been cleared.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
