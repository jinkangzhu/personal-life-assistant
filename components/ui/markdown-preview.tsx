import { MarkdownContent } from "@/components/ui/markdown-content";
import { cn } from "@/lib/utils";

export function MarkdownPreview({
  content,
  maxHeight = "5.5rem",
  className,
  contentClassName,
}: {
  content: string;
  maxHeight?: string;
  className?: string;
  contentClassName?: string;
}) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-[var(--color-muted)]">（空）</p>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ maxHeight }}
    >
      <MarkdownContent
        content={content}
        className={cn(
          "text-[var(--color-muted)] [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm [&_p]:text-sm",
          contentClassName,
        )}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[var(--color-card)] to-transparent group-hover:from-[var(--color-card-hover)]" />
    </div>
  );
}
