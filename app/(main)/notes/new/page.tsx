import { requireSession } from "@/lib/session";
import { listUserCategories } from "@/lib/services/category";
import { listUserTags } from "@/lib/services/tag";
import { PageShell } from "@/components/layout/page-shell";
import { NoteCreateForm } from "@/components/notes/note-create-form";

export default async function NoteNewPage() {
  const session = await requireSession();
  const [categories, tags] = await Promise.all([
    listUserCategories(session.id),
    listUserTags(session.id),
  ]);

  return (
    <PageShell
      title="写笔记"
      description="记录技术笔记、学习心得与易错点"
      backHref="/notes"
      backLabel="返回列表"
    >
      <NoteCreateForm categories={categories} tags={tags} />
    </PageShell>
  );
}
