"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  removeAvatarAction,
  uploadAvatarAction,
} from "@/app/(main)/settings/actions";
import { SettingsFieldHint } from "@/components/settings/settings-ui";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { FormError, FormSuccess } from "@/components/ui/form-error";

export function AvatarUpload({
  user,
}: {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarKey: string | null;
    updatedAt: Date;
  };
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadPending, startUploadTransition] = useTransition();
  const [removePending, startRemoveTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const displayName = user.displayName ?? user.email.split("@")[0];

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSuccess("");
    const formData = new FormData();
    formData.set("avatar", file);

    startUploadTransition(async () => {
      const result = await uploadAvatarAction(formData);
      if (result.ok) {
        setError("");
        setSuccess("头像已更新");
        router.refresh();
        return;
      }
      setError(result.error ?? "上传失败");
    });

    event.target.value = "";
  }

  function handleRemove() {
    setSuccess("");
    startRemoveTransition(async () => {
      const result = await removeAvatarAction();
      if (result.ok) {
        setError("");
        setSuccess("头像已移除");
        router.refresh();
        return;
      }
      setError(result.error ?? "移除失败");
    });
  }

  const pending = uploadPending || removePending;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <UserAvatar user={user} size="lg" />

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-lg font-medium leading-snug tracking-tight">
              {displayName}
            </p>
            <p className="mt-0.5 text-sm text-[var(--color-muted)]">{user.email}</p>
          </div>

          <SettingsFieldHint>
            支持 JPG、PNG、WebP、GIF，最大 2MB
          </SettingsFieldHint>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              {uploadPending ? "上传中…" : "上传头像"}
            </Button>
            {user.avatarKey && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={handleRemove}
              >
                {removePending ? "移除中…" : "移除头像"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      <FormError message={error} />
      <FormSuccess message={success} />
    </div>
  );
}
