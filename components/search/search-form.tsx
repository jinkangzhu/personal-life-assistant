"use client";

import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toDateInputValue } from "@/lib/utils";
import type { SearchFilter } from "@/lib/validators/search";

export function SearchForm({ filter }: { filter: SearchFilter }) {
  const typeValue = filter.types?.join(",") ?? "";
  const fromValue = filter.dateFrom ? toDateInputValue(filter.dateFrom) : "";
  const toValue = filter.dateTo ? toDateInputValue(filter.dateTo) : "";

  return (
    <form action="/search" method="GET" className="space-y-4">
      {typeValue && <input type="hidden" name="type" value={typeValue} />}
      {filter.tagId && <input type="hidden" name="tag" value={filter.tagId} />}
      {filter.categoryId && (
        <input type="hidden" name="category" value={filter.categoryId} />
      )}

      <div>
        <label htmlFor="search-q" className="mb-1.5 block text-xs text-[var(--color-muted)]">
          关键词
        </label>
        <Input
          id="search-q"
          name="q"
          defaultValue={filter.q ?? ""}
          placeholder="搜索标题、正文或描述"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            开始日期
          </label>
          <DatePicker name="from" defaultValue={fromValue} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-[var(--color-muted)]">
            结束日期
          </label>
          <DatePicker name="to" defaultValue={toValue} />
        </div>
      </div>

      <Button type="submit">搜索</Button>
    </form>
  );
}
