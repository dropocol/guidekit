import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { nanoid } from "nanoid";
import { sendPasswordResetEmail } from "@/lib/email";
import { REQUEST_SENDER, checkDemoMode } from "@/lib/serverUtils";

export async function POST(req: Request) {
  const demoResponse = checkDemoMode(REQUEST_SENDER.CLIENT);
  if (demoResponse) return demoResponse;

  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = nanoid(32);
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.verificationToken.create({
      data: {
        identifier: user.email!,
        token,
        expires,
      },
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
