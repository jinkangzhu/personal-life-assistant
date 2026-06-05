import { prisma } from "@/lib/db";
import { contentSummary } from "@/lib/services/note";
import {
  SEARCH_ENTITY_LABELS,
  type SearchEntityType,
  type SearchFilter,
  searchEntityTypes,
} from "@/lib/validators/search";
import { endOfDay, formatDate, startOfDay } from "@/lib/utils";
import { EntityType, ReviewPeriodType } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const SEARCH_LIMIT_PER_TYPE = 50;

export type SearchResultItem = {
  id: string;
  type: SearchEntityType;
  title: string;
  summary: string;
  updatedAt: Date;
  href: string;
};

export type SearchResultGroup = {
  type: SearchEntityType;
  label: string;
  items: SearchResultItem[];
};

export type SearchResults = {
  groups: SearchResultGroup[];
  totalCount: number;
};

const REVIEW_PERIOD_LABELS: Record<ReviewPeriodType, string> = {
  DAILY: "每日复盘",
  WEEKLY: "每周复盘",
  MONTHLY: "每月复盘",
  QUARTERLY: "每季复盘",
  YEARLY: "每年复盘",
};

const SEARCH_ENTITY_TO_TAG_TYPE: Record<SearchEntityType, EntityType> = {
  DIARY: EntityType.DIARY,
  TODO: EntityType.TODO,
  NOTE: EntityType.NOTE,
  PLAN: EntityType.PLAN,
  REVIEW: EntityType.REVIEW,
  GOAL: EntityType.GOAL,
};

function buildUpdatedAtRange(filter: SearchFilter): Prisma.DateTimeFilter | undefined {
  if (!filter.dateFrom && !filter.dateTo) return undefined;

  const range: Prisma.DateTimeFilter = {};
  if (filter.dateFrom) range.gte = startOfDay(filter.dateFrom);
  if (filter.dateTo) range.lte = endOfDay(filter.dateTo);
  return range;
}

function mergeWhere<T extends Record<string, unknown>>(
  ...clauses: (T | undefined)[]
): T {
  const and = clauses.filter(Boolean) as T[];
  if (and.length === 0) return {} as T;
  if (and.length === 1) return and[0];
  return { AND: and } as unknown as T;
}

function buildKeywordWhere(
  keyword: string | undefined,
  fields: string[],
): { OR: Record<string, { contains: string }>[] } | undefined {
  if (!keyword?.trim()) return undefined;

  const value = keyword.trim();
  return {
    OR: fields.map((field) => ({ [field]: { contains: value } })),
  };
}

function buildIdFilter(ids: Set<string> | undefined): { id?: { in: string[] } } {
  if (!ids) return {};
  if (ids.size === 0) return { id: { in: [] } };
  return { id: { in: Array.from(ids) } };
}

async function getTaggedEntityIds(
  userId: string,
  tagId: string,
): Promise<Map<EntityType, Set<string>>> {
  const relations = await prisma.tagRelation.findMany({
    where: { userId, tagId },
    select: { entityType: true, entityId: true },
  });

  const map = new Map<EntityType, Set<string>>();
  for (const relation of relations) {
    const ids = map.get(relation.entityType) ?? new Set<string>();
    ids.add(relation.entityId);
    map.set(relation.entityType, ids);
  }

  return map;
}

function resolveTypes(filter: SearchFilter): SearchEntityType[] {
  const selected = filter.types?.length ? filter.types : [...searchEntityTypes];
  if (filter.categoryId) {
    return selected.filter((type) => type === "NOTE");
  }
  return selected;
}

function toSearchItem(
  type: SearchEntityType,
  item: {
    id: string;
    title: string;
    summary: string;
    updatedAt: Date;
    href: string;
  },
): SearchResultItem {
  return {
    id: item.id,
    type,
    title: item.title,
    summary: item.summary,
    updatedAt: item.updatedAt,
    href: item.href,
  };
}

async function searchDiaries(
  userId: string,
  filter: SearchFilter,
  taggedIds: Set<string> | undefined,
): Promise<SearchResultItem[]> {
  const updatedAt = buildUpdatedAtRange(filter);
  const where = mergeWhere<Prisma.DiaryEntryWhereInput>(
    { userId },
    updatedAt ? { updatedAt } : undefined,
    buildKeywordWhere(filter.q, ["title", "content"]),
    buildIdFilter(taggedIds),
  );

  const entries = await prisma.diaryEntry.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: SEARCH_LIMIT_PER_TYPE,
  });

  return entries.map((entry) =>
    toSearchItem("DIARY", {
      id: entry.id,
      title: entry.title || "无标题",
      summary: contentSummary(entry.content),
      updatedAt: entry.updatedAt,
      href: `/diary/${entry.id}`,
    }),
  );
}

async function searchTodos(
  userId: string,
  filter: SearchFilter,
  taggedIds: Set<string> | undefined,
): Promise<SearchResultItem[]> {
  const updatedAt = buildUpdatedAtRange(filter);
  const where = mergeWhere<Prisma.TodoWhereInput>(
    { userId },
    updatedAt ? { updatedAt } : undefined,
    buildKeywordWhere(filter.q, ["title", "description", "completionNote"]),
    buildIdFilter(taggedIds),
  );

  const todos = await prisma.todo.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: SEARCH_LIMIT_PER_TYPE,
  });

  return todos.map((todo) =>
    toSearchItem("TODO", {
      id: todo.id,
      title: todo.title,
      summary: contentSummary(todo.description ?? todo.completionNote ?? ""),
      updatedAt: todo.updatedAt,
      href: `/todos/${todo.id}`,
    }),
  );
}

