import { requireSession } from "@/lib/session";
import { listUserCategories } from "@/lib/services/category";
import { listUserActivityTypes } from "@/lib/services/activity-type";
import { listUserTagsWithUsage } from "@/lib/services/tag";
import { PageShell } from "@/components/layout/page-shell";
import { ActivityTypeManager } from "@/components/settings/activity-type-manager";
import { CategoryManager } from "@/components/settings/category-manager";
import {
  SettingsNav,
  SettingsPageLayout,
} from "@/components/settings/settings-ui";
import { TagManager } from "@/components/settings/tag-manager";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { WallpaperPicker } from "@/components/settings/wallpaper-picker";
import {
  ModuleAccent,
  ModulePanel,
  ModuleSectionPanel,
} from "@/components/ui/module-ui";

export default async function ProjectSettingsPage() {
  const session = await requireSession();
  const [tags, categories, activityTypes] = await Promise.all([
    listUserTagsWithUsage(session.id),
    listUserCategories(session.id),
    listUserActivityTypes(session.id),
  ]);

  return (
    <PageShell
      title="项目配置"
      description="外观、标签、活动类型与笔记分类"
    >
      <SettingsPageLayout>
        <SettingsNav />

        <ModulePanel module="settings">
          <ModuleAccent module="settings" className="mb-6 max-w-sm" />
          <div className="space-y-6">
            <div>
              <p className="mb-3 text-xs font-medium tracking-wide text-[var(--color-muted)]">
                主题模式
              </p>
              <ThemeToggle />
            </div>
            <div className="border-t border-[var(--color-border)]/70 pt-6">
              <WallpaperPicker user={session} embedded />
            </div>
          </div>
        </ModulePanel>

        <ModuleSectionPanel
          module="note"
          title="标签"
          description="用于日记与笔记，便于筛选和归类"
        >
          <TagManager tags={tags} />
        </ModuleSectionPanel>

        <ModuleSectionPanel
          module="todo"
          title="活动类型"
          description="待办分类，用于统计今日时长"
        >
          <ActivityTypeManager activityTypes={activityTypes} />
        </ModuleSectionPanel>

        <ModuleSectionPanel
          module="note"
          title="笔记分类"
          description="笔记列表筛选与归档"
        >
          <CategoryManager categories={categories} />
        </ModuleSectionPanel>
      </SettingsPageLayout>
    </PageShell>
  );
}
