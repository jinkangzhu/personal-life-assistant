import { TagBadge } from "@/components/tags/tag-badge";
import { MarkdownContent } from "@/components/ui/markdown-content";
import {
  ModuleMetaDivider,
  ModuleMetaRow,
} from "@/components/ui/module-ui";
import type { DiaryWithTags } from "@/lib/services/diary";
import { formatDate } from "@/lib/utils";
import { MOOD_EMOJI, MOOD_LABELS } from "@/lib/validators/diary";

export function DiaryView({ entry }: { entry: DiaryWithTags }) {
  return (
    <div className="space-y-5">
      <ModuleMetaRow>
        <span>{formatDate(entry.date)}</span>
        {entry.mood && (
          <>
            <ModuleMetaDivider />
            <span>
              {MOOD_EMOJI[entry.mood]} {MOOD_LABELS[entry.mood]}
            </span>
          </>
        )}
        <ModuleMetaDivider />
        <span>创建于 {new Date(entry.createdAt).toLocaleString("zh-CN")}</span>
        {entry.updatedAt.getTime() !== entry.createdAt.getTime() && (
          <>
            <ModuleMetaDivider />
            <span>更新于 {new Date(entry.updatedAt).toLocaleString("zh-CN")}</span>
          </>
        )}
      </ModuleMetaRow>

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
