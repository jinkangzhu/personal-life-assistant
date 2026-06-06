import fs from "fs/promises";
import path from "path";

export function getWallpapersDir() {
  return path.join(process.cwd(), "data", "uploads", "wallpapers");
}

export function getWallpaperFilePath(wallpaperKey: string) {
  return path.join(getWallpapersDir(), wallpaperKey);
}

export async function ensureWallpapersDir() {
  await fs.mkdir(getWallpapersDir(), { recursive: true });
}

export async function deleteWallpaperFilesForUser(userId: string) {
  const dir = getWallpapersDir();

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

export async function wallpaperFileExists(wallpaperKey: string) {
  try {
    await fs.access(getWallpaperFilePath(wallpaperKey));
    return true;
  } catch {
    return false;
  }
}
