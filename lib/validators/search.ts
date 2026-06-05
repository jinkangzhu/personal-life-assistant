import { z } from "zod";
import { parseDateInput, toDateInputValue } from "@/lib/utils";

export const searchEntityTypes = [
  "DIARY",
  "TODO",
  "NOTE",
  "PLAN",
  "REVIEW",
  "GOAL",
] as const;

export const searchEntityTypeSchema = z.enum(searchEntityTypes);

export type SearchEntityType = z.infer<typeof searchEntityTypeSchema>;

export type SearchFilter = {
  q?: string;
  types?: SearchEntityType[];
  tagId?: string;
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

export const SEARCH_ENTITY_LABELS: Record<SearchEntityType, string> = {
  DIARY: "日记",
  TODO: "待办",
  NOTE: "笔记",
  PLAN: "计划",
  REVIEW: "复盘",
  GOAL: "长期目标",
};

export function parseSearchTypes(value: string | undefined): SearchEntityType[] | undefined {
  if (!value?.trim()) return undefined;

  const types = value
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter((item): item is SearchEntityType =>
      searchEntityTypes.includes(item as SearchEntityType),
    );

  return types.length > 0 ? [...new Set(types)] : undefined;
}

export function parseSearchFilter(params: {
  q?: string;
  type?: string;
  tag?: string;
  category?: string;
  from?: string;
  to?: string;
}): SearchFilter {
  return {
    q: params.q?.trim() || undefined,
    types: parseSearchTypes(params.type),
    tagId: params.tag?.trim() || undefined,
    categoryId: params.category?.trim() || undefined,
    dateFrom: parseDateInput(params.from) ?? undefined,
    dateTo: parseDateInput(params.to) ?? undefined,
  };
}

export function hasSearchCriteria(filter: SearchFilter): boolean {
  return Boolean(
    filter.q ||
      filter.types?.length ||
      filter.tagId ||
      filter.categoryId ||
      filter.dateFrom ||
      filter.dateTo,
  );
}

export function searchFilterHref(filter: SearchFilter): string {
  const params = new URLSearchParams();

  if (filter.q) params.set("q", filter.q);
  if (filter.types?.length) params.set("type", filter.types.join(","));
  if (filter.tagId) params.set("tag", filter.tagId);
  if (filter.categoryId) params.set("category", filter.categoryId);
  if (filter.dateFrom) params.set("from", toDateInputValue(filter.dateFrom));
  if (filter.dateTo) params.set("to", toDateInputValue(filter.dateTo));

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}
