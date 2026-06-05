import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  noteFilterHref,
  type NoteFilter,
} from "@/lib/validators/note";
import type { Category, Tag } from "@prisma/client";

export function NoteFilters({
  categories,
  tags,
  active,
}: {
  categories: Category[];
  tags: Tag[];
  active: NoteFilter;
}) {
  const categoryActive = !active.categoryId;
  const tagActive = !active.tagId;

  return (
    <div className="space-y-3">
      {categories.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--color-muted)]">分类</p>
          <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1">
            <Link
              href={noteFilterHref({ tagId: active.tagId })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition",
                categoryActive
                  ? "bg-indigo-600/15 text-indigo-400"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              全部
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={noteFilterHref({
                  categoryId: category.id,
                  tagId: active.tagId,
                })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  active.categoryId === category.id
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

      {tags.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--color-muted)]">标签</p>
          <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-1">
            <Link
              href={noteFilterHref({ categoryId: active.categoryId })}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition",
                tagActive
                  ? "bg-indigo-600/15 text-indigo-400"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              全部
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={noteFilterHref({
                  categoryId: active.categoryId,
                  tagId: tag.id,
                })}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition",
                  active.tagId === tag.id
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
    </div>
  );
}
