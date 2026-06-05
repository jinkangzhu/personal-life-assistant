"use client";

import { useState } from "react";
import { Mood } from "@prisma/client";
import { cn } from "@/lib/utils";
import { MOOD_EMOJI, MOOD_LABELS } from "@/lib/validators/diary";

const MOODS = [
  Mood.HAPPY,
  Mood.CALM,
  Mood.ANXIOUS,
  Mood.TIRED,
  Mood.OTHER,
] as const;

interface MoodSelectProps {
  name?: string;
  defaultValue?: Mood | null;
  className?: string;
}

export function MoodSelect({
  name = "mood",
  defaultValue = null,
  className,
}: MoodSelectProps) {
  const [value, setValue] = useState<Mood | "">(defaultValue ?? "");

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={value} />
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setValue("")}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-sm transition",
            value === ""
              ? "border-indigo-500/40 bg-indigo-600/15 text-indigo-300"
              : "border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-card-hover)]",
          )}
        >
          不选
        </button>
        {MOODS.map((mood) => {
          const active = value === mood;
          return (
            <button
              key={mood}
              type="button"
              onClick={() => setValue(mood)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm transition",
                active
                  ? "border-indigo-500/40 bg-indigo-600/15 text-indigo-300"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-card-hover)]",
              )}
            >
              {MOOD_EMOJI[mood]} {MOOD_LABELS[mood]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
