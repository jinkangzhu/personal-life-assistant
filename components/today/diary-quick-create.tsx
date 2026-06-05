"use client";
import { FormError } from '@/components/ui/form-error';

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createDiary } from "@/app/(main)/diary/actions";

export function DiaryQuickCreate({ defaultDate }: { defaultDate: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createDiary(formData);
      if (result.ok) {
        setError("");
        form.reset();
        router.refresh();
        return;
      }
      setError(result.error ?? "创建失败");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        name="content"
        rows={3}
        required
        placeholder="快速记录今天的想法…（支持 Markdown）"
        className="w-full rounded-lg border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[var(--color-muted)] focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20"
      />
      <input type="hidden" name="date" value={defaultDate} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-[var(--color-muted)]">保存后显示在今日日记列表</p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-indigo-600/15 px-3 py-1.5 text-xs text-indigo-400 transition hover:bg-indigo-600/25 disabled:opacity-50"
        >
          {pending ? "保存中…" : "保存日记"}
        </button>
      </div>
      <FormError message={error} size="sm" />
    </form>
  );
}
