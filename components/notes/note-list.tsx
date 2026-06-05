import type { NoteWithRelations } from "@/lib/services/note";
import { NoteItem } from "@/components/notes/note-item";
import { EmptyState } from "@/components/ui/card";

export function NoteList({ notes }: { notes: NoteWithRelations[] }) {
  if (notes.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        title="暂无笔记，创建第一条开始沉淀知识吧"
      />
    );
  }

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </ul>
  );
}
