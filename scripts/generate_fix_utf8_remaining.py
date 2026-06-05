import json
from pathlib import Path

root = Path(r"d:\Develop\Code\personal-life-assistant")
out_script = root / "scripts" / "fix-utf8-remaining.mjs"

# Unicode escapes for Chinese (ASCII-only source in generated .mjs via json.dumps)

def u(*codes):
    return "".join(chr(c) for c in codes)

# Build TSX with unicode escapes only in the generator output - we use json.dumps which will emit \u for non-ascii if ensure_ascii=True

DIARY = r'''"use client";
import { FormError } from "@/components/ui/form-error";

import { useState, useTransition } from "react";
import { updateDiary } from "@/app/(main)/diary/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { MarkdownField } from "@/components/diary/markdown-field";
import { MoodSelect } from "@/components/diary/mood-select";
import { TagSelector } from "@/components/tags/tag-selector";
import type { DiaryWithTags } from "@/lib/services/diary";
import { tagsToInputValue } from "@/lib/services/tag";
import type { Tag } from "@prisma/client";
import { toDateInputValue } from "@/lib/utils";

export function DiaryEditForm({
  entry,
  tags = [],
  onCancel,
  onSaved,
}: {
  entry: DiaryWithTags;
  tags?: Tag[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateDiary(entry.id, formData);
      if (result.ok) {
        setError("");
        onSaved();
        return;
      }
      setError(result.error ?? "\u4fdd\u5b58\u5931\u8d25");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-[var(--color-muted)]">
          \u6807\u9898
        </label>
        <Input
          id="title"
          name="title"
          defaultValue={entry.title ?? ""}
          placeholder="\u53ef\u9009\u6807\u9898"
          maxLength={200}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          \u65e5\u671f
        </label>
        <DatePicker
          name="date"
          defaultValue={toDateInputValue(entry.date)}
          allowClear={false}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          \u5fc3\u60c5
        </label>
        <MoodSelect defaultValue={entry.mood} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          \u6b63\u6587\uff08Markdown\uff09
        </label>
        <MarkdownField defaultValue={entry.content} rows={12} />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-[var(--color-muted)]">
          \u6807\u7b7e
        </label>
        <TagSelector
          tags={tags}
          defaultValue={tagsToInputValue(entry.tags)}
        />
      </div>

      <FormError message={error} />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "\u4fdd\u5b58\u4e2d\u2026" : "\u4fdd\u5b58"}
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          \u53d6\u6d88
        </Button>
      </div>
    </form>
  );
}
'''

# Use ascii escapes in python raw strings - the \u in DIARY are literal backslash-u in file until decoded
# Actually in raw string \u6807 is literal \u6807 not unicode. Good for TSX output when written.

GOAL_CREATE = DIARY  # placeholder - will replace in next append
