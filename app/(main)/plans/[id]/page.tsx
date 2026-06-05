import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getPlanById, listUnlinkedRecurringTodos, listUnlinkedTodos } from "@/lib/services/plan";
import { PageShell } from "@/components/layout/page-shell";
import { PlanDetail } from "@/components/plans/plan-detail";

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const [plan, unlinkedTodos, unlinkedRecurringTodos] = await Promise.all([
    getPlanById(session.id, id),
    listUnlinkedTodos(session.id),
    listUnlinkedRecurringTodos(session.id),
  ]);

  if (!plan) {
    notFound();
  }

  return (
    <PageShell title={plan.title} backHref="/plans" backLabel="返回列表">
      <PlanDetail
        plan={plan}
        unlinkedTodos={unlinkedTodos}
        unlinkedRecurringTodos={unlinkedRecurringTodos}
      />
    </PageShell>
  );
}
