import { requireSession } from "@/lib/session";
import { listDisplayTodos } from "@/lib/services/todo";
import { parseTodoFilter } from "@/lib/validators/todo";
import { PageShell } from "@/components/layout/page-shell";
import { TodoCreateButton } from "@/components/todos/todo-create-button";
import { TodoFilterTabs } from "@/components/todos/todo-filter-tabs";
import { TodoList } from "@/components/todos/todo-list";

export default async function TodosPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await requireSession();
  const { filter: filterParam } = await searchParams;
  const filter = parseTodoFilter(filterParam);
  const todos = await listDisplayTodos(session.id, filter);

  return (
    <PageShell title="待办" description="浏览并管理你的待办">
      <TodoFilterTabs active={filter} />
      <TodoList todos={todos} filter={filter} />
      <div className="flex justify-center pt-4">
        <TodoCreateButton />
      </div>
    </PageShell>
  );
}
