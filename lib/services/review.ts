import { prisma } from "@/lib/db";
import { getRecurringTodosForDate } from "@/lib/services/recurring-todo";
import { contentSummary } from "@/lib/services/note";
import { endOfDay, startOfDay } from "@/lib/utils";
import type { DiaryEntry, Review, Todo } from "@prisma/client";
import { ReviewPeriodType, TodoStatus } from "@prisma/client";

export { contentSummary as reviewContentSummary };

export type ReviewDayContext = {
  periodDate: Date;
  diaryEntries: DiaryEntry[];
  completedTodos: Todo[];
  pendingTodos: Todo[];
  completedRecurring: Array<{ title: string; completionNote: string | null }>;
  pendingRecurring: Array<{ title: string; completionNote: string | null }>;
};

export async function getReviewDayContext(
  userId: string,
  date: Date = new Date(),
): Promise<ReviewDayContext> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const [diaryEntries, todos, recurringToday] = await Promise.all([
    prisma.diaryEntry.findMany({
      where: { userId, date: { gte: dayStart, lte: dayEnd } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.todo.findMany({
      where: {
        userId,
        OR: [
          { dueDate: { gte: dayStart, lte: dayEnd } },
          { completedAt: { gte: dayStart, lte: dayEnd } },
        ],
      },
      orderBy: { priority: "desc" },
    }),
    getRecurringTodosForDate(userId, date),
  ]);

  const completedRecurring = recurringToday
    .filter((todo) => todo.status === TodoStatus.COMPLETED)
    .map((todo) => ({
      title: todo.title,
      completionNote: todo.completionNote,
    }));
  const pendingRecurring = recurringToday
    .filter((todo) => todo.status === TodoStatus.PENDING)
    .map((todo) => ({
      title: todo.title,
      completionNote: todo.completionNote,
    }));

  return {
    periodDate: dayStart,
    diaryEntries,
    completedTodos: todos.filter((t) => t.status === TodoStatus.COMPLETED),
    pendingTodos: todos.filter((t) => t.status === TodoStatus.PENDING),
    completedRecurring,
    pendingRecurring,
  };
}

export async function buildReviewDraft(userId: string, date: Date = new Date()) {
  const dayContext = await getReviewDayContext(userId, date);
  const {
    periodDate,
    diaryEntries,
    completedTodos,
    pendingTodos,
    completedRecurring,
    pendingRecurring,
  } = dayContext;

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_periodType_periodDate: {
        userId,
        periodType: ReviewPeriodType.DAILY,
        periodDate,
      },
    },
  });

  const completedLines = [
    ...completedTodos.map((t) => `- [x] ${t.title}`),
    ...completedRecurring.map((t) => `- [x] ${t.title}（循环）`),
  ];
  const pendingLines = [
    ...pendingTodos.map(
      (t) => `- [ ] ${t.title}${t.completionNote ? ` — ${t.completionNote}` : ""}`,
    ),
    ...pendingRecurring.map(
      (t) =>
        `- [ ] ${t.title}（循环）${t.completionNote ? ` — ${t.completionNote}` : ""}`,
    ),
  ];

  const lines: string[] = [
    `# ${periodDate.toLocaleDateString("zh-CN")} 每日复盘`,
    "",
    "## 今日完成",
    ...(completedLines.length ? completedLines : ["- （无）"]),
    "",
    "## 未完成",
    ...(pendingLines.length ? pendingLines : ["- （无）"]),
    "",
    "## 日记摘要",
    ...(diaryEntries.length
      ? diaryEntries.map((d) => d.content.slice(0, 200) || "（空）")
      : ["（今日暂无日记）"]),
    "",
    "## 收获与反思",
    "",
    "## 明日注意",
    "",
  ];

  return {
    periodDate,
    content: existingReview?.content ?? lines.join("\n"),
    existingReview,
    dayContext,
    summary: {
      completedCount: completedTodos.length + completedRecurring.length,
      pendingCount: pendingTodos.length + pendingRecurring.length,
      diaryCount: diaryEntries.length,
    },
  };
}

export async function listReviews(userId: string) {
  return prisma.review.findMany({
    where: { userId, periodType: ReviewPeriodType.DAILY },
    orderBy: { periodDate: "desc" },
  });
}

export async function getReviewById(userId: string, id: string) {
  return prisma.review.findFirst({
    where: { id, userId },
  });
}

export async function getOwnedReview(userId: string, id: string) {
  const review = await getReviewById(userId, id);
  if (!review) {
    throw new Error("REVIEW_NOT_FOUND");
  }
  return review;
}
