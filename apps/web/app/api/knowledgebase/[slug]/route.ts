import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const id = params.slug;

  try {
    const knowledgebase = await prisma.knowledgebase.findUnique({
      where: { id: String(id) },
      include: {
        collections: {
          include: {
            subCollections: {
              include: {
                articles: true,
              },
            },
          },
        },
      },
    });

    if (!knowledgebase) {
      return NextResponse.json(
        { error: "Knowledgebase not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(knowledgebase);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching knowledgebase" },
      { status: 500 },
    );
  }
}
