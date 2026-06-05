import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  SEARCH_ENTITY_LABELS,
  searchEntityTypes,
  searchFilterHref,
  type SearchEntityType,
  type SearchFilter,
} from "@/lib/validators/search";
import type { Category, Tag } from "@prisma/client";

function toggleType(
  current: SearchEntityType[] | undefined,
  type: SearchEntityType,
): SearchEntityType[] | undefined {
  const allSelected = !current?.length;
  const selected = new Set(allSelected ? searchEntityTypes : current);

  if (selected.has(type)) {
    selected.delete(type);
  } else {
    selected.add(type);
  }

  if (selected.size === 0 || selected.size === searchEntityTypes.length) {
    return undefined;
  }

  return searchEntityTypes.filter((item) => selected.has(item));
}

export function SearchFilters({
  filter,
  categories,
  tags,
}: {
  filter: SearchFilter;
  categories: Category[];
  tags: Tag[];
}) {
  const activeTypes = new Set(filter.types ?? searchEntityTypes);
  const showCategoryFilter =
    categories.length > 0 &&
    (!filter.types?.length || filter.types.includes("NOTE"));

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-xs text-[var(--color-muted)]">内容类型</p>
        <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1">
          {searchEntityTypes.map((type) => {
            const isActive = activeTypes.has(type);
            const nextTypes = toggleType(filter.types, type);

            return (
              <Link
                key={type}
                href={searchFilterHref({ ...filter, types: nextTypes })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  isActive
                    ? "bg-indigo-600/15 text-indigo-400"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
                )}
              >
                {SEARCH_ENTITY_LABELS[type]}
              </Link>
            );
          })}
        </div>
      </div>

      {tags.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--color-muted)]">标签</p>
          <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1">
            <Link
              href={searchFilterHref({ ...filter, tagId: undefined })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition",
                !filter.tagId
                  ? "bg-indigo-600/15 text-indigo-400"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              全部
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={searchFilterHref({
                  ...filter,
                  tagId: filter.tagId === tag.id ? undefined : tag.id,
                })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  filter.tagId === tag.id
                    ? "bg-indigo-600/15 text-indigo-400"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
                )}
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {showCategoryFilter && (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--color-muted)]">笔记分类</p>
          <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1">
            <Link
              href={searchFilterHref({ ...filter, categoryId: undefined })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition",
                !filter.categoryId
                  ? "bg-indigo-600/15 text-indigo-400"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              全部
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={searchFilterHref({
                  ...filter,
                  categoryId:
                    filter.categoryId === category.id ? undefined : category.id,
                })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  filter.categoryId === category.id
                    ? "bg-indigo-600/15 text-indigo-400"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
                )}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
