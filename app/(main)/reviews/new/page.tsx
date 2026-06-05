import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { buildReviewDraft } from "@/lib/services/review";
import { formatDate, parseDateInput } from "@/lib/utils";
import { PageShell } from "@/components/layout/page-shell";
import { ReviewCreateForm } from "@/components/reviews/review-create-form";
import { ReviewDayContext } from "@/components/reviews/review-day-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PageProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function ReviewNewPage({ searchParams }: PageProps) {
  const session = await requireSession();
  const { date: dateParam } = await searchParams;
  const reviewDate = parseDateInput(dateParam) ?? new Date();
  const draft = await buildReviewDraft(session.id, reviewDate);

  if (draft.existingReview) {
    redirect(`/reviews/${draft.existingReview.id}`);
  }

  return (
    <PageShell
      title="创建每日复盘"
      description={formatDate(draft.periodDate)}
      backHref="/today"
      backLabel="返回今日"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ReviewCreateForm
          periodDate={draft.periodDate}
          defaultContent={draft.content}
        />

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>当日数据参考</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ReviewDayContext context={draft.dayContext} />
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
