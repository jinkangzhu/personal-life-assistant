import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { listUserActivityTypes } from "@/lib/services/activity-type";
import {
  getCurrentPeriodDisplayTodo,
  getRecurringTodoById,
} from "@/lib/services/recurring-todo";
import { PageShell } from "@/components/layout/page-shell";
import { RecurringTodoDetail } from "@/components/todos/recurring-todo-detail";

export default async function RecurringTodoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const [todo, activityTypes] = await Promise.all([
    getRecurringTodoById(session.id, id),
    listUserActivityTypes(session.id),
  ]);

  if (!todo) {
    notFound();
  }

  const currentPeriod = getCurrentPeriodDisplayTodo(todo);

  return (
    <PageShell title={todo.title} backHref="/todos" backLabel="返回列表">
      <RecurringTodoDetail
        todo={todo}
        currentPeriod={currentPeriod}
        activityTypes={activityTypes}
      />
    </PageShell>
  );
}
