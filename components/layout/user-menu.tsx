"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, SlidersHorizontal, UserRound } from "lucide-react";
import { UserAvatar } from "@/components/user/user-avatar";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    avatarKey: string | null;
    updatedAt: Date | string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const displayName = user.displayName ?? user.email.split("@")[0];

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5 transition",
          "hover:bg-[var(--color-card)]",
          open && "bg-[var(--color-card)]",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserAvatar user={user} size="sm" />
        <span className="hidden max-w-[120px] truncate text-sm text-[var(--color-muted)] sm:inline">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "hidden h-4 w-4 text-[var(--color-muted)] transition sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] py-1 shadow-xl shadow-black/30"
        >
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-[var(--color-muted)]">
              {user.email}
            </p>
          </div>

          <Link
            href="/settings/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-foreground)] transition hover:bg-[var(--color-card-hover)]"
          >
            <UserRound className="h-4 w-4 text-[var(--color-muted)]" />
            个人资料
          </Link>

          <Link
            href="/settings/project"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--color-foreground)] transition hover:bg-[var(--color-card-hover)]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[var(--color-muted)]" />
            项目配置
          </Link>

          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition hover:bg-[var(--color-card-hover)]"
          >
            <LogOut className="h-4 w-4" />
            登出
          </button>
        </div>
      )}
    </div>
  );
}
