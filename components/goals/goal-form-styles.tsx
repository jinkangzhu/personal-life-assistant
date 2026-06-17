import type { ComponentProps, ReactNode } from "react";
import {
  ModuleAccent,
  ModuleFormLabel,
  ModuleTitleInput,
  moduleTextareaClassName,
} from "@/components/ui/module-ui";

export const goalTextareaClassName = moduleTextareaClassName;

export function GoalHorizon({ className }: { className?: string }) {
  return <ModuleAccent module="goal" className={className} />;
}

export const GoalFormLabel = ModuleFormLabel;
export const GoalTitleInput = ModuleTitleInput;
