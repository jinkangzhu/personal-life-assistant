import { prisma } from "@/lib/db";
import type { Category } from "@prisma/client";

export async function listUserCategories(userId: string): Promise<Category[]> {
  return prisma.category.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getCategoryById(userId: string, id: string) {
  return prisma.category.findFirst({
    where: { id, userId },
  });
}

export async function getOwnedCategory(userId: string, id: string) {
  const category = await getCategoryById(userId, id);
  if (!category) {
    throw new Error("CATEGORY_NOT_FOUND");
  }
  return category;
}

async function nextCategorySortOrder(userId: string) {
  const last = await prisma.category.findFirst({
    where: { userId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  return (last?.sortOrder ?? -1) + 1;
}

export async function createCategory(userId: string, name: string) {
  return prisma.category.create({
    data: {
      userId,
      name,
      sortOrder: await nextCategorySortOrder(userId),
    },
  });
}

export async function updateCategory(
  userId: string,
  id: string,
  data: { name: string },
) {
  await getOwnedCategory(userId, id);
  return prisma.category.update({
    where: { id },
    data: { name: data.name },
  });
}

export async function deleteCategory(userId: string, id: string) {
  await getOwnedCategory(userId, id);
  await prisma.category.delete({ where: { id } });
}

export async function reorderCategories(userId: string, orderedIds: string[]) {
  const categories = await listUserCategories(userId);

  if (orderedIds.length !== categories.length) {
    throw new Error("INVALID_ORDER");
  }

  const ownedIds = new Set(categories.map((category) => category.id));
  for (const id of orderedIds) {
    if (!ownedIds.has(id)) {
      throw new Error("CATEGORY_NOT_FOUND");
    }
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  return listUserCategories(userId);
}
