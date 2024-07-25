import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { sql } from "@vercel/postgres";
import prisma from "@/lib/prisma";

// /api/register
export async function POST(request: Request) {
  try {
    console.log("register");
    const { email, password } = await request.json();
    // YOU MAY WANT TO ADD SOME VALIDATION HERE

    console.log({ email, password });

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
    console.log({ user });
  } catch (e) {
    console.log({ e });
  }

  return NextResponse.json({ message: "success" });
}
