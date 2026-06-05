"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { GoalCreateForm } from "@/components/goals/goal-create-form";
import { createLinkButtonClassName } from "@/components/ui/create-link-button";
import { cn } from "@/lib/utils";

export function GoalCreateSection() {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div className="space-y-4">
        <GoalCreateForm onCancel={() => setOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex justify-center pt-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(createLinkButtonClassName)}
      >
        <Plus className="h-4 w-4" />
        新建目标
      </button>
    </div>
  );
}
