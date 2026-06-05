import { requireSession } from "@/lib/session";
import { PageShell } from "@/components/layout/page-shell";
import { PlanCreateForm } from "@/components/plans/plan-create-form";

export default async function PlanNewPage() {
  await requireSession();

  return (
    <PageShell
      title="新建计划"
      description="设定目标、周期与状态，随后可拆解关联待办"
      backHref="/plans"
      backLabel="返回列表"
    >
      <PlanCreateForm />
    </PageShell>
  );
}
