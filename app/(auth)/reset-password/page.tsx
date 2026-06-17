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

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetSecret, setResetSecret] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, resetSecret }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "重置失败");
        return;
      }

      router.push("/login");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="重置密码"
      description="输入注册邮箱、新密码及管理员提供的重置密钥"
      footer={
        <AuthFooterText>
          <AuthLink href="/login">返回登录</AuthLink>
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

        <AuthField label="新密码" htmlFor="password" hint="至少 8 位">
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

        <AuthField
          label="重置密钥"
          htmlFor="resetSecret"
          hint="由系统管理员提供，用于验证重置请求"
        >
          <Input
            id="resetSecret"
            type="password"
            value={resetSecret}
            onChange={(e) => setResetSecret(e.target.value)}
            placeholder="请输入重置密钥"
            required
            autoComplete="off"
          />
        </AuthField>

        <FormError message={error} className="pt-1" />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "重置中…" : "重置密码"}
        </Button>
      </form>
    </AuthShell>
  );
}
