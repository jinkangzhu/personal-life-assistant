import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import {
  isPasswordResetEnabled,
  verifyPasswordResetSecret,
} from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { z } from "zod";

export async function POST(request: Request) {
  if (!isPasswordResetEnabled()) {
    return NextResponse.json(
      { error: "密码重置未启用，请在 .env 中配置 PASSWORD_RESET_SECRET" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { email, password, resetSecret } = resetPasswordSchema.parse(body);

    if (!verifyPasswordResetSecret(resetSecret)) {
      return NextResponse.json({ error: "重置密钥无效" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message ?? "请求参数无效" },
        { status: 400 },
      );
    }
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
