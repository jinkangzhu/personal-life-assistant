import { prisma } from "@/lib/db";
import { addDays, startOfDay } from "@/lib/utils";

export type SmokingStats = {
  todayCount: number;
  yesterdayCount: number;
  diffFromYesterday: number;
  totalSmoked: number;
  quitDays: number;
};

export function formatSmokingDiffFromYesterday(diff: number): string {
  if (diff > 0) return `比昨天少 ${diff} 根`;
  if (diff < 0) return `比昨天多 ${Math.abs(diff)} 根`;
  return "与昨天相同";
}

export async function getSmokingStats(
  userId: string,
  refDate: Date = new Date(),
): Promise<SmokingStats> {
  const today = startOfDay(refDate);
  const yesterday = startOfDay(addDays(today, -1));

  const [todayLog, yesterdayLog, totalAgg, quitDays] = await Promise.all([
    prisma.smokingDailyLog.findUnique({
      where: { userId_date: { userId, date: today } },
      select: { count: true },
    }),
    prisma.smokingDailyLog.findUnique({
      where: { userId_date: { userId, date: yesterday } },
      select: { count: true },
    }),
    prisma.smokingDailyLog.aggregate({
      where: { userId },
      _sum: { count: true },
    }),
    prisma.smokingDailyLog.count({
      where: { userId, count: 0 },
    }),
  ]);

  const todayCount = todayLog?.count ?? 0;
  const yesterdayCount = yesterdayLog?.count ?? 0;

  return {
    todayCount,
    yesterdayCount,
    diffFromYesterday: yesterdayCount - todayCount,
    totalSmoked: totalAgg._sum.count ?? 0,
    quitDays,
  };
}

export async function incrementSmokingCount(
  userId: string,
  date: Date = new Date(),
) {
  const day = startOfDay(date);

  return prisma.smokingDailyLog.upsert({
    where: { userId_date: { userId, date: day } },
    create: { userId, date: day, count: 1 },
    update: { count: { increment: 1 } },
  });
}

export async function decrementSmokingCount(
  userId: string,
  date: Date = new Date(),
) {
  const day = startOfDay(date);
  const existing = await prisma.smokingDailyLog.findUnique({
    where: { userId_date: { userId, date: day } },
  });

  if (!existing || existing.count <= 0) {
    return existing;
  }

  return prisma.smokingDailyLog.update({
    where: { id: existing.id },
    data: { count: existing.count - 1 },
  });
}

export async function markSmokeFreeDay(
  userId: string,
  date: Date = new Date(),
) {
  const day = startOfDay(date);

  return prisma.smokingDailyLog.upsert({
    where: { userId_date: { userId, date: day } },
    create: { userId, date: day, count: 0 },
    update: { count: 0 },
  });
}
