import { TagBadge } from "@/components/tags/tag-badge";
import { MarkdownContent } from "@/components/ui/markdown-content";
import type { NoteWithRelations } from "@/lib/services/note";

export function NoteView({ note }: { note: NoteWithRelations }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-muted)]">
        {note.category && <span>{note.category.name}</span>}
        <span>
          创建于 {new Date(note.createdAt).toLocaleString("zh-CN")}
        </span>
        {note.updatedAt.getTime() !== note.createdAt.getTime() && (
          <span>
            更新于 {new Date(note.updatedAt).toLocaleString("zh-CN")}
          </span>
        )}
      </div>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      )}

      <MarkdownContent content={note.content} />
    </div>
  );
}
