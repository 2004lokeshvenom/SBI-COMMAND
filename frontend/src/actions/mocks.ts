"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMockTests() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  return prisma.mockTest.findMany({ where: { user_id: user.id }, orderBy: { test_date: "desc" } });
}

export async function createMockTest(data: any) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  const result = await prisma.mockTest.create({ data: { user_id: user.id, ...data } });
  revalidatePath("/mocks");
  return result;
}

export async function updateMockTest(id: string, data: any) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  const result = await prisma.mockTest.update({
    where: { id, user_id: user.id },
    data
  });
  revalidatePath("/mocks");
  return result;
}

export async function deleteMockTest(id: string) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  const result = await prisma.mockTest.delete({
    where: { id, user_id: user.id }
  });
  revalidatePath("/mocks");
  return result;
}
