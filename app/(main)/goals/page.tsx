import { requireSession } from "@/lib/session";
import { listGoals } from "@/lib/services/goal";
import { PageShell } from "@/components/layout/page-shell";
import {
  GoalCreateHeaderButton,
  GoalCreatePanel,
  GoalCreateProvider,
} from "@/components/goals/goal-create-section";
import { GoalList } from "@/components/goals/goal-list";

export default async function GoalsPage() {
  const session = await requireSession();
  const goals = await listGoals(session.id);

  return (
    <GoalCreateProvider>
      <PageShell
        title="长期目标"
        description="记录未来发展方向，关联计划并跟踪进展"
        action={<GoalCreateHeaderButton />}
      >
        <GoalList goals={goals} />
        <GoalCreatePanel />
      </PageShell>
    </GoalCreateProvider>
  );
}
