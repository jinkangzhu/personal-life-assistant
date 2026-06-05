import { z } from "zod";
import { tagsFieldSchema } from "@/lib/validators/tag";

export const noteCreateSchema = z.object({
  title: z.string().trim().min(1, "标题不能为空").max(200),
  content: z.string().max(50000).default(""),
  categoryId: z.string().trim().optional(),
  tags: tagsFieldSchema,
});

export const noteUpdateSchema = noteCreateSchema;

export type NoteFilter = {
  categoryId?: string;
  tagId?: string;
};

export function parseNoteFilter(params: {
  category?: string;
  tag?: string;
}): NoteFilter {
  const categoryId = params.category?.trim() || undefined;
  const tagId = params.tag?.trim() || undefined;
  return { categoryId, tagId };
}

export function noteFilterHref(filter: NoteFilter): string {
  const search = new URLSearchParams();
  if (filter.categoryId) search.set("category", filter.categoryId);
  if (filter.tagId) search.set("tag", filter.tagId);
  const query = search.toString();
  return query ? `/notes?${query}` : "/notes";
}
