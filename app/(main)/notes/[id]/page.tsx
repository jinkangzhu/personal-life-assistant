import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { listUserCategories } from "@/lib/services/category";
import { getNoteById } from "@/lib/services/note";
import { listUserTags } from "@/lib/services/tag";
import { PageShell } from "@/components/layout/page-shell";
import { NoteDetail } from "@/components/notes/note-detail";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const [note, categories, tags] = await Promise.all([
    getNoteById(session.id, id),
    listUserCategories(session.id),
    listUserTags(session.id),
  ]);

  if (!note) {
    notFound();
  }

  return (
    <PageShell title={note.title} backHref="/notes" backLabel="返回列表">
      <NoteDetail note={note} categories={categories} tags={tags} />
    </PageShell>
  );
}
