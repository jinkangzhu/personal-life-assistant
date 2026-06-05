"use client";

import { useMemo, useState } from "react";
import type { Tag } from "@prisma/client";
import { cn } from "@/lib/utils";
import { parseTagNames } from "@/lib/validators/tag";
import { TagBadge } from "./tag-badge";

interface TagSelectorProps {
  name?: string;
  tags?: Tag[];
  defaultValue?: string;
  className?: string;
}

function parseInitialSelected(value: string): string[] {
  return parseTagNames(value);
}

export function TagSelector({
  name = "tags",
  tags = [],
  defaultValue = "",
  className,
}: TagSelectorProps) {
  const [selected, setSelected] = useState<string[]>(() =>
    parseInitialSelected(defaultValue),
  );
  const [customInput, setCustomInput] = useState("");

  const selectedKeys = useMemo(
    () => new Set(selected.map((item) => item.toLowerCase())),
    [selected],
  );

  const availableTags = tags.filter(
    (tag) => !selectedKeys.has(tag.name.toLowerCase()),
  );

  function toggleTag(tagName: string) {
    const key = tagName.toLowerCase();
    setSelected((current) => {
      const exists = current.some((item) => item.toLowerCase() === key);
      if (exists) {
        return current.filter((item) => item.toLowerCase() !== key);
      }
      return [...current, tagName];
    });
  }

  function addCustomTags() {
    const additions = parseTagNames(customInput);
    if (additions.length === 0) return;

    setSelected((current) => {
      const keys = new Set(current.map((item) => item.toLowerCase()));
      const next = [...current];
      for (const addition of additions) {
        const key = addition.toLowerCase();
        if (!keys.has(key)) {
          keys.add(key);
          next.push(addition);
        }
      }
      return next;
    });
    setCustomInput("");
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input type="hidden" name={name} value={selected.join(", ")} />

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tagName) => {
            const tag = tags.find(
              (item) => item.name.toLowerCase() === tagName.toLowerCase(),
            );
            return (
              <button
                key={tagName}
                type="button"
                onClick={() => toggleTag(tagName)}
                className="group"
                title="点击移除"
              >
                <TagBadge
                  tag={tag ?? { name: tagName, color: null }}
                  className="ring-2 ring-indigo-500/40"
                />
              </button>
            );
          })}
        </div>
      )}

      {availableTags.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-[var(--color-muted)]">从已有标签选择</p>
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className="transition hover:opacity-80"
              >
                <TagBadge tag={tag} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-xs text-[var(--color-muted)]">或输入新标签</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(event) => setCustomInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomTags();
              }
            }}
            placeholder="输入标签，逗号分隔"
            className="flex-1 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          />
          <button
            type="button"
            onClick={addCustomTags}
            className="shrink-0 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-muted)] transition hover:bg-[var(--color-card-hover)] hover:text-indigo-400"
          >
            添加
          </button>
        </div>
      </div>

      <p className="text-xs text-[var(--color-muted)]">
        标签可在日记、笔记等模块间复用
      </p>
    </div>
  );
}
