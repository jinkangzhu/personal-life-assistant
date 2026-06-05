import { prisma } from "@/lib/db";
import {
  getTagsForEntities,
  getTagsForEntity,
} from "@/lib/services/tag";
import type { DiaryEntry, Tag } from "@prisma/client";
import { EntityType } from "@prisma/client";

export type DiaryWithTags = DiaryEntry & { tags: Tag[] };

export type DiaryDateGroup = {
  dateKey: string;
  date: Date;
  entries: DiaryWithTags[];
};

async function attachTags(
  userId: string,
  entries: DiaryEntry[],
): Promise<DiaryWithTags[]> {
  const tagMap = await getTagsForEntities(
    userId,
    EntityType.DIARY,
    entries.map((entry) => entry.id),
  );

  return entries.map((entry) => ({
    ...entry,
    tags: tagMap.get(entry.id) ?? [],
  }));
}

export async function listDiaries(userId: string): Promise<DiaryWithTags[]> {
  const entries = await prisma.diaryEntry.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return attachTags(userId, entries);
}

export function groupDiariesByDate(entries: DiaryWithTags[]): DiaryDateGroup[] {
  const groups: DiaryDateGroup[] = [];

  for (const entry of entries) {
    const dateKey = entry.date.toISOString().slice(0, 10);
    const last = groups[groups.length - 1];

    if (last?.dateKey === dateKey) {
      last.entries.push(entry);
      continue;
    }

    groups.push({
      dateKey,
      date: entry.date,
      entries: [entry],
    });
  }

  return groups;
}

export async function getDiaryById(
  userId: string,
  id: string,
): Promise<DiaryWithTags | null> {
  const entry = await prisma.diaryEntry.findFirst({
    where: { id, userId },
  });

  if (!entry) return null;

  const tags = await getTagsForEntity(userId, EntityType.DIARY, id);
  return { ...entry, tags };
}

export async function getOwnedDiary(userId: string, id: string) {
  const entry = await getDiaryById(userId, id);
  if (!entry) {
    throw new Error("DIARY_NOT_FOUND");
  }
  return entry;
}
