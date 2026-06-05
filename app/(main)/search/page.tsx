import { requireSession } from "@/lib/session";
import { listUserCategories } from "@/lib/services/category";
import { search } from "@/lib/services/search";
import { listUserTags } from "@/lib/services/tag";
import {
  hasSearchCriteria,
  parseSearchFilter,
} from "@/lib/validators/search";
import { PageShell } from "@/components/layout/page-shell";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import { Card, CardContent, EmptyState } from "@/components/ui/card";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    tag?: string;
    category?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const filter = parseSearchFilter(params);

  const [categories, tags, results] = await Promise.all([
    listUserCategories(session.id),
    listUserTags(session.id),
    hasSearchCriteria(filter)
      ? search(session.id, filter)
      : Promise.resolve(null),
  ]);

  return (
    <PageShell
      title="搜索"
      description="按关键词、类型、标签、分类与时间范围检索内容"
    >
      <Card>
        <CardContent className="pt-0">
          <SearchForm filter={filter} />
        </CardContent>
      </Card>

      <SearchFilters filter={filter} categories={categories} tags={tags} />

      {results ? (
        <SearchResults groups={results.groups} />
      ) : (
        <EmptyState
          variant="dashed"
          title="输入关键词或选择筛选条件后开始搜索"
        />
      )}
    </PageShell>
  );
}
