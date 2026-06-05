import fs from "fs/promises";
import { NextResponse } from "next/server";
import { getAvatarFilePath } from "@/lib/avatar-storage";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarKey: true },
  });

  if (!user?.avatarKey) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const filePath = getAvatarFilePath(user.avatarKey);
    const file = await fs.readFile(filePath);
    const extension = user.avatarKey.slice(user.avatarKey.lastIndexOf("."));

    return new NextResponse(file, {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] ?? "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
