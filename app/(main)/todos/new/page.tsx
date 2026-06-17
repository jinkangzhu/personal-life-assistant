import { PageShell } from "@/components/layout/page-shell";
import { TodoCreateForm } from "@/components/todos/todo-create-form";
import { listUserActivityTypes } from "@/lib/services/activity-type";
import { requireSession } from "@/lib/session";

export default async function TodoNewPage() {
  const session = await requireSession();
  const activityTypes = await listUserActivityTypes(session.id);

  return (
    <PageShell
      title="添加待办"
      description="写清楚下一步动作，需要时再补充说明"
      backHref="/todos"
      backLabel="返回列表"
    >
      <TodoCreateForm activityTypes={activityTypes} />
    </PageShell>
  );
}
