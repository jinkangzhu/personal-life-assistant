"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { isNavActive, searchNavItem } from "@/lib/navigation";

export function SearchNavLink() {
  const pathname = usePathname();
  const active = isNavActive(pathname, searchNavItem.href);
  const Icon = searchNavItem.icon;

  return (
    <Link
      href={searchNavItem.href}
      aria-label={searchNavItem.label}
      title={searchNavItem.label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg transition",
        active
          ? "bg-indigo-600/15 text-indigo-400"
          : "text-[var(--color-muted)] hover:bg-[var(--color-card)] hover:text-[var(--color-foreground)]",
      )}
    >
      <Icon className="h-4 w-4" />
    </Link>
  );
}
