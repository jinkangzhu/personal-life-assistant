"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOwnedDiary } from "@/lib/services/diary";
import { parseTagNames, syncEntityTags } from "@/lib/services/tag";
import { requireSession } from "@/lib/session";
import { parseDateInput } from "@/lib/utils";
import { diaryCreateSchema, diaryUpdateSchema } from "@/lib/validators/diary";
import { EntityType, Mood } from "@prisma/client";
import { z } from "zod";

function revalidateDiaryPaths(id?: string) {
  revalidatePath("/diary");
  revalidatePath("/diary/new");
  revalidatePath("/today");
  if (id) revalidatePath(`/diary/${id}`);
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

function parseMood(value: string | undefined) {
  if (!value?.trim()) return undefined;
  return value as Mood;
}

export async function createDiary(formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = diaryCreateSchema.parse({
      title: raw.title || undefined,
      date: raw.date,
      content: raw.content ?? "",
      mood: parseMood(raw.mood),
      tags: raw.tags || undefined,
    });

    const date = parseDateInput(parsed.date);
    if (!date) {
      return { ok: false as const, error: "日期无效" };
    }

    const entry = await prisma.diaryEntry.create({
      data: {
        userId: session.id,
        title: parsed.title || null,
        date,
        content: parsed.content,
        mood: parsed.mood ?? null,
      },
    });

    const tagNames = parseTagNames(parsed.tags);
    if (tagNames.length > 0) {
      await syncEntityTags(session.id, EntityType.DIARY, entry.id, tagNames);
    }

    revalidateDiaryPaths();
    return { ok: true as const, id: entry.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    console.error("createDiary error:", error);
    return { ok: false as const, error: "创建失败" };
  }
}

export async function updateDiary(id: string, formData: FormData) {
  const session = await requireSession();

  try {
    await getOwnedDiary(session.id, id);
    const raw = formDataToObject(formData);
    const parsed = diaryUpdateSchema.parse({
      title: raw.title || undefined,
      date: raw.date,
      content: raw.content ?? "",
      mood: parseMood(raw.mood),
      tags: raw.tags || undefined,
    });

    const date = parseDateInput(parsed.date);
    if (!date) {
      return { ok: false as const, error: "日期无效" };
    }

    await prisma.diaryEntry.update({
      where: { id },
      data: {
        title: parsed.title || null,
        date,
        content: parsed.content,
        mood: parsed.mood ?? null,
      },
    });

    await syncEntityTags(
      session.id,
      EntityType.DIARY,
      id,
      parseTagNames(parsed.tags),
    );

    revalidateDiaryPaths(id);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "DIARY_NOT_FOUND") {
      return { ok: false as const, error: "日记不存在" };
    }
    console.error("updateDiary error:", error);
    return { ok: false as const, error: "更新失败" };
  }
}

export async function deleteDiary(id: string) {
  const session = await requireSession();

  try {
    await getOwnedDiary(session.id, id);

    await prisma.$transaction([
      prisma.tagRelation.deleteMany({
        where: {
          userId: session.id,
          entityType: EntityType.DIARY,
          entityId: id,
        },
      }),
      prisma.diaryEntry.delete({ where: { id } }),
    ]);

    revalidateDiaryPaths();
    redirect("/diary");
  } catch (error) {
    if (error instanceof Error && error.message === "DIARY_NOT_FOUND") {
      return { ok: false as const, error: "日记不存在" };
    }
    throw error;
  }
}
