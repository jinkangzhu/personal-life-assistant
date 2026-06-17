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
      description="今天想记住什么，就写什么"
      backHref="/diary"
      backLabel="返回列表"
    >
      <DiaryCreateForm tags={tags} />
    </PageShell>
  );
}
