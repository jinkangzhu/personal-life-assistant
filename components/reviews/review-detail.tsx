"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteReview } from "@/app/(main)/reviews/actions";
import { RecordDetail } from "@/components/detail/record-detail";
import { ReviewEditForm } from "@/components/reviews/review-edit-form";
import { ReviewView } from "@/components/reviews/review-view";
import { Card } from "@/components/ui/card";
import type { Review } from "@prisma/client";

export function ReviewDetail({ review }: { review: Review }) {
  const router = useRouter();
  const [deletePending, startDeleteTransition] = useTransition();

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteReview(review.id);
    });
  }

  return (
    <Card className="px-4 py-4">
      <RecordDetail
        onDelete={handleDelete}
        deletePending={deletePending}
        deleteConfirmTitle="删除复盘"
        deleteConfirmDescription="确定删除此复盘？此操作不可撤销。"
        editForm={({ exitEdit }) => (
          <ReviewEditForm
            key={review.updatedAt.toISOString()}
            review={review}
            onCancel={exitEdit}
            onSaved={() => {
              exitEdit();
              router.refresh();
            }}
          />
        )}
      >
        <ReviewView review={review} />
      </RecordDetail>
    </Card>
  );
}
