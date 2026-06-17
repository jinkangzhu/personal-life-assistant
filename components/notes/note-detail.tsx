"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteNote } from "@/app/(main)/notes/actions";
import { RecordDetail } from "@/components/detail/record-detail";
import { NoteEditForm } from "@/components/notes/note-edit-form";
import { NoteView } from "@/components/notes/note-view";
import { ModulePanel } from "@/components/ui/module-ui";
import type { NoteWithRelations } from "@/lib/services/note";
import type { Category, Tag } from "@prisma/client";

export function NoteDetail({
  note,
  categories = [],
  tags = [],
}: {
  note: NoteWithRelations;
  categories?: Category[];
  tags?: Tag[];
}) {
  const router = useRouter();
  const [deletePending, startDeleteTransition] = useTransition();

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteNote(note.id);
    });
  }

  return (
    <ModulePanel module="note">
      <RecordDetail
        onDelete={handleDelete}
        deletePending={deletePending}
        deleteConfirmTitle="删除笔记"
        deleteConfirmDescription="确定删除此笔记？此操作不可撤销。"
        editForm={({ exitEdit }) => (
          <NoteEditForm
            key={note.updatedAt.toISOString()}
            note={note}
            categories={categories}
            tags={tags}
            onCancel={exitEdit}
            onSaved={() => {
              exitEdit();
              router.refresh();
            }}
          />
        )}
      >
        <NoteView note={note} />
      </RecordDetail>
    </ModulePanel>
  );
}
