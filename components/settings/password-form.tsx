"use client";
import { FormError, FormSuccess } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { changePasswordAction } from "@/app/(main)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModuleFormActions, ModuleFormLabel } from "@/components/ui/module-ui";

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
    <form key={formKey} onSubmit={handleSubmit} className="space-y-5">
      <div>
        <ModuleFormLabel htmlFor="currentPassword">当前密码</ModuleFormLabel>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      <div>
        <ModuleFormLabel htmlFor="newPassword">新密码</ModuleFormLabel>
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
        <ModuleFormLabel htmlFor="confirmPassword">确认新密码</ModuleFormLabel>
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

      <ModuleFormActions className="border-t-0 pt-0">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "修改密码"}
        </Button>
      </ModuleFormActions>
    </form>
  );
}
