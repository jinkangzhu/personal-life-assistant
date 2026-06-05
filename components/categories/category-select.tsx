"use client";

import type { Category } from "@prisma/client";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";

interface CategorySelectProps {
  name?: string;
  categories: Category[];
  defaultValue?: string | null;
  placeholder?: string;
  className?: string;
}

export function CategorySelect({
  name = "categoryId",
  categories,
  defaultValue = "",
  placeholder = "选择分类",
  className,
}: CategorySelectProps) {
  return (
    <NativeSelect
      name={name}
      defaultValue={defaultValue ?? ""}
      placeholder={placeholder}
      options={categories.map((category) => ({
        value: category.id,
        label: category.name,
      }))}
      className={cn("w-full", className)}
    />
  );
}
