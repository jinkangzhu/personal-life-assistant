import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { listUserActivityTypes } from "@/lib/services/activity-type";
import { getTodoById } from "@/lib/services/todo";
import { PageShell } from "@/components/layout/page-shell";
import { TodoDetail } from "@/components/todos/todo-detail";

export default async function TodoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const [todo, activityTypes] = await Promise.all([
    getTodoById(session.id, id),
    listUserActivityTypes(session.id),
  ]);

  if (!todo) {
    notFound();
  }

  return (
    <PageShell title={todo.title} backHref="/todos" backLabel="返回列表">
      <TodoDetail todo={todo} activityTypes={activityTypes} />
    </PageShell>
  );
}
