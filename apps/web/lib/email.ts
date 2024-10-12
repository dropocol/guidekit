import { Resend } from "resend";
import { passwordResetEmailTemplate } from "@/lib/email-templates/password-reset";
import { verificationEmailTemplate } from "@/lib/email-templates/verification";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const verificationUrl = `${protocol}://${process.env.NEXT_PUBLIC_APP_DOMAIN}/verify-email?token=${token}`;

  const from = `${process.env.NEXT_PUBLIC_APP_NAME || "GuideKit"} <${process.env.NEXT_PUBLIC_APP_EMAIL || "noreply@guidekit.cc"}>`;

  await resend.emails.send({
    from: from,
    to: email,
    subject: "Verify your email",
    html: verificationEmailTemplate(verificationUrl),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const resetUrl = `${protocol}://${process.env.NEXT_PUBLIC_APP_DOMAIN}/reset-password?token=${token}`;

  const from = `${process.env.NEXT_PUBLIC_APP_NAME || "GuideKit"} <${process.env.NEXT_PUBLIC_APP_EMAIL || "noreply@guidekit.cc"}>`;

  await resend.emails.send({
    from: from,
    to: email,
    subject: "Reset Your Password",
    html: passwordResetEmailTemplate(resetUrl),
  });
}
