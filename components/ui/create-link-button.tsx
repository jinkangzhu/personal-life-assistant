import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const createLinkButtonClassName =
  "inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-5 py-2.5 text-sm text-[var(--color-muted)] transition hover:border-indigo-500/25 hover:bg-[var(--color-card-hover)] hover:text-indigo-300";

export function CreateLinkButton({
  href,
  label,
  icon: Icon = Plus,
  className,
}: {
  href: string;
  label: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(createLinkButtonClassName, className)}>
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
