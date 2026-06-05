import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getReviewById } from "@/lib/services/review";
import { formatDate } from "@/lib/utils";
import { PageShell } from "@/components/layout/page-shell";
import { ReviewDetail } from "@/components/reviews/review-detail";

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;
  const review = await getReviewById(session.id, id);

  if (!review) {
    notFound();
  }

  return (
    <PageShell
      title={`${formatDate(review.periodDate)} 复盘`}
      backHref="/reviews"
      backLabel="返回列表"
    >
      <ReviewDetail review={review} />
    </PageShell>
  );
}
