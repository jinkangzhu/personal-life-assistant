import { cn } from "@/lib/utils";

export function RecurrenceBadge({
  label,
  paused,
  deleted,
  className,
}: {
  label: string;
  paused?: boolean;
  deleted?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] ring-1 ring-inset",
        deleted
          ? "bg-zinc-500/15 text-zinc-300 ring-zinc-500/25"
          : paused
            ? "bg-amber-500/15 text-amber-300 ring-amber-500/25"
            : "bg-indigo-500/15 text-indigo-300 ring-indigo-500/25",
        className,
      )}
    >
      {deleted ? "已删除" : paused ? "已暂停" : label}
    </span>
  );
}
