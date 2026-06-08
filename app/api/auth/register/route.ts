import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, setAuthCookie, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators/auth";
import { DEFAULT_ACTIVITY_TYPES } from "@/lib/validators/activity-type";
import { z } from "zod";

const DEFAULT_CATEGORIES = [
  { name: "前端", sortOrder: 0 },
  { name: "AI", sortOrder: 1 },
  { name: "生活", sortOrder: 2 },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, displayName } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: displayName || null,
        categories: { create: DEFAULT_CATEGORIES },
        activityTypes: { create: [...DEFAULT_ACTIVITY_TYPES] },
      },
    });

    const token = await signToken({ userId: user.id });
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
        },
      },
      { status: 201 },
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? "请求参数无效" },
        { status: 400 },
      );
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
