export function effectiveMinutes(
  estimated: number | null | undefined,
  actual: number | null | undefined,
): number {
  return actual ?? estimated ?? 0;
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

export function formatDurationPair(
  actual: number | null | undefined,
  estimated: number | null | undefined,
): string {
  const effective = effectiveMinutes(estimated, actual);
  if (effective <= 0) return "";
  if (actual && estimated && actual !== estimated) {
    return `${formatMinutes(actual)} / 预估 ${formatMinutes(estimated)}`;
  }
  return formatMinutes(effective);
}

export const MAX_DURATION_MINUTES = 10_080;

export function splitDurationMinutes(total: number | null | undefined) {
  const safe = Math.max(0, Math.floor(total ?? 0));
  return {
    hours: Math.floor(safe / 60),
    minutes: safe % 60,
  };
}

export function combineDurationMinutes(hours: number, minutes: number) {
  const safeHours = Math.max(0, Math.floor(Number.isFinite(hours) ? hours : 0));
  const safeMinutes = Math.max(
    0,
    Math.min(59, Math.floor(Number.isFinite(minutes) ? minutes : 0)),
  );
  return safeHours * 60 + safeMinutes;
}
