"use server";

import { revalidatePath } from "next/cache";
import {
  decrementSmokingCount,
  incrementSmokingCount,
  markSmokeFreeDay,
} from "@/lib/services/smoking";
import { requireSession } from "@/lib/session";
import { parseDateInput } from "@/lib/utils";

function revalidateTodayPaths() {
  revalidatePath("/today");
}

export async function recordSmokingAction(date?: string) {
  const session = await requireSession();

  try {
    const refDate = parseDateInput(date) ?? new Date();
    await incrementSmokingCount(session.id, refDate);
    revalidateTodayPaths();
    return { ok: true as const };
  } catch (error) {
    console.error("recordSmokingAction error:", error);
    return { ok: false as const, error: "记录失败" };
  }
}

export async function undoSmokingAction(date?: string) {
  const session = await requireSession();

  try {
    const refDate = parseDateInput(date) ?? new Date();
    await decrementSmokingCount(session.id, refDate);
    revalidateTodayPaths();
    return { ok: true as const };
  } catch (error) {
    console.error("undoSmokingAction error:", error);
    return { ok: false as const, error: "撤销失败" };
  }
}

export async function markSmokeFreeDayAction(date?: string) {
  const session = await requireSession();

  try {
    const refDate = parseDateInput(date) ?? new Date();
    await markSmokeFreeDay(session.id, refDate);
    revalidateTodayPaths();
    return { ok: true as const };
  } catch (error) {
    console.error("markSmokeFreeDayAction error:", error);
    return { ok: false as const, error: "标记失败" };
  }
}
