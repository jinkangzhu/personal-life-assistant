import { TagBadge } from "@/components/tags/tag-badge";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { DiaryWithTags } from "@/lib/services/diary";
import { formatDate } from "@/lib/utils";
import { MOOD_EMOJI, MOOD_LABELS } from "@/lib/validators/diary";

export function DiaryView({ entry }: { entry: DiaryWithTags }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
        <span>{formatDate(entry.date)}</span>
        {entry.mood && (
          <span>
            {MOOD_EMOJI[entry.mood]} {MOOD_LABELS[entry.mood]}
          </span>
        )}
        <span>
          创建于 {new Date(entry.createdAt).toLocaleString("zh-CN")}
        </span>
        {entry.updatedAt.getTime() !== entry.createdAt.getTime() && (
          <span>
            更新于 {new Date(entry.updatedAt).toLocaleString("zh-CN")}
          </span>
        )}
      </div>

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      <MarkdownContent content={entry.content} />
    </div>
  );
}
