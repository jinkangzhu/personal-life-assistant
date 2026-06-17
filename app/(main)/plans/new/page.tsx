import { requireSession } from "@/lib/session";
import { PageShell } from "@/components/layout/page-shell";
import { PlanCreateForm } from "@/components/plans/plan-create-form";

export default async function PlanNewPage() {
  await requireSession();

  return (
    <PageShell
      title="新建计划"
      description="设定范围与周期，保存后再拆解关联待办"
      backHref="/plans"
      backLabel="返回列表"
    >
      <PlanCreateForm />
    </PageShell>
  );
}
