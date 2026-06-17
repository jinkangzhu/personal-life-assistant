import { requireSession } from "@/lib/session";
import { listUserCategories } from "@/lib/services/category";
import { listNotes } from "@/lib/services/note";
import { listUserTags } from "@/lib/services/tag";
import { parseNoteFilter } from "@/lib/validators/note";
import { PageShell } from "@/components/layout/page-shell";
import { NoteCreateButton } from "@/components/notes/note-create-button";
import { NoteFilters } from "@/components/notes/note-filters";
import { NoteList } from "@/components/notes/note-list";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const filter = parseNoteFilter(params);

  const [notes, categories, tags] = await Promise.all([
    listNotes(session.id, filter),
    listUserCategories(session.id),
    listUserTags(session.id),
  ]);

  const hasFilters = categories.length > 0 || tags.length > 0;

  return (
    <PageShell
      title="笔记"
      description="沉淀可复用的知识，分类和标签帮你以后找得到"
      action={<NoteCreateButton />}
    >
      {hasFilters && (
        <NoteFilters categories={categories} tags={tags} active={filter} />
      )}
      <NoteList notes={notes} />
    </PageShell>
  );
}
