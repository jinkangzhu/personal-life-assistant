import { requireSession } from "@/lib/session";
import { listUserCategories } from "@/lib/services/category";
import { listUserTagsWithUsage } from "@/lib/services/tag";
import { PageShell } from "@/components/layout/page-shell";
import { CategoryManager } from "@/components/settings/category-manager";
import { TagManager } from "@/components/settings/tag-manager";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { WallpaperPicker } from "@/components/settings/wallpaper-picker";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProjectSettingsPage() {
  const session = await requireSession();
  const [tags, categories] = await Promise.all([
    listUserTagsWithUsage(session.id),
    listUserCategories(session.id),
  ]);

  return (
    <PageShell title="项目配置" description="外观、标签与笔记分类">
      <Card>
        <CardHeader>
          <CardTitle>外观</CardTitle>
        </CardHeader>
        <ThemeToggle />
        <WallpaperPicker user={session} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>标签管理</CardTitle>
        </CardHeader>
        <TagManager tags={tags} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>笔记分类</CardTitle>
        </CardHeader>
        <CategoryManager categories={categories} />
      </Card>
    </PageShell>
  );
}
