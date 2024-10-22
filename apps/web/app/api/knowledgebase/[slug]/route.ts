import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug;

  try {
    const knowledgebase = await prisma.knowledgebase.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug },
          { subdomain: slug },
          { customDomain: slug },
        ],
      },
      include: {
        collections: {
          include: {
            subCollections: {
              include: {
                articles: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
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

    // console.log("knowledgebase", knowledgebase.collections);

    return NextResponse.json(knowledgebase);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching knowledgebase" },
      { status: 500 },
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
import { getSession } from "@/auth";
import { checkDemoMode } from "@/lib/utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const demoResponse = checkDemoMode();
  if (demoResponse)
    return NextResponse.json({ ...demoResponse }, { status: 403 });

  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { slug } = params;

  try {
    await prisma.knowledgebase.delete({
      where: { id: slug },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting knowledgebase:", error);
    return new NextResponse("Error deleting knowledgebase", { status: 500 });
  }
}

// Add this to explicitly allow DELETE method
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "DELETE, OPTIONS",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
