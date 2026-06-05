import type { GoalPlanStats } from "@/lib/services/goal";

export function GoalPlanStatsSummary({ stats }: { stats: GoalPlanStats }) {
  if (stats.total === 0) {
    return <span className="text-xs text-[var(--color-muted)]">未关联计划</span>;
  }

  const parts: string[] = [`${stats.total} 个计划`];
  if (stats.active > 0) parts.push(`${stats.active} 进行中`);
  if (stats.completed > 0) parts.push(`${stats.completed} 已完成`);
  if (stats.archived > 0) parts.push(`${stats.archived} 已归档`);

  return (
    <span className="text-xs text-[var(--color-muted)]">{parts.join(" · ")}</span>
  );
}
