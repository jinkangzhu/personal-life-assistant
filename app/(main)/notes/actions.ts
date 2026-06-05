"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOwnedCategory } from "@/lib/services/category";
import { getOwnedNote } from "@/lib/services/note";
import { parseTagNames, syncEntityTags } from "@/lib/services/tag";
import { requireSession } from "@/lib/session";
import { noteCreateSchema, noteUpdateSchema } from "@/lib/validators/note";
import { EntityType } from "@prisma/client";
import { z } from "zod";

function revalidateNotePaths(id?: string) {
  revalidatePath("/notes");
  revalidatePath("/notes/new");
  if (id) revalidatePath(`/notes/${id}`);
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

function parseCategoryId(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

async function validateCategory(userId: string, categoryId: string | null) {
  if (!categoryId) return null;
  await getOwnedCategory(userId, categoryId);
  return categoryId;
}

export async function createNote(formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = noteCreateSchema.parse({
      title: raw.title,
      content: raw.content ?? "",
      categoryId: raw.categoryId || undefined,
      tags: raw.tags || undefined,
    });

    const categoryId = await validateCategory(
      session.id,
      parseCategoryId(parsed.categoryId),
    );

    const note = await prisma.note.create({
      data: {
        userId: session.id,
        title: parsed.title,
        content: parsed.content,
        categoryId,
      },
    });

    const tagNames = parseTagNames(parsed.tags);
    if (tagNames.length > 0) {
      await syncEntityTags(session.id, EntityType.NOTE, note.id, tagNames);
    }

    revalidateNotePaths();
    return { ok: true as const, id: note.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return { ok: false as const, error: "分类不存在" };
    }
    console.error("createNote error:", error);
    return { ok: false as const, error: "创建失败" };
  }
}

export async function updateNote(id: string, formData: FormData) {
  const session = await requireSession();

  try {
    await getOwnedNote(session.id, id);
    const raw = formDataToObject(formData);
    const parsed = noteUpdateSchema.parse({
      title: raw.title,
      content: raw.content ?? "",
      categoryId: raw.categoryId || undefined,
      tags: raw.tags || undefined,
    });

    const categoryId = await validateCategory(
      session.id,
      parseCategoryId(parsed.categoryId),
    );

    await prisma.note.update({
      where: { id },
      data: {
        title: parsed.title,
        content: parsed.content,
        categoryId,
      },
    });

    await syncEntityTags(
      session.id,
      EntityType.NOTE,
      id,
      parseTagNames(parsed.tags),
    );

    revalidateNotePaths(id);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "NOTE_NOT_FOUND") {
      return { ok: false as const, error: "笔记不存在" };
    }
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return { ok: false as const, error: "分类不存在" };
    }
    console.error("updateNote error:", error);
    return { ok: false as const, error: "更新失败" };
  }
}

export async function deleteNote(id: string) {
  const session = await requireSession();

  try {
    await getOwnedNote(session.id, id);

    await prisma.$transaction([
      prisma.tagRelation.deleteMany({
        where: {
          userId: session.id,
          entityType: EntityType.NOTE,
          entityId: id,
        },
      }),
      prisma.note.delete({ where: { id } }),
    ]);

    revalidateNotePaths();
    redirect("/notes");
  } catch (error) {
    if (error instanceof Error && error.message === "NOTE_NOT_FOUND") {
      return { ok: false as const, error: "笔记不存在" };
    }
    throw error;
  }
}
