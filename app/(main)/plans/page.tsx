import { requireSession } from "@/lib/session";
import { listPlans } from "@/lib/services/plan";
import { parsePlanFilter } from "@/lib/validators/plan";
import { PageShell } from "@/components/layout/page-shell";
import { PlanCreateButton } from "@/components/plans/plan-create-button";
import { PlanFilterTabs } from "@/components/plans/plan-filter-tabs";
import { PlanList } from "@/components/plans/plan-list";

export default async function PlansPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await requireSession();
  const { filter: filterParam } = await searchParams;
  const filter = parsePlanFilter(filterParam);
  const plans = await listPlans(session.id, filter);

  return (
    <PageShell
      title="计划"
      description="短期与长期计划，关联待办并查看进度"
      action={<PlanCreateButton />}
    >
      <PlanFilterTabs active={filter} />
      <PlanList plans={plans} filter={filter} />
    </PageShell>
  );
}
