import { requireSession } from "@/lib/session";
import { listGoals } from "@/lib/services/goal";
import { PageShell } from "@/components/layout/page-shell";
import { GoalCreateButton } from "@/components/goals/goal-create-button";
import { GoalList } from "@/components/goals/goal-list";

export default async function GoalsPage() {
  const session = await requireSession();
  const goals = await listGoals(session.id);

  return (
    <PageShell
      title="长期目标"
      description="方向在前，计划在后——把你想成为的样子写在这里"
      action={<GoalCreateButton />}
    >
      <GoalList goals={goals} />
    </PageShell>
  );
}
