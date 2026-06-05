import { prisma } from "@/lib/db";
import { pickTagColor } from "@/lib/validators/tag";
import { EntityType, type Tag } from "@prisma/client";

export { parseTagNames } from "@/lib/validators/tag";

export async function listUserTags(userId: string): Promise<Tag[]> {
  return prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export type TagWithUsage = Tag & { usageCount: number };

export async function listUserTagsWithUsage(userId: string): Promise<TagWithUsage[]> {
  const tags = await prisma.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { relations: true } } },
  });

  return tags.map(({ _count, ...tag }) => ({
    ...tag,
    usageCount: _count.relations,
  }));
}

export async function getTagById(userId: string, id: string) {
  return prisma.tag.findFirst({
    where: { id, userId },
  });
}

export async function getOwnedTag(userId: string, id: string) {
  const tag = await getTagById(userId, id);
  if (!tag) {
    throw new Error("TAG_NOT_FOUND");
  }
  return tag;
}

export async function createTag(
  userId: string,
  data: { name: string; color?: string | null },
) {
  return prisma.tag.create({
    data: {
      userId,
      name: data.name,
      color: data.color ?? pickTagColor(data.name),
    },
  });
}

export async function updateTag(
  userId: string,
  id: string,
  data: { name?: string; color?: string | null },
) {
  await getOwnedTag(userId, id);
  return prisma.tag.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
    },
  });
}

export async function deleteTag(userId: string, id: string) {
  await getOwnedTag(userId, id);
  await prisma.tag.delete({ where: { id } });
}

export async function getTagsForEntities(
  userId: string,
  entityType: EntityType,
  entityIds: string[],
): Promise<Map<string, Tag[]>> {
  const map = new Map<string, Tag[]>();
  if (entityIds.length === 0) return map;

  const relations = await prisma.tagRelation.findMany({
    where: {
      userId,
      entityType,
      entityId: { in: entityIds },
    },
    include: { tag: true },
    orderBy: { tag: { name: "asc" } },
  });

  for (const relation of relations) {
    const list = map.get(relation.entityId) ?? [];
    list.push(relation.tag);
    map.set(relation.entityId, list);
  }

  return map;
}

export async function getTagsForEntity(
  userId: string,
  entityType: EntityType,
  entityId: string,
): Promise<Tag[]> {
  const map = await getTagsForEntities(userId, entityType, [entityId]);
  return map.get(entityId) ?? [];
}

export async function syncEntityTags(
  userId: string,
  entityType: EntityType,
  entityId: string,
  tagNames: string[],
) {
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({
        where: { userId_name: { userId, name } },
        create: { userId, name, color: pickTagColor(name) },
        update: {},
      }),
    ),
  );

  await prisma.$transaction([
    prisma.tagRelation.deleteMany({
      where: { userId, entityType, entityId },
    }),
    ...(tags.length > 0
      ? [
          prisma.tagRelation.createMany({
            data: tags.map((tag) => ({
              userId,
              tagId: tag.id,
              entityType,
              entityId,
            })),
          }),
        ]
      : []),
  ]);
}

export function tagsToInputValue(tags: Pick<Tag, "name">[]): string {
  return tags.map((tag) => tag.name).join(", ");
}
