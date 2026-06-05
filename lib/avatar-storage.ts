import fs from "fs/promises";
import path from "path";

export function getAvatarsDir() {
  return path.join(process.cwd(), "data", "uploads", "avatars");
}

export function getAvatarFilePath(avatarKey: string) {
  return path.join(getAvatarsDir(), avatarKey);
}

export async function ensureAvatarsDir() {
  await fs.mkdir(getAvatarsDir(), { recursive: true });
}

export async function deleteAvatarFilesForUser(userId: string) {
  const dir = getAvatarsDir();

  try {
    const entries = await fs.readdir(dir);
    await Promise.all(
      entries
        .filter((entry) => entry.startsWith(`${userId}.`))
        .map((entry) => fs.unlink(path.join(dir, entry))),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}