async function searchNotes(
  userId: string,
  filter: SearchFilter,
  taggedIds: Set<string> | undefined,
): Promise<SearchResultItem[]> {
  const updatedAt = buildUpdatedAtRange(filter);
  const where = mergeWhere<Prisma.NoteWhereInput>(
    { userId },
    updatedAt ? { updatedAt } : undefined,
    filter.categoryId ? { categoryId: filter.categoryId } : undefined,
    buildKeywordWhere(filter.q, ["title", "content"]),
    buildIdFilter(taggedIds),
  );

  const notes = await prisma.note.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: SEARCH_LIMIT_PER_TYPE,
  });

  return notes.map((note) =>
    toSearchItem("NOTE", {
      id: note.id,
      title: note.title,
      summary: contentSummary(note.content),
      updatedAt: note.updatedAt,
      href: `/notes/${note.id}`,
    }),
  );
}

async function searchPlans(
  userId: string,
  filter: SearchFilter,
  taggedIds: Set<string> | undefined,
): Promise<SearchResultItem[]> {
  const updatedAt = buildUpdatedAtRange(filter);
  const where = mergeWhere<Prisma.PlanWhereInput>(
    { userId },
    updatedAt ? { updatedAt } : undefined,
    buildKeywordWhere(filter.q, ["title", "description"]),
    buildIdFilter(taggedIds),
  );

  const plans = await prisma.plan.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: SEARCH_LIMIT_PER_TYPE,
  });

  return plans.map((plan) =>
    toSearchItem("PLAN", {
      id: plan.id,
      title: plan.title,
      summary: contentSummary(plan.description ?? ""),
      updatedAt: plan.updatedAt,
      href: `/plans/${plan.id}`,
    }),
  );
}

async function searchReviews(
  userId: string,
  filter: SearchFilter,
  taggedIds: Set<string> | undefined,
): Promise<SearchResultItem[]> {
  const updatedAt = buildUpdatedAtRange(filter);
  const where = mergeWhere<Prisma.ReviewWhereInput>(
    { userId },
    updatedAt ? { updatedAt } : undefined,
    buildKeywordWhere(filter.q, ["content"]),
    buildIdFilter(taggedIds),
  );

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: SEARCH_LIMIT_PER_TYPE,
  });

  return reviews.map((review) =>
    toSearchItem("REVIEW", {
      id: review.id,
      title: `${REVIEW_PERIOD_LABELS[review.periodType]} · ${formatDate(review.periodDate)}`,
      summary: contentSummary(review.content),
      updatedAt: review.updatedAt,
      href: `/reviews/${review.id}`,
    }),
  );
}

async function searchGoals(
  userId: string,
  filter: SearchFilter,
  taggedIds: Set<string> | undefined,
): Promise<SearchResultItem[]> {
  const updatedAt = buildUpdatedAtRange(filter);
  const where = mergeWhere<Prisma.LongTermGoalWhereInput>(
    { userId },
    updatedAt ? { updatedAt } : undefined,
    buildKeywordWhere(filter.q, ["title", "description"]),
    buildIdFilter(taggedIds),
  );

  const goals = await prisma.longTermGoal.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: SEARCH_LIMIT_PER_TYPE,
  });

  return goals.map((goal) =>
    toSearchItem("GOAL", {
      id: goal.id,
      title: goal.title,
      summary: contentSummary(goal.description ?? ""),
      updatedAt: goal.updatedAt,
      href: `/goals/${goal.id}`,
    }),
  );
}

const SEARCH_HANDLERS: Record<
  SearchEntityType,
  (
    userId: string,
    filter: SearchFilter,
    taggedIds: Set<string> | undefined,
  ) => Promise<SearchResultItem[]>
> = {
  DIARY: searchDiaries,
  TODO: searchTodos,
  NOTE: searchNotes,
  PLAN: searchPlans,
  REVIEW: searchReviews,
  GOAL: searchGoals,
};

/**
 * MVP implementation using Prisma `contains` (SQLite LIKE).
 * Replace this function with FTS5-backed search when data volume grows.
 */
async function searchWithContains(
  userId: string,
  filter: SearchFilter,
): Promise<SearchResults> {
  const types = resolveTypes(filter);
  const taggedEntityMap = filter.tagId
    ? await getTaggedEntityIds(userId, filter.tagId)
    : undefined;

  const groupResults = await Promise.all(
    types.map(async (type) => {
      const taggedIds = filter.tagId
        ? taggedEntityMap?.get(SEARCH_ENTITY_TO_TAG_TYPE[type])
        : undefined;

      if (filter.tagId && taggedIds?.size === 0) {
        return { type, items: [] as SearchResultItem[] };
      }

      const items = await SEARCH_HANDLERS[type](userId, filter, taggedIds);
      return { type, items };
    }),
  );

  const groups = groupResults
    .filter((group) => group.items.length > 0)
    .map((group) => ({
      type: group.type,
      label: SEARCH_ENTITY_LABELS[group.type],
      items: group.items,
    }));

  return {
    groups,
    totalCount: groups.reduce((count, group) => count + group.items.length, 0),
  };
}

export async function search(
  userId: string,
  filter: SearchFilter,
): Promise<SearchResults> {
  return searchWithContains(userId, filter);
}
