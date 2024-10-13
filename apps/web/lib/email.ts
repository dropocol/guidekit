import { Resend } from "resend";
import { passwordResetEmailTemplate } from "@/lib/email-templates/password-reset";
import { verificationEmailTemplate } from "@/lib/email-templates/verification";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string) {
  const verificationToken = nanoid();

  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const verificationUrl = `${protocol}://${process.env.NEXT_PUBLIC_APP_DOMAIN}/verify-email?token=${verificationToken}`;

  const from = `${process.env.NEXT_PUBLIC_APP_NAME || "GuideKit"} <${process.env.NEXT_PUBLIC_APP_EMAIL || "noreply@guidekit.cc"}>`;

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  });

  if (process.env.NODE_ENV === "production") {
    await resend.emails.send({
      from: from,
      to: email,
      subject: "Verify your email",
      html: verificationEmailTemplate(verificationUrl),
    });
  }
}

// TODO: Add env variable to send email in dev
export async function sendPasswordResetEmail(email: string, token: string) {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const resetUrl = `${protocol}://${process.env.NEXT_PUBLIC_APP_DOMAIN}/reset-password?token=${token}`;

  const from = `${process.env.NEXT_PUBLIC_APP_NAME || "GuideKit"} <${process.env.NEXT_PUBLIC_APP_EMAIL || "noreply@guidekit.cc"}>`;

  if (process.env.NODE_ENV === "production") {
    await resend.emails.send({
      from: from,
      to: email,
      subject: "Reset Your Password",
      html: passwordResetEmailTemplate(resetUrl),
    });
  }
}
