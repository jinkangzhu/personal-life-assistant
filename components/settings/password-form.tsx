"use client";
import { FormError, FormSuccess } from '@/components/ui/form-error';

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/app/(main)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PasswordForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await changePasswordAction(formData);
      if (result.ok) {
        setError("");
        setSuccess("密码已更新");
        setFormKey((key) => key + 1);
        return;
      }
      setError(result.error ?? "修改失败");
    });
  }

  return (
    <form key={formKey} onSubmit={handleSubmit} className="space-y-4 px-4 pb-4">
      <div>
        <label htmlFor="currentPassword" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          当前密码
        </label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          新密码
        </label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          placeholder="至少 8 位"
          required
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          确认新密码
        </label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <FormError message={error} />
      <FormSuccess message={success} />

      <Button type="submit" disabled={pending}>
        {pending ? "保存中…" : "修改密码"}
      </Button>
    </form>
  );
}
