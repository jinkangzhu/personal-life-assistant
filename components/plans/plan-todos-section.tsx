"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createPlanTodo,
  linkRecurringTodoToPlan,
  linkTodoToPlan,
  unlinkRecurringTodoFromPlan,
  unlinkTodoFromPlan,
} from "@/app/(main)/plans/actions";
import { PriorityBadge } from "@/components/todos/priority-badge";
import { RecurrenceBadge } from "@/components/todos/recurrence-badge";
import { RecurrenceFields, type RecurrenceFormValue } from "@/components/todos/recurrence-fields";
import { TodoCheckbox } from "@/components/todos/todo-checkbox";
import { formatRecurrenceLabel, parseWeeklyDays } from "@/lib/recurrence";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogBackdrop,
  DialogDescription,
  DialogFooter,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
} from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { PrioritySelect } from "@/components/ui/priority-select";
import type { PlanWithTodos } from "@/lib/services/plan";
import { cn, formatShortDate } from "@/lib/utils";
import type { RecurringTodo, Todo } from "@prisma/client";
import { TodoStatus } from "@prisma/client";

const textareaClassName =
  "w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function PlanTodosSection({
  plan,
  unlinkedTodos,
  unlinkedRecurringTodos,
}: {
  plan: PlanWithTodos;
  unlinkedTodos: Todo[];
  unlinkedRecurringTodos: RecurringTodo[];
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [createPending, startCreateTransition] = useTransition();
  const [linkPending, startLinkTransition] = useTransition();
  const [unlinkPending, startUnlinkTransition] = useTransition();
  const [createError, setCreateError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [selectedTodoId, setSelectedTodoId] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [unlinkTarget, setUnlinkTarget] = useState<
    { kind: "one_time"; id: string } | { kind: "recurring"; id: string } | null
  >(null);
  const [recurrence, setRecurrence] = useState<RecurrenceFormValue>("none");

  const linkOptions = [
    ...unlinkedTodos.map((todo) => ({
      value: `one_time:${todo.id}`,
      label: todo.title,
    })),
    ...unlinkedRecurringTodos.map((todo) => ({
      value: `recurring:${todo.id}`,
      label: `${todo.title}（循环）`,
    })),
  ];

  function handleCreateOpenChange(open: boolean) {
    setCreateOpen(open);
    if (!open) {
      setCreateError("");
      setRecurrence("none");
      setFormKey((key) => key + 1);
    }
  }

  function handleLinkOpenChange(open: boolean) {
    setLinkOpen(open);
    if (!open) {
      setLinkError("");
      setSelectedTodoId("");
    }
  }

  function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startCreateTransition(async () => {
      const result = await createPlanTodo(plan.id, formData);
      if (result.ok) {
        setCreateError("");
        setCreateOpen(false);
        setFormKey((key) => key + 1);
        router.refresh();
        return;
      }
      setCreateError(result.error ?? "创建失败");
    });
  }

  function handleLinkTodo() {
    if (!selectedTodoId) {
      setLinkError("请选择待办");
      return;
    }

    startLinkTransition(async () => {
      const colonIndex = selectedTodoId.indexOf(":");
      const kind = selectedTodoId.slice(0, colonIndex);
      const id = selectedTodoId.slice(colonIndex + 1);
      const result =
        kind === "recurring"
          ? await linkRecurringTodoToPlan(plan.id, id)
          : await linkTodoToPlan(plan.id, id);
      if (result.ok) {
        setLinkError("");
        setSelectedTodoId("");
        setLinkOpen(false);
        router.refresh();
        return;
      }
      setLinkError(result.error ?? "关联失败");
    });
  }

  function handleUnlinkOneTime(todoId: string) {
    setUnlinkTarget({ kind: "one_time", id: todoId });
  }

  function handleUnlinkRecurring(todoId: string) {
    setUnlinkTarget({ kind: "recurring", id: todoId });
  }

  function confirmUnlink() {
    if (!unlinkTarget) return;
    const target = unlinkTarget;
    setUnlinkTarget(null);

    startUnlinkTransition(async () => {
      if (target.kind === "recurring") {
        await unlinkRecurringTodoFromPlan(plan.id, target.id);
      } else {
        await unlinkTodoFromPlan(plan.id, target.id);
      }
      router.refresh();
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>关联待办</CardTitle>
          <CardAction>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCreateOpen(true)}
              >
                新增待办
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setLinkOpen(true)}
              >
                关联待办
              </Button>
            </div>
          </CardAction>
        </CardHeader>

        {plan.todos.length === 0 && plan.recurringTodos.length === 0 ? (
          <EmptyState
            title="还没有关联待办"
            description="点击「新增待办」创建并关联，或「关联待办」选择已有待办"
          />
        ) : (
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {plan.todos.map((todo) => {
                const completed = todo.status === TodoStatus.COMPLETED;
                return (
                  <li
                    key={todo.id}
                    className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3"
                  >
                    <TodoCheckbox
                      todo={{
                        kind: "one_time",
                        id: todo.id,
                        status: todo.status,
                      }}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/todos/${todo.id}`}
                          className={cn(
                            "text-sm font-medium hover:text-indigo-400",
                            completed &&
                              "text-[var(--color-muted)] line-through",
                          )}
                        >
                          {todo.title}
                        </Link>
                        <PriorityBadge priority={todo.priority} />
                      </div>
                      {todo.dueDate && (
                        <p className="mt-1 text-xs text-[var(--color-muted)]">
                          {formatShortDate(todo.dueDate)}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={unlinkPending}
                      onClick={() => handleUnlinkOneTime(todo.id)}
                      className="shrink-0 text-xs text-[var(--color-muted)] transition hover:text-red-400"
                    >
                      取消关联
                    </button>
                  </li>
                );
              })}
              {plan.recurringTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3"
                >
                  <span className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/todos/recurring/${todo.id}`}
                        className="text-sm font-medium hover:text-indigo-400"
                      >
                        {todo.title}
                      </Link>
                      <PriorityBadge priority={todo.priority} />
                      <RecurrenceBadge
                        label={formatRecurrenceLabel({
                          recurrenceType: todo.recurrenceType,
                          weeklyDays: parseWeeklyDays(todo.weeklyDays),
                          monthlyDay: todo.monthlyDay,
                        })}
                        paused={!todo.active}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={unlinkPending}
                    onClick={() => handleUnlinkRecurring(todo.id)}
                    className="shrink-0 text-xs text-[var(--color-muted)] transition hover:text-red-400"
                  >
                    取消关联
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        )}
      </Card>

      <Dialog open={createOpen} onOpenChange={handleCreateOpenChange}>
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <DialogPopup className="max-w-2xl">
              <DialogTitle>新增待办</DialogTitle>
              <DialogDescription>
                将自动关联到当前计划「{plan.title}」
              </DialogDescription>

              <form
                key={formKey}
                onSubmit={handleCreateSubmit}
                className="mt-5 space-y-4"
              >
                <div>
                  <label
                    htmlFor="plan-todo-title"
                    className="mb-1.5 block text-xs text-[var(--color-muted)]"
                  >
                    标题
                  </label>
                  <Input
                    id="plan-todo-title"
                    name="title"
                    placeholder="待办标题"
                    required
                    maxLength={200}
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    htmlFor="plan-todo-description"
                    className="mb-1.5 block text-xs text-[var(--color-muted)]"
                  >
                    描述（可选）
                  </label>
                  <textarea
                    id="plan-todo-description"
                    name="description"
                    rows={3}
                    placeholder="补充说明…"
                    className={textareaClassName}
                  />
                </div>

                <RecurrenceFields
                  key={`recurrence-${formKey}`}
                  onRecurrenceChange={setRecurrence}
                />

                <div
                  className={cn(
                    "grid gap-4",
                    recurrence === "none" ? "sm:grid-cols-2" : "sm:grid-cols-1",
                  )}
                >
                  {recurrence === "none" && (
                    <div>
                      <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
                        截止日期
                      </label>
                      <DatePicker key={`due-${formKey}`} name="dueDate" />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
                      优先级
                    </label>
                    <PrioritySelect key={`priority-${formKey}`} />
                  </div>
                </div>

                <FormError message={createError} />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={createPending}
                    onClick={() => handleCreateOpenChange(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={createPending}>
                    {createPending ? "创建中…" : "添加待办"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>

      <Dialog open={linkOpen} onOpenChange={handleLinkOpenChange}>
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <DialogPopup>
              <DialogTitle>关联待办</DialogTitle>
              <DialogDescription>
                从未关联计划的待办中选择一项，关联到「{plan.title}」
              </DialogDescription>

              {linkOptions.length === 0 ? (
                <p className="mt-5 text-sm text-[var(--color-muted)]">
                  暂无未关联的待办。你可以先在其他页面创建待办，或使用「新增待办」直接创建。
                </p>
              ) : (
                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="link-todo-select"
                      className="mb-1.5 block text-xs text-[var(--color-muted)]"
                    >
                      选择待办
                    </label>
                    <NativeSelect
                      id="link-todo-select"
                      value={selectedTodoId}
                      onChange={(event) => {
                        setSelectedTodoId(event.target.value);
                        setLinkError("");
                      }}
                      placeholder="选择未关联的待办"
                      className="w-full"
                      options={linkOptions}
                    />
                  </div>

                  <FormError message={linkError} />
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  disabled={linkPending}
                  onClick={() => handleLinkOpenChange(false)}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  disabled={linkPending || linkOptions.length === 0}
                  onClick={handleLinkTodo}
                >
                  {linkPending ? "关联中…" : "确认关联"}
                </Button>
              </DialogFooter>
            </DialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>

      <ConfirmDialog
        open={unlinkTarget !== null}
        onOpenChange={(open) => {
          if (!open) setUnlinkTarget(null);
        }}
        title="取消关联"
        description="确定取消与此计划的关联？待办本身不会被删除。"
        confirmLabel="取消关联"
        onConfirm={confirmUnlink}
        pending={unlinkPending}
      />
    </>
  );
}
