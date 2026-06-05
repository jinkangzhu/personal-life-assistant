import { requireSession } from "@/lib/session";
import { listUserTags } from "@/lib/services/tag";
import { PageShell } from "@/components/layout/page-shell";
import { DiaryCreateForm } from "@/components/diary/diary-create-form";

export default async function DiaryNewPage() {
  const session = await requireSession();
  const tags = await listUserTags(session.id);

  return (
    <PageShell
      title="写日记"
      description="记录今天的学习、生活与心情"
      backHref="/diary"
      backLabel="返回列表"
    >
      <DiaryCreateForm tags={tags} />
    </PageShell>
  );
}
