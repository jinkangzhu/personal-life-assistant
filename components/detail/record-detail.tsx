"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pencil, Trash2 } from "lucide-react";

interface RecordDetailProps {
  children: React.ReactNode;
  editForm: (ctx: { exitEdit: () => void }) => React.ReactNode;
  onDelete?: () => void;
  deletePending?: boolean;
  deleteLabel?: string;
  deleteConfirmTitle?: string;
  deleteConfirmDescription?: string;
  deleteConfirmLabel?: string;
  defaultEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

const actionButtonClassName =
  "h-8 gap-1.5 rounded-lg px-3 text-xs text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]";

export function RecordDetail({
  children,
  editForm,
  onDelete,
  deletePending = false,
  deleteLabel = "删除",
  deleteConfirmTitle = "确认删除",
  deleteConfirmDescription = "此操作不可撤销。",
  deleteConfirmLabel = "删除",
  defaultEditing = false,
  onEditingChange,
}: RecordDetailProps) {
  const [editing, setEditing] = useState(defaultEditing);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function enterEdit() {
    setEditing(true);
    onEditingChange?.(true);
  }

  function exitEdit() {
    setEditing(false);
    onEditingChange?.(false);
  }

  if (editing) {
    return editForm({ exitEdit });
  }

  function handleConfirmDelete() {
    setConfirmOpen(false);
    onDelete?.();
  }

  return (
    <>
      {children}
      <div className="mt-8 flex justify-end gap-2 border-t border-[var(--color-border)]/70 pt-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={actionButtonClassName}
          onClick={enterEdit}
        >
          <Pencil className="h-3.5 w-3.5" />
          编辑
        </Button>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={deletePending}
            className={`${actionButtonClassName} hover:text-red-400/90`}
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deletePending ? "删除中…" : deleteLabel}
          </Button>
        )}
      </div>
      {onDelete && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={deleteConfirmTitle}
          description={deleteConfirmDescription}
          confirmLabel={deleteConfirmLabel}
          onConfirm={handleConfirmDelete}
          pending={deletePending}
        />
      )}
    </>
  );
}
