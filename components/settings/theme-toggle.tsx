"use client";

import { useEffect, useState } from "react";
import {
  THEME_LABELS,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/lib/validators/settings";
import { cn } from "@/lib/utils";

function applyTheme(theme: ThemePreference) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function readStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>("dark");

  useEffect(() => {
    setTheme(readStoredTheme());
  }, []);

  function selectTheme(next: ThemePreference) {
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
    applyTheme(next);
  }

  return (
    <div className="space-y-2 px-4 pb-4">
      <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-1 w-fit">
        {(["dark", "light"] as const).map((option) => {
          const active = theme === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => selectTheme(option)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition",
                active
                  ? "bg-indigo-600/20 font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-card-hover)] hover:text-[var(--color-foreground)]",
              )}
            >
              {THEME_LABELS[option]}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-[var(--color-muted)]">
        主题偏好保存在本机浏览器中
      </p>
    </div>
  );
}
