import type { ReactNode } from "react";
import { ModuleSectionPanel, type ModuleKind } from "@/components/ui/module-ui";

export function TodaySection({
  title,
  description,
  action,
  children,
  module = "today",
  tone,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  module?: ModuleKind;
  tone?: "default" | "warning";
}) {
  return (
    <ModuleSectionPanel
      module={module}
      title={title}
      description={description}
      action={action}
      accentClassName={tone === "warning" ? "bg-amber-500/75" : undefined}
    >
      {children}
    </ModuleSectionPanel>
  );
}
