"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteDiary } from "@/app/(main)/diary/actions";
import { RecordDetail } from "@/components/detail/record-detail";
import { DiaryEditForm } from "@/components/diary/diary-edit-form";
import { DiaryView } from "@/components/diary/diary-view";
import { ModulePanel } from "@/components/ui/module-ui";
import type { DiaryWithTags } from "@/lib/services/diary";
import type { Tag } from "@prisma/client";

export function DiaryDetail({
  entry,
  tags = [],
}: {
  entry: DiaryWithTags;
  tags?: Tag[];
}) {
  const router = useRouter();
  const [deletePending, startDeleteTransition] = useTransition();

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteDiary(entry.id);
    });
  }

  return (
    <ModulePanel module="diary">
      <RecordDetail
        onDelete={handleDelete}
        deletePending={deletePending}
        deleteConfirmTitle="删除日记"
        deleteConfirmDescription="确定删除此日记？此操作不可撤销。"
        editForm={({ exitEdit }) => (
          <DiaryEditForm
            key={entry.updatedAt.toISOString()}
            entry={entry}
            tags={tags}
            onCancel={exitEdit}
            onSaved={() => {
              exitEdit();
              router.refresh();
            }}
          />
        )}
      >
        <DiaryView entry={entry} />
      </RecordDetail>
    </ModulePanel>
  );
}
