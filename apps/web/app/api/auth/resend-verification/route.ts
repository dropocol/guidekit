import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/auth";
import { sendVerificationEmail } from "@/lib/email";
import { nanoid } from "nanoid";
import { checkDemoMode } from "@/lib/utils";

export async function POST() {
  const demoResponse = checkDemoMode();
  if (demoResponse) return NextResponse.json(demoResponse);

  const session = await getSession();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.isEmailVerified) {
    return NextResponse.json(
      { error: "Email already verified" },
      { status: 400 },
    );
  }

  const verificationToken = nanoid();

  await prisma.verificationToken.create({
    data: {
      identifier: user.email!,
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
  });

  await sendVerificationEmail(user.email!);

  return NextResponse.json({ message: "Verification email sent" });
}
