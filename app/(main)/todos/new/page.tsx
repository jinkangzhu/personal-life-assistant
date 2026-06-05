import { PageShell } from "@/components/layout/page-shell";
import { TodoCreateForm } from "@/components/todos/todo-create-form";

export default function TodoNewPage() {
  return (
    <PageShell
      title="添加待办"
      description="创建新的待办任务"
      backHref="/todos"
      backLabel="返回列表"
    >
      <TodoCreateForm />
    </PageShell>
  );
}
