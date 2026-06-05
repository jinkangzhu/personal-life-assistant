"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />
      </div>

      <div className="animate-fade-in relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-2xl ring-1 ring-indigo-500/30">
            ✦
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Personal Life Assistant
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            个人笔记 · 日记 · 待办
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-8 shadow-xl shadow-black/20"
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-[var(--color-muted)]">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="me@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-[var(--color-muted)]">
                密码
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}

          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading ? "登录中…" : "登录"}
          </Button>

          <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
            <Link
              href="/reset-password"
              className="text-indigo-400 hover:text-indigo-300"
            >
              忘记密码？
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-[var(--color-muted)]">
            还没有账号？{" "}
            <Link
              href="/register"
              className="text-indigo-400 hover:text-indigo-300"
            >
              注册
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
