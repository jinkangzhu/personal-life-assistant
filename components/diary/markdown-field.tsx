"use client";

import { useState } from "react";
import { MarkdownContent } from "@/components/ui/markdown-content";
import { cn } from "@/lib/utils";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

interface MarkdownFieldProps {
  name?: string;
  defaultValue?: string;
  rows?: number;
  placeholder?: string;
  className?: string;
}

export function MarkdownField({
  name = "content",
  defaultValue = "",
  rows = 8,
  placeholder = "支持 Markdown，如 **粗体**、列表、链接等",
  className,
}: MarkdownFieldProps) {
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("edit")}
          className={cn(
            "rounded-md px-3 py-1 text-xs transition",
            tab === "edit"
              ? "bg-indigo-600/20 text-indigo-300"
              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
          )}
        >
          编辑
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={cn(
            "rounded-md px-3 py-1 text-xs transition",
            tab === "preview"
              ? "bg-indigo-600/20 text-indigo-300"
              : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
          )}
        >
          预览
        </button>
      </div>

      {tab === "edit" ? (
        <textarea
          id={name}
          rows={rows}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className={textareaClassName}
        />
      ) : (
        <div className="min-h-[12rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
          <MarkdownContent content={value} />
        </div>
      )}
    </div>
  );
}
