import type { NoteWithRelations } from "@/lib/services/note";
import { NoteCreateButton } from "@/components/notes/note-create-button";
import { NoteItem } from "@/components/notes/note-item";
import { ModuleEmptyState } from "@/components/ui/module-ui";

export function NoteList({ notes }: { notes: NoteWithRelations[] }) {
  if (notes.length === 0) {
    return (
      <ModuleEmptyState
        module="note"
        title="还没有笔记"
        description="把技术要点、学习心得和易错点沉淀下来，方便以后查找。"
        action={<NoteCreateButton />}
      />
    );
  }

  return (
    <ul className="space-y-2.5">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </ul>
  );
}
