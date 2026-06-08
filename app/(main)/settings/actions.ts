"use server";

import { revalidatePath } from "next/cache";
import {
  createCategory,
  deleteCategory,
  reorderCategories,
  updateCategory,
} from "@/lib/services/category";
import {
  createActivityType,
  deleteActivityType,
  reorderActivityTypes,
  updateActivityType,
} from "@/lib/services/activity-type";
import { createTag, deleteTag, updateTag } from "@/lib/services/tag";
import {
  removeUserWallpaper,
  updateUserWallpaperPreference,
  uploadUserWallpaper,
} from "@/lib/services/wallpaper";
import {
  changeUserPassword,
  removeUserAvatar,
  updateUserDisplayName,
  uploadUserAvatar,
} from "@/lib/services/user";
import { requireSession } from "@/lib/session";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
} from "@/lib/validators/category";
import {
  activityTypeCreateSchema,
  activityTypeUpdateSchema,
} from "@/lib/validators/activity-type";
import {
  changePasswordSchema,
  clampWallpaperOverlay,
  parseWallpaperPreference,
  updateDisplayNameSchema,
  type WallpaperPreference,
} from "@/lib/validators/settings";
import { tagCreateSchema, tagUpdateSchema } from "@/lib/validators/tag";
import { z } from "zod";

function revalidateSettingsPaths() {
  revalidatePath("/settings");
  revalidatePath("/settings/profile");
  revalidatePath("/settings/project");
  revalidatePath("/diary");
  revalidatePath("/diary/new");
  revalidatePath("/notes");
  revalidatePath("/todos");
  revalidatePath("/today");
  revalidatePath("/", "layout");
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries()) as Record<string, string>;
}

export async function updateDisplayNameAction(formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = updateDisplayNameSchema.parse({
      displayName: raw.displayName ?? "",
    });
    const displayName = parsed.displayName.trim() || null;

    await updateUserDisplayName(session.id, displayName);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    console.error("updateDisplayNameAction error:", error);
    return { ok: false as const, error: "保存失败" };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  const session = await requireSession();

  try {
    const file = formData.get("avatar");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false as const, error: "请选择图片" };
    }

    await uploadUserAvatar(session.id, file);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "AVATAR_TOO_LARGE") {
      return { ok: false as const, error: "图片不能超过 2MB" };
    }
    if (error instanceof Error && error.message === "AVATAR_INVALID_TYPE") {
      return { ok: false as const, error: "仅支持 JPG、PNG、WebP、GIF" };
    }
    console.error("uploadAvatarAction error:", error);
    return { ok: false as const, error: "上传失败" };
  }
}

export async function removeAvatarAction() {
  const session = await requireSession();

  try {
    await removeUserAvatar(session.id);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    console.error("removeAvatarAction error:", error);
    return { ok: false as const, error: "移除失败" };
  }
}

export async function updateWallpaperPreferenceAction(
  preference: WallpaperPreference,
  overlay: number,
) {
  const session = await requireSession();

  try {
    const parsedPreference = parseWallpaperPreference(preference);
    const parsedOverlay = clampWallpaperOverlay(overlay);

    await updateUserWallpaperPreference(
      session.id,
      parsedPreference,
      parsedOverlay,
    );
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "WALLPAPER_FILE_MISSING") {
      return { ok: false as const, error: "请先上传自定义壁纸" };
    }
    console.error("updateWallpaperPreferenceAction error:", error);
    return { ok: false as const, error: "保存失败" };
  }
}

export async function uploadWallpaperAction(formData: FormData) {
  const session = await requireSession();

  try {
    const file = formData.get("wallpaper");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false as const, error: "请选择图片" };
    }

    await uploadUserWallpaper(session.id, file);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "WALLPAPER_TOO_LARGE") {
      return { ok: false as const, error: "图片不能超过 5MB" };
    }
    if (error instanceof Error && error.message === "WALLPAPER_INVALID_TYPE") {
      return { ok: false as const, error: "仅支持 JPG、PNG、WebP" };
    }
    console.error("uploadWallpaperAction error:", error);
    return { ok: false as const, error: "上传失败" };
  }
}

export async function removeWallpaperAction() {
  const session = await requireSession();

  try {
    await removeUserWallpaper(session.id);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    console.error("removeWallpaperAction error:", error);
    return { ok: false as const, error: "移除失败" };
  }
}

export async function changePasswordAction(formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = changePasswordSchema.parse({
      currentPassword: raw.currentPassword,
      newPassword: raw.newPassword,
      confirmPassword: raw.confirmPassword,
    });

    await changeUserPassword(
      session.id,
      parsed.currentPassword,
      parsed.newPassword,
    );

    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "INVALID_PASSWORD") {
      return { ok: false as const, error: "当前密码不正确" };
    }
    console.error("changePasswordAction error:", error);
    return { ok: false as const, error: "修改失败" };
  }
}

