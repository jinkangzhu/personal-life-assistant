import { prisma } from "@/lib/db";
import type { ActivityType } from "@prisma/client";

export async function listUserActivityTypes(
  userId: string,
): Promise<ActivityType[]> {
  return prisma.activityType.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getActivityTypeById(userId: string, id: string) {
  return prisma.activityType.findFirst({
    where: { id, userId },
  });
}

export async function getOwnedActivityType(userId: string, id: string) {
  const activityType = await getActivityTypeById(userId, id);
  if (!activityType) {
    throw new Error("ACTIVITY_TYPE_NOT_FOUND");
  }
  return activityType;
}

async function nextActivityTypeSortOrder(userId: string) {
  const last = await prisma.activityType.findFirst({
    where: { userId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? -1) + 1;
}

export async function createActivityType(userId: string, name: string) {
  return prisma.activityType.create({
    data: {
      userId,
      name,
      sortOrder: await nextActivityTypeSortOrder(userId),
    },
  });
}

export async function updateActivityType(
  userId: string,
  id: string,
  data: { name: string },
) {
  await getOwnedActivityType(userId, id);
  return prisma.activityType.update({
    where: { id },
    data: { name: data.name },
  });
}

export async function deleteActivityType(userId: string, id: string) {
  await getOwnedActivityType(userId, id);
  await prisma.activityType.delete({ where: { id } });
}

export async function reorderActivityTypes(
  userId: string,
  orderedIds: string[],
) {
  const activityTypes = await listUserActivityTypes(userId);

  if (orderedIds.length !== activityTypes.length) {
    throw new Error("INVALID_ORDER");
  }

  const ownedIds = new Set(activityTypes.map((item) => item.id));
  for (const id of orderedIds) {
    if (!ownedIds.has(id)) {
      throw new Error("ACTIVITY_TYPE_NOT_FOUND");
    }
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.activityType.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return listUserActivityTypes(userId);
}

export async function resolveActivityTypeId(
  userId: string,
  activityTypeId: string | null | undefined,
) {
  if (!activityTypeId) return null;
  await getOwnedActivityType(userId, activityTypeId);
  return activityTypeId;
}
