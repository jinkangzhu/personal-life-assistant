import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getGoalById, listUnlinkedPlansForGoal } from "@/lib/services/goal";
import { PageShell } from "@/components/layout/page-shell";
import { GoalDetail } from "@/components/goals/goal-detail";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const [goal, unlinkedPlans] = await Promise.all([
    getGoalById(session.id, id),
    listUnlinkedPlansForGoal(session.id, id),
  ]);

  if (!goal) {
    notFound();
  }

  return (
    <PageShell title={goal.title} backHref="/goals" backLabel="返回列表">
      <GoalDetail goal={goal} unlinkedPlans={unlinkedPlans} />
    </PageShell>
  );
}
