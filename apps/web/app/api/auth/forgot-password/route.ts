import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { nanoid } from "nanoid";
import { passwordResetEmailTemplate } from "@/lib/email-templates/password-reset";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
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
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const resetUrl = `${protocol}://${process.env.NEXT_PUBLIC_APP_DOMAIN}/reset-password?token=${token}`;

    const from = `${process.env.NEXT_PUBLIC_APP_NAME || "ContentBay"} <${process.env.NEXT_PUBLIC_APP_EMAIL || "noreply@contentbay.co"}>`;

    const res = await resend.emails.send({
      from: from,
      to: email,
      subject: "Reset Your Password",
      html: passwordResetEmailTemplate(resetUrl),
    });

    return NextResponse.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
