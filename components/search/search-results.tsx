import Link from "next/link";
import { EmptyState } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SEARCH_ENTITY_LABELS } from "@/lib/validators/search";
import type { SearchResultGroup } from "@/lib/services/search";

function SearchResultItem({
  item,
}: {
  item: SearchResultGroup["items"][number];
}) {
  const updatedLabel = new Date(item.updatedAt).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "group block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 transition",
          "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <span className="inline-flex rounded-md bg-indigo-600/15 px-2 py-0.5 text-xs text-indigo-300">
              {SEARCH_ENTITY_LABELS[item.type]}
            </span>
            <p className="text-sm font-medium group-hover:text-indigo-400">
              {item.title}
            </p>
          </div>
          <span className="shrink-0 text-xs text-[var(--color-muted)]">
            {updatedLabel}
          </span>
        </div>

        {item.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
            {item.summary}
          </p>
        )}
      </Link>
    </li>
  );
}

export function SearchResults({ groups }: { groups: SearchResultGroup[] }) {
  if (groups.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        title="没有找到匹配的内容，试试调整关键词或筛选条件"
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.type} className="space-y-2">
          <h2 className="text-sm font-medium text-[var(--color-muted)]">
            {group.label}
            <span className="ml-2 text-xs font-normal opacity-70">
              {group.items.length} 条
            </span>
          </h2>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <SearchResultItem key={`${item.type}-${item.id}`} item={item} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
