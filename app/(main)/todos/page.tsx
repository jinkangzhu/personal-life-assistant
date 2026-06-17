import { requireSession } from "@/lib/session";

import { listDisplayTodos } from "@/lib/services/todo";

import { sortCompletedDisplayTodos } from "@/lib/services/todo-sort";

import {

  parseCompletedTodoSort,
  parseTodoDateRangeFilter,
  parseTodoFilter,
  DEFAULT_COMPLETED_TODO_SORT,
} from "@/lib/validators/todo";

import { PageShell } from "@/components/layout/page-shell";

import { TodoCreateButton } from "@/components/todos/todo-create-button";

import { TodoFilterBar } from "@/components/todos/todo-filter-bar";

import { TodoList } from "@/components/todos/todo-list";



export default async function TodosPage({

  searchParams,

}: {

  searchParams: Promise<{

    filter?: string;

    from?: string;

    to?: string;

    sortBy?: string;

    sortOrder?: string;

  }>;

}) {

  const session = await requireSession();

  const { filter: filterParam, from, to, sortBy, sortOrder } = await searchParams;

  const filter = parseTodoFilter(filterParam);

  const dateRange = parseTodoDateRangeFilter({ from, to });

  const completedSort = parseCompletedTodoSort({ sortBy, sortOrder });

  let todos = await listDisplayTodos(

    session.id,

    filter,

    new Date(),

    filter === "today" ? undefined : dateRange,

  );



  if (filter === "completed") {
    const effectiveSort = completedSort ?? DEFAULT_COMPLETED_TODO_SORT;
    todos = sortCompletedDisplayTodos(
      todos,
      effectiveSort.sortBy,
      effectiveSort.sortOrder,
    );
  }



  return (

    <PageShell

      title="待办"

      description="列出要做的事，按优先级和截止日期推进"

      action={<TodoCreateButton />}

    >

      <TodoFilterBar filter={filter} dateRange={dateRange} />

      <TodoList

        todos={todos}

        filter={filter}

        dateRange={dateRange}

        completedSort={completedSort}

      />

    </PageShell>

  );

}

