"use client";
import { FormError, FormSuccess } from '@/components/ui/form-error';

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateDisplayNameAction } from "@/app/(main)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProfileForm({
  email,
  displayName,
}: {
  email: string;
  displayName: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateDisplayNameAction(formData);
      if (result.ok) {
        setError("");
        setSuccess("昵称已更新");
        router.refresh();
        return;
      }
      setError(result.error ?? "保存失败");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          邮箱
        </label>
        <Input id="email" value={email} disabled readOnly />
      </div>

      <div>
        <label htmlFor="displayName" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          昵称
        </label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName ?? ""}
          placeholder="留空则显示邮箱前缀"
          maxLength={50}
        />
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />

      <Button type="submit" disabled={pending}>
        {pending ? "保存中…" : "保存昵称"}
      </Button>
    </form>
  );
}
