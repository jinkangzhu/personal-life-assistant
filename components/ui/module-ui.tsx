import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ModuleKind =
  | "goal"
  | "plan"
  | "todo"
  | "diary"
  | "note"
  | "review"
  | "today"
  | "profile"
  | "settings";

export const moduleStaticAccentBar: Record<ModuleKind, string> = {
  goal: "bg-indigo-500/70",
  plan: "bg-cyan-500/65",
  todo: "bg-violet-500/70",
  diary: "bg-rose-400/55",
  note: "bg-violet-400/55",
  review: "bg-indigo-400/50",
  today: "bg-amber-400/60",
  profile: "bg-rose-400/55",
  settings: "bg-slate-400/50",
};

export const moduleTextareaClassName =
  "w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]/50 px-3 py-2.5 text-sm leading-relaxed outline-none transition placeholder:text-[var(--color-muted)] focus-visible:border-indigo-500/40 focus-visible:ring-2 focus-visible:ring-indigo-500/15 dark:bg-[var(--color-card)]/30";

export function ModuleAccent({
  module,
  className,
}: {
  module: ModuleKind;
  className?: string;
}) {
  return (
    <div
      className={cn("module-accent", `module-accent--${module}`, className)}
      aria-hidden="true"
    />
  );
}

export function ModuleFormLabel({
  htmlFor,
  children,
  className,
}: {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-2 block text-xs font-medium tracking-wide text-[var(--color-muted)]",
        className,
      )}
    >
      {children}
    </label>
  );
}

export function ModuleTitleInput({
  className,
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      data-slot="module-title-input"
      className={cn("module-title-input", className)}
      {...props}
    />
  );
}

export function ModuleFormSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "space-y-6 border-t border-[var(--color-border)]/70 pt-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModuleFormActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-t border-[var(--color-border)]/70 pt-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModuleEmptyState({
  module,
  title,
  description,
  action,
  className,
}: {
  module: ModuleKind;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-[var(--color-border)] px-6 py-12 text-center",
        className,
      )}
    >
      <ModuleAccent module={module} className="mx-auto mb-8 max-w-xs" />
      <p className="text-sm font-medium text-[var(--color-foreground)]">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function ModuleFormShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("max-w-2xl", className)}>{children}</div>;
}

export function ModulePanel({
  module,
  accentClassName,
  children,
  className,
  padding = "default",
}: {
  module: ModuleKind;
  accentClassName?: string;
  children: ReactNode;
  className?: string;
  padding?: "default" | "none";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-0.5",
          accentClassName ?? moduleStaticAccentBar[module],
        )}
        aria-hidden="true"
      />
      <div className={cn(padding === "default" && "px-5 py-5 pl-6")}>{children}</div>
    </div>
  );
}

export function ModuleSectionPanel({
  module,
  title,
  description,
  action,
  children,
  accentClassName,
  className,
}: {
  module: ModuleKind;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  accentClassName?: string;
  className?: string;
}) {
  return (
    <ModulePanel
      module={module}
      accentClassName={accentClassName}
      padding="none"
      className={className}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border)]/70 px-5 py-4 pl-6">
        <div className="min-w-0">
          <h2 className="text-sm font-medium tracking-tight text-[var(--color-foreground)]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="px-5 py-4 pl-6">{children}</div>
    </ModulePanel>
  );
}

export function ModuleMetaRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--color-muted)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModuleMetaDivider() {
  return (
    <span className="hidden text-[var(--color-border)] sm:inline" aria-hidden="true">
      ·
    </span>
  );
}

export function ModuleProse({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-foreground)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function ModuleFieldGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</dl>
  );
}

export function ModuleField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium tracking-wide text-[var(--color-muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-[var(--color-foreground)]">{value}</dd>
    </div>
  );
}

export function ModuleInlineEmpty({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-[var(--color-border)]/80 px-4 py-8 text-center",
        className,
      )}
    >
      <p className="text-sm text-[var(--color-muted)]">{title}</p>
      {description && (
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]/80">
          {description}
        </p>
      )}
    </div>
  );
}

export function ModuleLinkAction({
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
        "text-xs text-indigo-400 transition hover:text-indigo-300",
        className,
      )}
    >
      {children}
    </Link>
  );
}
