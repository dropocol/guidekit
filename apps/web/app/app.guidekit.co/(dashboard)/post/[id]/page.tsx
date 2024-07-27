import { getSession } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
// import Editor from "@/components/editor";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/ui/editor/editor"), {
  ssr: false,
});

export default async function PostPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  const data = await prisma.post.findUnique({
    where: {
      id: decodeURIComponent(params.id),
    },
    include: {
      site: {
        select: {
          subdomain: true,
        },
      },
    },
  });
  if (!data || !session.user || data.userId !== session.user.id) {
    notFound();
  }

  return <Editor post={data} />;
}
