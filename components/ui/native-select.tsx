import * as React from "react";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-8 min-w-0 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] px-2 text-sm text-[var(--color-foreground)] outline-none transition focus-visible:border-indigo-500/50 focus-visible:ring-2 focus-visible:ring-indigo-500/20";

interface NativeSelectProps extends React.ComponentProps<"select"> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function NativeSelect({
  options,
  placeholder,
  className,
  ...props
}: NativeSelectProps) {
  return (
    <select
      {...props}
      className={cn(selectClassName, className)}
      style={{ colorScheme: "dark" }}
    >
      {placeholder && (
        <option value="" className="bg-[var(--color-card)] text-[var(--color-foreground)]">
          {placeholder}
        </option>
      )}
      {options.map(({ value, label }) => (
        <option
          key={value}
          value={value}
          className="bg-[var(--color-card)] text-[var(--color-foreground)]"
        >
          {label}
        </option>
      ))}
    </select>
  );
}
