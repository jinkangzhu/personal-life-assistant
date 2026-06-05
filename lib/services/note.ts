import { prisma } from "@/lib/db";
import {
  getTagsForEntities,
  getTagsForEntity,
} from "@/lib/services/tag";
import type { NoteFilter } from "@/lib/validators/note";
import type { Category, Note, Tag } from "@prisma/client";
import { EntityType } from "@prisma/client";

export type NoteWithRelations = Note & {
  category: Category | null;
  tags: Tag[];
};

async function attachTags(
  userId: string,
  notes: (Note & { category: Category | null })[],
): Promise<NoteWithRelations[]> {
  const tagMap = await getTagsForEntities(
    userId,
    EntityType.NOTE,
    notes.map((note) => note.id),
  );

  return notes.map((note) => ({
    ...note,
    tags: tagMap.get(note.id) ?? [],
  }));
}

export async function listNotes(
  userId: string,
  filter: NoteFilter = {},
): Promise<NoteWithRelations[]> {
  const where: {
    userId: string;
    categoryId?: string;
    id?: { in: string[] };
  } = { userId };

  if (filter.categoryId) {
    where.categoryId = filter.categoryId;
  }

  if (filter.tagId) {
    const relations = await prisma.tagRelation.findMany({
      where: {
        userId,
        entityType: EntityType.NOTE,
        tagId: filter.tagId,
      },
      select: { entityId: true },
    });

    const noteIds = relations.map((relation) => relation.entityId);
    if (noteIds.length === 0) {
      return [];
    }

    where.id = { in: noteIds };
  }

  const notes = await prisma.note.findMany({
    where,
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return attachTags(userId, notes);
}

export async function getNoteById(
  userId: string,
  id: string,
): Promise<NoteWithRelations | null> {
  const note = await prisma.note.findFirst({
    where: { id, userId },
    include: { category: true },
  });

  if (!note) return null;

  const tags = await getTagsForEntity(userId, EntityType.NOTE, id);
  return { ...note, tags };
}

export async function getOwnedNote(userId: string, id: string) {
  const note = await getNoteById(userId, id);
  if (!note) {
    throw new Error("NOTE_NOT_FOUND");
  }
  return note;
}

export function contentSummary(content: string, maxLength = 120): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*_\-\[\]()!`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!plain) return "";
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}…`;
}