export async function createTagAction(formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = tagCreateSchema.parse({
      name: raw.name,
      color: raw.color || undefined,
    });

    await createTag(session.id, parsed);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { ok: false as const, error: "标签已存在" };
    }
    console.error("createTagAction error:", error);
    return { ok: false as const, error: "创建失败" };
  }
}

export async function updateTagAction(id: string, formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = tagUpdateSchema.parse({
      name: raw.name || undefined,
      color: raw.color === "" ? null : raw.color || undefined,
    });

    await updateTag(session.id, id, parsed);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "TAG_NOT_FOUND") {
      return { ok: false as const, error: "标签不存在" };
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { ok: false as const, error: "标签名已被使用" };
    }
    console.error("updateTagAction error:", error);
    return { ok: false as const, error: "更新失败" };
  }
}

export async function deleteTagAction(id: string) {
  const session = await requireSession();

  try {
    await deleteTag(session.id, id);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "TAG_NOT_FOUND") {
      return { ok: false as const, error: "标签不存在" };
    }
    console.error("deleteTagAction error:", error);
    return { ok: false as const, error: "删除失败" };
  }
}

export async function createCategoryAction(formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = categoryCreateSchema.parse({ name: raw.name });

    await createCategory(session.id, parsed.name);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { ok: false as const, error: "分类已存在" };
    }
    console.error("createCategoryAction error:", error);
    return { ok: false as const, error: "创建失败" };
  }
}

export async function updateCategoryAction(id: string, formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = categoryUpdateSchema.parse({ name: raw.name });

    await updateCategory(session.id, id, parsed);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return { ok: false as const, error: "分类不存在" };
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { ok: false as const, error: "分类名已被使用" };
    }
    console.error("updateCategoryAction error:", error);
    return { ok: false as const, error: "更新失败" };
  }
}

export async function deleteCategoryAction(id: string) {
  const session = await requireSession();

  try {
    await deleteCategory(session.id, id);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return { ok: false as const, error: "分类不存在" };
    }
    console.error("deleteCategoryAction error:", error);
    return { ok: false as const, error: "删除失败" };
  }
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  const session = await requireSession();

  try {
    await reorderCategories(session.id, orderedIds);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return { ok: false as const, error: "分类不存在" };
    }
    if (error instanceof Error && error.message === "INVALID_ORDER") {
      return { ok: false as const, error: "排序无效" };
    }
    console.error("reorderCategoriesAction error:", error);
    return { ok: false as const, error: "排序失败" };
  }
}

export async function createActivityTypeAction(formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = activityTypeCreateSchema.parse({ name: raw.name });

    await createActivityType(session.id, parsed.name);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { ok: false as const, error: "活动类型已存在" };
    }
    console.error("createActivityTypeAction error:", error);
    return { ok: false as const, error: "创建失败" };
  }
}

export async function updateActivityTypeAction(id: string, formData: FormData) {
  const session = await requireSession();

  try {
    const raw = formDataToObject(formData);
    const parsed = activityTypeUpdateSchema.parse({ name: raw.name });

    await updateActivityType(session.id, id, parsed);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false as const, error: error.errors[0]?.message ?? "参数无效" };
    }
    if (error instanceof Error && error.message === "ACTIVITY_TYPE_NOT_FOUND") {
      return { ok: false as const, error: "活动类型不存在" };
    }
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return { ok: false as const, error: "类型名已被使用" };
    }
    console.error("updateActivityTypeAction error:", error);
    return { ok: false as const, error: "更新失败" };
  }
}

export async function deleteActivityTypeAction(id: string) {
  const session = await requireSession();

  try {
    await deleteActivityType(session.id, id);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "ACTIVITY_TYPE_NOT_FOUND") {
      return { ok: false as const, error: "活动类型不存在" };
    }
    console.error("deleteActivityTypeAction error:", error);
    return { ok: false as const, error: "删除失败" };
  }
}

export async function reorderActivityTypesAction(orderedIds: string[]) {
  const session = await requireSession();

  try {
    await reorderActivityTypes(session.id, orderedIds);
    revalidateSettingsPaths();
    return { ok: true as const };
  } catch (error) {
    if (error instanceof Error && error.message === "ACTIVITY_TYPE_NOT_FOUND") {
      return { ok: false as const, error: "活动类型不存在" };
    }
    if (error instanceof Error && error.message === "INVALID_ORDER") {
      return { ok: false as const, error: "排序无效" };
    }
    console.error("reorderActivityTypesAction error:", error);
    return { ok: false as const, error: "排序失败" };
  }
}
