import type { Tag } from "@prisma/client";
import { cn } from "@/lib/utils";

export function TagBadge({
  tag,
  className,
}: {
  tag: Pick<Tag, "name" | "color">;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-indigo-600/15 px-2 py-0.5 text-xs text-indigo-300 ring-1 ring-indigo-500/20",
        className,
      )}
      style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : undefined}
    >
      {tag.name}
    </span>
  );
}
