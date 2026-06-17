import { requireSession } from "@/lib/session";
import { PageShell } from "@/components/layout/page-shell";
import { GoalCreateForm } from "@/components/goals/goal-create-form";

export default async function GoalNewPage() {
  await requireSession();

  return (
    <PageShell
      title="新建目标"
      description="写下方向，保存后再关联计划、拆解待办"
      backHref="/goals"
      backLabel="返回列表"
    >
      <GoalCreateForm />
    </PageShell>
  );
}
