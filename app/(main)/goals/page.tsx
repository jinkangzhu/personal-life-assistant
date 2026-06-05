import { requireSession } from "@/lib/session";
import { listGoals } from "@/lib/services/goal";
import { PageShell } from "@/components/layout/page-shell";
import { GoalCreateSection } from "@/components/goals/goal-create-section";
import { GoalList } from "@/components/goals/goal-list";

export default async function GoalsPage() {
  const session = await requireSession();
  const goals = await listGoals(session.id);

  return (
    <PageShell
      title="长期目标"
      description="记录未来发展方向，关联计划并跟踪进展"
    >
      <GoalList goals={goals} />
      <GoalCreateSection />
    </PageShell>
  );
}
