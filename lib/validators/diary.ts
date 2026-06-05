import { z } from "zod";
import { Mood } from "@prisma/client";
import { tagsFieldSchema } from "@/lib/validators/tag";

export const diaryCreateSchema = z.object({
  title: z.string().trim().max(200).optional(),
  date: z.string().trim().min(1, "请选择日期"),
  content: z.string().max(50000).default(""),
  mood: z.nativeEnum(Mood).optional(),
  tags: tagsFieldSchema,
});

export const diaryUpdateSchema = diaryCreateSchema;

export const MOOD_LABELS: Record<Mood, string> = {
  HAPPY: "开心",
  CALM: "平静",
  ANXIOUS: "焦虑",
  TIRED: "疲惫",
  OTHER: "其他",
};

export const MOOD_EMOJI: Record<Mood, string> = {
  HAPPY: "😊",
  CALM: "😌",
  ANXIOUS: "😰",
  TIRED: "😴",
  OTHER: "📝",
};
