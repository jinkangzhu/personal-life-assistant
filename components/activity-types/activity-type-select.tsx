"use client";

import type { ActivityType } from "@prisma/client";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

interface ActivityTypeSelectProps {
  name?: string;
  activityTypes: ActivityType[];
  defaultValue?: string | null;
  placeholder?: string;
  className?: string;
}

export function ActivityTypeSelect({
  name = "activityTypeId",
  activityTypes,
  defaultValue = "",
  placeholder = "选择活动类型",
  className,
}: ActivityTypeSelectProps) {
  return (
    <NativeSelect
      name={name}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      options={activityTypes.map((item) => ({
        value: item.id,
        label: item.name,
      }))}
      className={cn("w-full", className)}
    />
  );
}
