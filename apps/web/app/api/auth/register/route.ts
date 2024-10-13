import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { sendVerificationEmail } from "@/lib/email";
import { nanoid } from "nanoid";

// import { hash } from "crypto";
import { sql } from "@vercel/postgres";

// /api/register
export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({
        error: "All fields are required",
        status: 400,
      });
    }

    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await sendVerificationEmail(email);

    return NextResponse.json({
      success: true,
      user: user,
      message:
        "User created successfully. Please check your email to verify your account.",
      status: 200,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return NextResponse.json({
          error: "New user cannot be created with this email",
          status: 500,
        });
      }

      return NextResponse.json({
        error: "An error occurred while creating the user",
        status: 500,
      });
    }
  }
}
