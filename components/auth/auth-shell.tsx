import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AuthBrand() {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-2xl text-indigo-300 ring-1 ring-indigo-500/30">
        ✦
      </div>
      <p className="text-xs font-medium tracking-[0.2em] text-[var(--color-muted)] uppercase">
        Life Assistant
      </p>
    </div>
  );
}

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="auth-background" aria-hidden="true" />
      <div className="auth-background-overlay" aria-hidden="true" />

      <div className="animate-fade-in relative z-20 w-full max-w-md">
        <AuthBrand />

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {description}
            </p>
          )}
        </div>

        <AuthCard>{children}</AuthCard>

        {footer && <div className="mt-6 space-y-2 text-center">{footer}</div>}

        <p className="mt-8 text-center text-[10px] tracking-wide text-[var(--color-muted)]/60">
          背景图来自{" "}
          <a
            href="https://unsplash.com/photos/dark-background-with-abstract-purple-and-blue-light-8r4HuboCcaQ"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:text-[var(--color-muted)] hover:underline"
          >
            Unsplash
          </a>
        </p>
      </div>
    </div>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-card)_90%,transparent)] px-6 py-7 shadow-xl shadow-black/25 backdrop-blur-md sm:px-8 sm:py-8">
      <div className="auth-threshold mb-7" aria-hidden="true" />
      {children}
    </div>
  );
}

export function AuthField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-xs font-medium tracking-wide text-[var(--color-muted)]"
      >
        {label}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-muted)]/80">
          {hint}
        </p>
      )}
    </div>
  );
}

export function AuthFooterText({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm text-[var(--color-muted)]">{children}</p>
  );
}

export function AuthLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-indigo-400 transition hover:text-indigo-300",
        className,
      )}
    >
      {children}
    </Link>
  );
}
