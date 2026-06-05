import { EmptyState } from "@/components/ui/card";
import type { DiaryDateGroup as DiaryDateGroupType } from "@/lib/services/diary";
import { DiaryDateGroup } from "./diary-item";

export function DiaryList({ groups }: { groups: DiaryDateGroupType[] }) {
  if (groups.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        title="暂无日记"
        description="点击下方「写日记」开始记录"
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <DiaryDateGroup
          key={group.dateKey}
          date={group.date}
          entries={group.entries}
        />
      ))}
    </div>
  );
}
