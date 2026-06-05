import { Priority } from "@prisma/client";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/lib/validators/todo";

const styles: Record<Priority, string> = {
  LOW: "bg-zinc-500/15 text-zinc-400 ring-zinc-500/20",
  MEDIUM: "bg-indigo-500/15 text-indigo-400 ring-indigo-500/20",
  HIGH: "bg-amber-500/15 text-amber-400 ring-amber-500/20",
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-xs ring-1 ring-inset",
        styles[priority],
        className,
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
