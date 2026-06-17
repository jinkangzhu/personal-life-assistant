import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getTodayBundle } from "@/lib/services/today";
import { getSmokingStats } from "@/lib/services/smoking";
import { formatMinutes } from "@/lib/duration";
import { buildReviewDraft } from "@/lib/services/review";
import { formatDate, toDateInputValue } from "@/lib/utils";
import { ModuleLinkAction, ModulePanel } from "@/components/ui/module-ui";
import { PageShell } from "@/components/layout/page-shell";
import { MarkdownPreview } from "@/components/ui/markdown-preview";
import { DiaryQuickCreate } from "@/components/today/diary-quick-create";
import { SmokingTracker } from "@/components/today/smoking-tracker";
import { TodoQuickCreate } from "@/components/today/todo-quick-create";
import { TodoTodayItem } from "@/components/today/todo-today-item";
import { TodayOverview } from "@/components/today/today-overview";
import { TodaySection } from "@/components/today/today-section";
import { PenLine } from "lucide-react";

export default async function TodayPage() {
  const session = await requireSession();
  const [bundle, smokingStats] = await Promise.all([
    getTodayBundle(session.id),
    getSmokingStats(session.id),
  ]);
  const draft = await buildReviewDraft(session.id, bundle.date);
  const dateValue = toDateInputValue(bundle.date);
  const reviewHref = draft.existingReview
    ? `/reviews/${draft.existingReview.id}`
    : `/reviews/new?date=${dateValue}`;
  const reviewActionLabel = draft.existingReview ? "查看复盘" : "去复盘";
  const reviewDescription = draft.existingReview
    ? "今日复盘已保存，点击查看或继续编辑"
    : "对照今日待办与日记，写一段简短复盘";

  return (
    <PageShell
      title="今日"
      description="聚焦今天该完成的事，随手记录想法"
    >
      <div className="space-y-6">
        <p className="text-sm text-[var(--color-muted)]">{formatDate(bundle.date)}</p>

        <TodayOverview
          completed={bundle.stats.completedToday}
          total={bundle.stats.totalToday}
          completionRate={bundle.stats.completionRate}
        />

        <SmokingTracker stats={smokingStats} dateValue={dateValue} />

        {(bundle.timeStats.totalMinutes > 0 ||
          bundle.timeStats.estimatedRemainingMinutes > 0) && (
          <ModulePanel module="today" className="!py-4">
            <p className="mb-3 text-xs font-medium tracking-wide text-[var(--color-muted)]">
              今日时长
            </p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p className="font-mono text-xl font-semibold tabular-nums text-indigo-300">
                {formatMinutes(bundle.timeStats.totalMinutes) || "0m"}
              </p>
              {bundle.timeStats.byActivity.map((item) => (
                <span
                  key={item.activityTypeId ?? "uncategorized"}
                  className="text-sm text-[var(--color-muted)]"
                >
                  {item.name} {formatMinutes(item.minutes)}
                </span>
              ))}
            </div>
            {bundle.timeStats.estimatedRemainingMinutes > 0 && (
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                剩余预估 {formatMinutes(bundle.timeStats.estimatedRemainingMinutes)}
              </p>
            )}
          </ModulePanel>
        )}

        <ModulePanel module="todo" className="!py-4">
          <p className="mb-3 text-xs font-medium tracking-wide text-[var(--color-muted)]">
            快速添加待办
          </p>
          <TodoQuickCreate defaultDueDate={dateValue} />
        </ModulePanel>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <TodaySection
              module="todo"
              title="今日截止"
              action={
                <ModuleLinkAction href="/todos?filter=today">
                  查看全部 →
                </ModuleLinkAction>
              }
            >
              {bundle.todayDueTodos.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  今日暂无截止待办，用上方输入框快速添加
                </p>
              ) : (
                <ul className="space-y-2">
                  {bundle.todayDueTodos.map((todo) => (
                    <TodoTodayItem key={todo.id} todo={todo} />
                  ))}
                </ul>
              )}
            </TodaySection>

            <ModulePanel module="review" className="!py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400">
                    <PenLine className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {draft.existingReview ? "今日复盘" : "写今日复盘"}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted)]">
                      {reviewDescription}
                    </p>
                  </div>
                </div>
                <Link
                  href={reviewHref}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-[var(--color-border)] px-4 text-sm font-medium transition hover:bg-[var(--color-card-hover)] sm:shrink-0"
                >
                  {reviewActionLabel}
                </Link>
              </div>
            </ModulePanel>

            {bundle.overdueTodos.length > 0 && (
              <TodaySection
                module="todo"
                title="历史未完成"
                description={`${bundle.overdueCount} 项待处理`}
                tone="warning"
              >
                <ul className="space-y-2">
                  {bundle.overdueTodos.map((todo) => (
                    <TodoTodayItem
                      key={todo.id}
                      todo={todo}
                      showCompletionNote
                    />
                  ))}
                </ul>
              </TodaySection>
            )}
          </div>

          <TodaySection
            module="diary"
            title="今日日记"
            action={
              <ModuleLinkAction href="/diary/new">完整编辑 →</ModuleLinkAction>
            }
          >
            <div className="mb-5 border-b border-[var(--color-border)]/70 pb-5">
              <p className="mb-2 text-xs font-medium tracking-wide text-[var(--color-muted)]">
                快速记录
              </p>
              <DiaryQuickCreate defaultDate={dateValue} />
            </div>

            {bundle.diaryEntries.length === 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                今天还没有日记，用上方框随手记几句
              </p>
            ) : (
              <ul className="space-y-2.5">
                {bundle.diaryEntries.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={`/diary/${entry.id}`}
                      className="group relative block overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]/50 p-3.5 pl-4 transition hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]"
                    >
                      <div
                        className="absolute inset-y-0 left-0 w-0.5 bg-rose-400/55"
                        aria-hidden="true"
                      />
                      {entry.title && (
                        <p className="mb-1 text-sm font-medium leading-snug group-hover:text-indigo-300">
                          {entry.title}
                        </p>
                      )}
                      <MarkdownPreview content={entry.content} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </TodaySection>
        </div>
      </div>
    </PageShell>
  );
}
