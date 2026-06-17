"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const SETTINGS_TABS = [
  { href: "/settings/profile", label: "个人资料" },
  { href: "/settings/project", label: "项目配置" },
] as const;

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="设置分区"
      className="inline-flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/50 p-1"
    >
      {SETTINGS_TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-4 py-2 text-sm transition",
              active
                ? "bg-indigo-600/20 font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30"
                : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SettingsPageLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-2xl space-y-6">{children}</div>;
}

export function SettingsManagerItem({
  accentClassName = "bg-indigo-400/50",
  accentStyle,
  isDragging = false,
  children,
  className,
}: {
  accentClassName?: string;
  accentStyle?: React.CSSProperties;
  isDragging?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group/item relative flex flex-col gap-3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/50 px-3 py-3 sm:flex-row sm:items-center",
        isDragging && "border-indigo-500/40 shadow-lg ring-2 ring-indigo-500/20",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-0.5",
          !accentStyle && accentClassName,
        )}
        style={accentStyle}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

export function SettingsFieldHint({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-[var(--color-muted)]">{children}</p>
  );
}
