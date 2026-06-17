"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthField,
  AuthFooterText,
  AuthLink,
  AuthShell,
} from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          displayName: displayName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "注册失败");
        return;
      }

      router.push("/today");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="创建账号"
      description="注册后即可使用个人生活助手"
      footer={
        <AuthFooterText>
          已有账号？ <AuthLink href="/login">登录</AuthLink>
        </AuthFooterText>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="邮箱" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="me@example.com"
            required
            autoComplete="email"
          />
        </AuthField>

        <AuthField label="昵称" htmlFor="displayName" hint="可选，用于界面显示">
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Me"
            autoComplete="nickname"
          />
        </AuthField>

        <AuthField label="密码" htmlFor="password" hint="至少 8 位">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </AuthField>

        <FormError message={error} className="pt-1" />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "注册中…" : "注册"}
        </Button>
      </form>
    </AuthShell>
  );
}
