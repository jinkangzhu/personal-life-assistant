"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Plus } from "lucide-react";
import { GoalCreateForm } from "@/components/goals/goal-create-form";
import { createLinkButtonClassName } from "@/components/ui/create-link-button";
import { cn } from "@/lib/utils";

const GoalCreateContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function useGoalCreate() {
  const context = useContext(GoalCreateContext);
  if (!context) {
    throw new Error("Goal create components must be used within GoalCreateProvider");
  }
  return context;
}

export function GoalCreateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <GoalCreateContext.Provider value={{ open, setOpen }}>
      {children}
    </GoalCreateContext.Provider>
  );
}

export function GoalCreateHeaderButton() {
  const { open, setOpen } = useGoalCreate();

  if (open) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(createLinkButtonClassName)}
    >
      <Plus className="h-4 w-4" />
      新建目标
    </button>
  );
}

export function GoalCreatePanel() {
  const { open, setOpen } = useGoalCreate();

  if (!open) {
    return null;
  }

  return <GoalCreateForm onCancel={() => setOpen(false)} />;
}
