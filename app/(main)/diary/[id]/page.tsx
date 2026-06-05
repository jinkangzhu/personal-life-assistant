import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getDiaryById } from "@/lib/services/diary";
import { listUserTags } from "@/lib/services/tag";
import { PageShell } from "@/components/layout/page-shell";
import { DiaryDetail } from "@/components/diary/diary-detail";

export default async function DiaryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const [entry, tags] = await Promise.all([
    getDiaryById(session.id, id),
    listUserTags(session.id),
  ]);

  if (!entry) {
    notFound();
  }

  const displayTitle = entry.title || "无标题";

  return (
    <PageShell title={displayTitle} backHref="/diary" backLabel="返回列表">
      <DiaryDetail entry={entry} tags={tags} />
    </PageShell>
  );
}
