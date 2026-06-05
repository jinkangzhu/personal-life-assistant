import { z } from "zod";

export const TAG_COLORS = [
  "#818cf8",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
  "#38bdf8",
  "#fb923c",
  "#e879f9",
] as const;

export const tagNameSchema = z
  .string()
  .trim()
  .min(1, "标签名不能为空")
  .max(50, "标签名最多 50 个字符");

export const tagCreateSchema = z.object({
  name: tagNameSchema,
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "颜色格式无效")
    .optional(),
});

export const tagUpdateSchema = z.object({
  name: tagNameSchema.optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "颜色格式无效")
    .optional()
    .nullable(),
});

export const tagsFieldSchema = z.string().max(500).optional();

export const MAX_TAGS_PER_ENTITY = 20;
export const MAX_TAG_NAME_LENGTH = 50;

export function parseTagNames(input: string | undefined): string[] {
  if (!input?.trim()) return [];

  const seen = new Set<string>();
  const names: string[] = [];

  for (const part of input.split(/[,，]/)) {
    const name = part.trim().slice(0, MAX_TAG_NAME_LENGTH);
    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    names.push(name);

    if (names.length >= MAX_TAGS_PER_ENTITY) break;
  }

  return names;
}

export function pickTagColor(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % TAG_COLORS.length;
  }
  return TAG_COLORS[hash];
}
