import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getTodayBundle } from "@/lib/services/today";
import { buildReviewDraft } from "@/lib/services/review";
import { formatDate, toDateInputValue } from "@/lib/utils";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/components/ui/card";
import { PageShell } from "@/components/layout/page-shell";
import { MarkdownPreview } from "@/components/ui/markdown-preview";
import { DiaryQuickCreate } from "@/components/today/diary-quick-create";
import { TodoQuickCreate } from "@/components/today/todo-quick-create";
import { TodoTodayItem } from "@/components/today/todo-today-item";
import { PenLine } from "lucide-react";

export default async function TodayPage() {
  const session = await requireSession();
  const bundle = await getTodayBundle(session.id);
  const draft = await buildReviewDraft(session.id, bundle.date);
  const dateValue = toDateInputValue(bundle.date);
  const reviewHref = draft.existingReview
    ? `/reviews/${draft.existingReview.id}`
    : `/reviews/new?date=${dateValue}`;
  const reviewActionLabel = draft.existingReview ? "查看复盘" : "去复盘";
  const reviewDescription = draft.existingReview
    ? "今日复盘已创建，点击查看或编辑"
    : "对照今日待办与日记，写一段复盘";

  return (
    <PageShell title="今日" description={formatDate(bundle.date)}>
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="今日完成" value={String(bundle.stats.completedToday)} />
        <StatCard label="待办总数" value={String(bundle.stats.totalToday)} />
        <StatCard
          label="完成率"
          value={`${bundle.stats.completionRate}%`}
          accent
        />
      </div>

      <Card size="sm">
        <CardContent className="pt-0">
          <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">
            快速添加待办
          </p>
          <TodoQuickCreate defaultDueDate={dateValue} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>今日截止</CardTitle>
              <CardAction>
                <Link
                  href="/todos?filter=today"
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  查看全部 →
                </Link>
              </CardAction>
            </CardHeader>

            {bundle.todayDueTodos.length === 0 ? (
              <EmptyState
                title="今日暂无截止待办"
                description="用上方输入框快速添加"
              />
            ) : (
              <CardContent className="space-y-2 pt-0">
                <ul className="space-y-2">
                  {bundle.todayDueTodos.map((todo) => (
                    <TodoTodayItem key={todo.id} todo={todo} />
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>

          <Card hover className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 px-4 sm:px-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400">
                <PenLine className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {draft.existingReview ? "今日复盘" : "创建今日复盘"}
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {reviewDescription}
                </p>
              </div>
            </div>
            <div className="px-4 pb-4 sm:p-0">
              <Link
                href={reviewHref}
                className="inline-flex h-8 w-full items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-4 text-sm font-medium transition hover:bg-[var(--color-card-hover)] sm:w-auto"
              >
                {reviewActionLabel}
              </Link>
            </div>
          </Card>

          {bundle.overdueTodos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-amber-400">历史未完成</CardTitle>
                <CardAction>
                  <span className="text-xs text-amber-400/80">
                    {bundle.overdueCount} 项
                  </span>
                </CardAction>
              </CardHeader>

              <CardContent className="space-y-2 pt-0">
                <ul className="space-y-2">
                  {bundle.overdueTodos.map((todo) => (
                    <TodoTodayItem
                      key={todo.id}
                      todo={todo}
                      showCompletionNote
                    />
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>今日日记</CardTitle>
            <CardAction>
              <Link
                href="/diary/new"
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                完整编辑 →
              </Link>
            </CardAction>
          </CardHeader>

          <CardContent className="border-b border-[var(--color-border)] pb-4">
            <p className="mb-2 text-xs font-medium text-[var(--color-muted)]">
              快速写日记
            </p>
            <DiaryQuickCreate defaultDate={dateValue} />
          </CardContent>

          {bundle.diaryEntries.length === 0 ? (
            <EmptyState
              title="今日还没有日记"
              description="记录今天的学习、生活与想法"
            />
          ) : (
            <CardContent className="space-y-3 pt-0">
              <ul className="space-y-3">
                {bundle.diaryEntries.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={`/diary/${entry.id}`}
                      className="group block rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-3 transition hover:border-indigo-500/20 hover:bg-[var(--color-card-hover)]"
                    >
                      {entry.title && (
                        <p className="mb-1 text-sm font-medium group-hover:text-indigo-400">
                          {entry.title}
                        </p>
                      )}
                      <MarkdownPreview content={entry.content} />
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      </div>
    </PageShell>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <Card size="sm">
      <CardContent className="pt-0">
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
        <p
          className={`mt-1 text-2xl font-semibold ${accent ? "text-indigo-400" : ""}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
