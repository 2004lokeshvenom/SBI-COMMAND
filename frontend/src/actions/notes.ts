"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotes() {
  const user = await prisma.user.findFirst();
  if (!user) return [];
  return prisma.note.findMany({ where: { user_id: user.id }, orderBy: { updated_at: "desc" } });
}

export async function createNote(data: { title: string; content: string; subject?: string }) {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  const result = await prisma.note.create({ data: { user_id: user.id, title: data.title, content: data.content, subject: data.subject } });
  revalidatePath("/notes");
  return result;
}

export async function deleteNote(noteId: string) {
  await prisma.note.delete({ where: { id: noteId } });
  revalidatePath("/notes");
  return { success: true };
}
