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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登录失败");
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
      title="登录"
      description="个人笔记 · 日记 · 待办"
      footer={
        <>
          <AuthFooterText>
            <AuthLink href="/reset-password">忘记密码？</AuthLink>
          </AuthFooterText>
          <AuthFooterText>
            还没有账号？ <AuthLink href="/register">注册</AuthLink>
          </AuthFooterText>
        </>
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

        <AuthField label="密码" htmlFor="password">
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </AuthField>

        <FormError message={error} className="pt-1" />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "登录中…" : "登录"}
        </Button>
      </form>
    </AuthShell>
  );
}
