import { DiaryWriteButton } from "@/components/diary/diary-write-button";
import type { DiaryDateGroup as DiaryDateGroupType } from "@/lib/services/diary";
import { ModuleEmptyState } from "@/components/ui/module-ui";
import { DiaryDateGroup } from "./diary-item";

export function DiaryList({ groups }: { groups: DiaryDateGroupType[] }) {
  if (groups.length === 0) {
    return (
      <ModuleEmptyState
        module="diary"
        title="还没有日记"
        description="记录今天发生的事、学到的东西，以及当时的心情。"
        action={<DiaryWriteButton />}
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
