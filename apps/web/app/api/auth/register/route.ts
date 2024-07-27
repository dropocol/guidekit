import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { sql } from "@vercel/postgres";
import prisma from "@/lib/prisma";

// /api/register
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // TODO : add proper checks in this file for user creation
    // YOU MAY WANT TO ADD SOME VALIDATION HERE

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
