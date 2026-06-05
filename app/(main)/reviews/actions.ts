"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getOwnedReview } from "@/lib/services/review";
import { requireSession } from "@/lib/session";
import { parseDateInput, startOfDay } from "@/lib/utils";
import { reviewCreateSchema, reviewUpdateSchema } from "@/lib/validators/review";
import { Prisma, ReviewPeriodType } from "@prisma/client";
import { z } from "zod";

function revalidateReviewPaths(id?: string) {
  revalidatePath("/reviews");
  revalidatePath("/reviews/new");
  revalidatePath("/today");
  if (id) revalidatePath(`/reviews/${id}`);
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

export async function createReview(formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = reviewCreateSchema.parse({
      periodDate: raw.periodDate,
      content: raw.content ?? "",
    });

    const periodDate = parseDateInput(parsed.periodDate);
    if (!periodDate) {
      return { ok: false as const, error: "日期无效" };
    }

    const normalizedDate = startOfDay(periodDate);

    const review = await prisma.review.create({
      data: {
        userId: session.id,
        periodType: ReviewPeriodType.DAILY,
        periodDate: normalizedDate,
        content: parsed.content,
      },
    });

    revalidateReviewPaths(review.id);
    return { ok: true as const, id: review.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false as const, error: "该日期已有复盘，请直接编辑" };
    }
    console.error("createReview error:", error);
    return { ok: false as const, error: "创建失败" };
  }
}

export async function updateReview(id: string, formData: FormData) {
  const session = await requireSession();

  try {
    await getOwnedReview(session.id, id);
    const raw = formDataToObject(formData);
    const parsed = reviewUpdateSchema.parse({
      content: raw.content ?? "",
    });

    await prisma.review.update({
      where: { id },
      data: { content: parsed.content },
    });

    revalidateReviewPaths(id);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "REVIEW_NOT_FOUND") {
      return { ok: false as const, error: "复盘不存在" };
    }
    console.error("updateReview error:", error);
    return { ok: false as const, error: "更新失败" };
  }
}

export async function deleteReview(id: string) {
  const session = await requireSession();

  try {
    await getOwnedReview(session.id, id);
    await prisma.review.delete({ where: { id } });
    revalidateReviewPaths();
    redirect("/reviews");
  } catch (error) {
    if (error instanceof Error && error.message === "REVIEW_NOT_FOUND") {
      return { ok: false as const, error: "复盘不存在" };
    }
    throw error;
  }
}
