/**
 * DANGER: Deletes ALL user progress, notes, mocks, and users in the connected database.
 * Only run against a dev database. Invoke: npm run reset:dev-database
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.warn("Starting complete progress reset (dev only)...");

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
  await prisma.user.deleteMany({});

  console.warn("Database reset complete. All user records have been cleared.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
