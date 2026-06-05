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
    <PageShell title="日记" description="按日期浏览已写好的日记">
      <DiaryList groups={groups} />
      <div className="flex justify-center pt-4">
        <DiaryWriteButton />
      </div>
    </PageShell>
  );
}
