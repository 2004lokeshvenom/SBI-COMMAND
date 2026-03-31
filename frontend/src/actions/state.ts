"use server";
import { prisma } from "@/lib/prisma";

async function ensureUser() {
  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { name: "Operative", email: "operative.state@sbi-command.local", exam_date: new Date("2026-07-30") } });
  return user;
}

export async function getUserState(key: string): Promise<any> {
  const user = await ensureUser();
  const state = await prisma.userState.findUnique({ where: { user_id_key: { user_id: user.id, key } } });
  return state ? JSON.parse(state.value) : null;
}

export async function setUserState(key: string, value: any): Promise<void> {
  const user = await ensureUser();
  await prisma.userState.upsert({
    where: { user_id_key: { user_id: user.id, key } },
    update: { value: JSON.stringify(value) },
    create: { user_id: user.id, key, value: JSON.stringify(value) },
  });
}
