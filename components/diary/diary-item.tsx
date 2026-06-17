import Link from "next/link";
import type { DiaryWithTags } from "@/lib/services/diary";
import { cn, formatDate } from "@/lib/utils";
import { MOOD_EMOJI, MOOD_LABELS } from "@/lib/validators/diary";
import { TagBadge } from "@/components/tags/tag-badge";
import { MarkdownPreview } from "@/components/ui/markdown-preview";

export function DiaryItem({ entry }: { entry: DiaryWithTags }) {
  const displayTitle = entry.title || "无标题";
  const timeLabel = new Date(entry.createdAt).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li>
      <Link
        href={`/diary/${entry.id}`}
        className={cn(
          "group relative block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3.5 transition",
          "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        )}
      >
        <div className="absolute inset-y-0 left-0 w-0.5 bg-rose-400/55" aria-hidden="true" />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.9375rem] font-medium leading-snug tracking-tight transition group-hover:text-indigo-300">
            {displayTitle}
          </span>
          {entry.mood && (
            <span className="text-xs text-[var(--color-muted)]">
              {MOOD_EMOJI[entry.mood]} {MOOD_LABELS[entry.mood]}
            </span>
          )}
          <span className="text-xs text-[var(--color-muted)]">{timeLabel}</span>
        </div>

        {entry.content.trim() && (
          <div className="mt-2">
            <MarkdownPreview content={entry.content} />
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </Link>
    </li>
  );
}

export function DiaryDateGroup({
  date,
  entries,
}: {
  date: Date;
  entries: DiaryWithTags[];
}) {
  return (
    <section className="space-y-2">
      <h2 className="sticky top-14 z-10 bg-[var(--color-background)]/95 py-1 text-sm font-medium text-[var(--color-muted)] backdrop-blur">
        {formatDate(date)}
        <span className="ml-2 text-xs font-normal opacity-70">{entries.length} 条</span>
      </h2>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <DiaryItem key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  );
}
