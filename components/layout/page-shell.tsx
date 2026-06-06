import { PageHeader } from "@/components/ui/page-header";

export function PageShell({
  title,
  description,
  backHref,
  backLabel,
  action,
  children,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={title}
        description={description}
        backHref={backHref}
        backLabel={backLabel}
        action={action}
      />
      {children}
    </div>
  );
}
