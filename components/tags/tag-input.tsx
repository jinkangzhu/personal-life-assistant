"use client";

import { cn } from "@/lib/utils";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

interface TagInputProps {
  name?: string;
  defaultValue?: string;
  suggestions?: string[];
  className?: string;
}

export function TagInput({
  name = "tags",
  defaultValue = "",
  suggestions = [],
  className,
}: TagInputProps) {
  const unusedSuggestions = suggestions.filter(
    (name) => !defaultValue.toLowerCase().includes(name.toLowerCase()),
  );

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder="输入标签，用逗号分隔，如：学习, Vue"
        className={textareaClassName}
      />
      {unusedSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unusedSuggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="rounded-md bg-[var(--color-card-hover)] px-2 py-0.5 text-xs text-[var(--color-muted)] transition hover:bg-indigo-600/15 hover:text-indigo-400"
              onClick={(event) => {
                const input = event.currentTarget
                  .closest("div")
                  ?.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
                if (!input) return;

                const current = input.value.trim();
                input.value = current ? `${current}, ${suggestion}` : suggestion;
                input.dispatchEvent(new Event("input", { bubbles: true }));
              }}
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-[var(--color-muted)]">标签可在日记、笔记等模块间复用</p>
    </div>
  );
}
