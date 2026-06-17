import { TagBadge } from "@/components/tags/tag-badge";
import { MarkdownContent } from "@/components/ui/markdown-content";
import {
  ModuleMetaDivider,
  ModuleMetaRow,
} from "@/components/ui/module-ui";
import type { NoteWithRelations } from "@/lib/services/note";

export function NoteView({ note }: { note: NoteWithRelations }) {
  return (
    <div className="space-y-5">
      <ModuleMetaRow>
        {note.category && <span>{note.category.name}</span>}
        {note.category && <ModuleMetaDivider />}
        <span>创建于 {new Date(note.createdAt).toLocaleString("zh-CN")}</span>
        {note.updatedAt.getTime() !== note.createdAt.getTime() && (
          <>
            <ModuleMetaDivider />
            <span>更新于 {new Date(note.updatedAt).toLocaleString("zh-CN")}</span>
          </>
        )}
      </ModuleMetaRow>

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
