import fs from "fs/promises";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
  deleteAvatarFilesForUser,
  ensureAvatarsDir,
  getAvatarFilePath,
} from "@/lib/avatar-storage";
import { getAvatarExtension, MAX_AVATAR_SIZE } from "@/lib/avatar";

export async function updateUserDisplayName(
  userId: string,
  displayName: string | null,
) {
  return prisma.user.update({
    where: { id: userId },
    data: { displayName },
  });
}

export async function uploadUserAvatar(userId: string, file: File) {
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("AVATAR_TOO_LARGE");
  }

  const extension = getAvatarExtension(file.type);
  if (!extension) {
    throw new Error("AVATAR_INVALID_TYPE");
  }

  await ensureAvatarsDir();
  await deleteAvatarFilesForUser(userId);

  const avatarKey = `${userId}${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(getAvatarFilePath(avatarKey), buffer);

  return prisma.user.update({
    where: { id: userId },
    data: { avatarKey },
  });
}

export async function removeUserAvatar(userId: string) {
  await deleteAvatarFilesForUser(userId);

  return prisma.user.update({
    where: { id: userId },
    data: { avatarKey: null },
  });
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error("INVALID_PASSWORD");
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
