import { requireSession } from "@/lib/session";
import { listPlans } from "@/lib/services/plan";
import { PageShell } from "@/components/layout/page-shell";
import { PlanCreateButton } from "@/components/plans/plan-create-button";
import { PlanList } from "@/components/plans/plan-list";

export default async function PlansPage() {
  const session = await requireSession();
  const plans = await listPlans(session.id);

  return (
    <PageShell
      title="计划"
      description="短期与长期计划，关联待办并查看进度"
    >
      <PlanList plans={plans} />
      <div className="flex justify-center pt-4">
        <PlanCreateButton />
      </div>
    </PageShell>
  );
}
