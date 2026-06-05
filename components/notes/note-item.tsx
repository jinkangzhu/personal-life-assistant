import Link from "next/link";
import { TagBadge } from "@/components/tags/tag-badge";
import { contentSummary, type NoteWithRelations } from "@/lib/services/note";
import { cn } from "@/lib/utils";

export function NoteItem({ note }: { note: NoteWithRelations }) {
  const summary = contentSummary(note.content);
  const updatedLabel = new Date(note.updatedAt).toLocaleString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li>
      <Link
        href={`/notes/${note.id}`}
        className={cn(
          "group block rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3 transition",
          "hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="text-sm font-medium group-hover:text-indigo-400">
            {note.title}
          </span>
          <span className="shrink-0 text-xs text-[var(--color-muted)]">
            {updatedLabel}
          </span>
        </div>

        {summary && (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">
            {summary}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {note.category && (
            <span className="rounded-md bg-[var(--color-card-hover)] px-2 py-0.5 text-xs text-[var(--color-muted)]">
              {note.category.name}
            </span>
          )}
          {note.tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
      </Link>
    </li>
  );
}
