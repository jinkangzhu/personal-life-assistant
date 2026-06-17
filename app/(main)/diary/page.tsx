import { requireSession } from "@/lib/session";
import { groupDiariesByDate, listDiaries } from "@/lib/services/diary";
import { PageShell } from "@/components/layout/page-shell";
import { DiaryList } from "@/components/diary/diary-list";
import { DiaryWriteButton } from "@/components/diary/diary-write-button";

export default async function DiaryPage() {
  const session = await requireSession();
  const entries = await listDiaries(session.id);
  const groups = groupDiariesByDate(entries);

  return (
    <PageShell
      title="日记"
      description="按日期回看记录——发生的事、学到的东西、当时的心情"
      action={<DiaryWriteButton />}
    >
      <DiaryList groups={groups} />
    </PageShell>
  );
}
