import { Card, EmptyState } from "@/components/ui/card";

export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
      </div>
      <Card>
        <EmptyState title="功能开发中" description="脚手架已就绪，即将接入数据" />
      </Card>
    </div>
  );
}
