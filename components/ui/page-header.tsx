import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "返回",
  className,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn(className)}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] transition hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      )}
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
      )}
    </div>
  );
}
