import { requireSession } from "@/lib/session";
import { listReviews } from "@/lib/services/review";
import { PageShell } from "@/components/layout/page-shell";
import { ReviewCreateButton } from "@/components/reviews/review-create-button";
import { ReviewList } from "@/components/reviews/review-list";

export default async function ReviewsPage() {
  const session = await requireSession();
  const reviews = await listReviews(session.id);

  return (
    <PageShell
      title="复盘"
      description="每日复盘，自动引用当日日记与待办完成情况"
    >
      <ReviewList reviews={reviews} />
      <div className="flex justify-center pt-4">
        <ReviewCreateButton />
      </div>
    </PageShell>
  );
}
