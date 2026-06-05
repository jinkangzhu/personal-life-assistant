import { RecurrenceType } from "@prisma/client";
import { addDays, getDaysInMonth, startOfDay } from "@/lib/utils";

export type RecurringSchedule = {
  recurrenceType: RecurrenceType;
  weeklyDays: number[] | null;
  monthlyDay: number | null;
  startDate: Date | null;
  endDate: Date | null;
  active: boolean;
  deletedAt: Date | null;
};

export function parseWeeklyDays(value: string | null | undefined): number[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (day): day is number =>
        typeof day === "number" && Number.isInteger(day) && day >= 0 && day <= 6,
    );
  } catch {
    return [];
  }
}

export function serializeWeeklyDays(days: number[]) {
  return JSON.stringify([...new Set(days)].sort((a, b) => a - b));
}

export function getEffectiveMonthlyDay(
  year: number,
  month: number,
  monthlyDay: number,
) {
  const daysInMonth = getDaysInMonth(year, month);
  return Math.min(monthlyDay, daysInMonth);
}

export function recurringTodoAppliesOnDate(
  schedule: RecurringSchedule,
  date: Date,
): boolean {
  if (schedule.deletedAt || !schedule.active) return false;

  const day = startOfDay(date);
  const start = schedule.startDate ? startOfDay(schedule.startDate) : null;
  const end = schedule.endDate ? startOfDay(schedule.endDate) : null;

  if (start && day < start) return false;
  if (end && day > end) return false;

  switch (schedule.recurrenceType) {
    case RecurrenceType.DAILY:
      return true;
    case RecurrenceType.WEEKLY: {
      const days = schedule.weeklyDays ?? [];
      return days.includes(day.getDay());
    }
    case RecurrenceType.MONTHLY: {
      if (!schedule.monthlyDay) return false;
      const effective = getEffectiveMonthlyDay(
        day.getFullYear(),
        day.getMonth() + 1,
        schedule.monthlyDay,
      );
      return day.getDate() === effective;
    }
    default:
      return false;
  }
}

export function eachDateInRange(start: Date, end: Date) {
  const dates: Date[] = [];
  let cursor = startOfDay(start);
  const last = startOfDay(end);
  while (cursor <= last) {
    dates.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

export function formatRecurrenceLabel(schedule: {
  recurrenceType: RecurrenceType;
  weeklyDays: number[] | null;
  monthlyDay: number | null;
}) {
  switch (schedule.recurrenceType) {
    case RecurrenceType.DAILY:
      return "每天";
    case RecurrenceType.WEEKLY: {
      const days = schedule.weeklyDays ?? [];
      if (days.length === 0) return "每周";
      const labels = [...days]
        .sort((a, b) => a - b)
        .map((day) => `周${["日", "一", "二", "三", "四", "五", "六"][day]}`);
      return labels.join("、");
    }
    case RecurrenceType.MONTHLY:
      return schedule.monthlyDay ? `每月 ${schedule.monthlyDay} 号` : "每月";
    default:
      return "";
  }
}
