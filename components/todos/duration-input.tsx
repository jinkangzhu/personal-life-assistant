"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  combineDurationMinutes,
  MAX_DURATION_MINUTES,
  splitDurationMinutes,
} from "@/lib/duration";
import { cn } from "@/lib/utils";

interface DurationInputProps {
  name: string;
  id?: string;
  defaultValue?: number | null;
  className?: string;
}

export function DurationInput({
  name,
  id,
  defaultValue,
  className,
}: DurationInputProps) {
  const initial = splitDurationMinutes(defaultValue);
  const [hours, setHours] = useState(String(initial.hours || ""));
  const [minutes, setMinutes] = useState(
    String(defaultValue ? initial.minutes : ""),
  );

  const totalMinutes = useMemo(() => {
    const parsedHours = hours.trim() === "" ? 0 : Number(hours);
    const parsedMinutes = minutes.trim() === "" ? 0 : Number(minutes);
    if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes)) {
      return 0;
    }
    return combineDurationMinutes(parsedHours, parsedMinutes);
  }, [hours, minutes]);

  const hiddenValue = totalMinutes > 0 ? String(totalMinutes) : "";

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Input
            id={id}
            type="number"
            min={0}
            max={Math.floor(MAX_DURATION_MINUTES / 60)}
            step={1}
            inputMode="numeric"
            value={hours}
            onChange={(event) => setHours(event.target.value)}
            placeholder="0"
            className="pr-10"
            aria-label="小时"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[var(--color-muted)]">
            小时
          </span>
        </div>

        <div className="relative">
          <Input
            type="number"
            min={0}
            max={59}
            step={1}
            inputMode="numeric"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            placeholder="0"
            className="pr-10"
            aria-label="分钟"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-[var(--color-muted)]">
            分钟
          </span>
        </div>
      </div>

      <input type="hidden" name={name} value={hiddenValue} />
      <p className="text-xs text-[var(--color-muted)]">
        支持多小时任务，如 2 小时 30 分
      </p>
    </div>
  );
}
