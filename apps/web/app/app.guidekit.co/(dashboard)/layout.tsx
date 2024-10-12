import { ReactNode, Suspense } from "react";
import Profile from "@/ui/account/profile";
import Nav from "@/ui/nav";
import Loading from "./post/[id]/loading";
import { getSession } from "@/auth";
import UnverifiedEmailBanner from "@/ui/email-banner";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <div>
      <Nav>
        <Suspense
          fallback={
            <div>
              <Loading />
            </div>
          }
        >
          <Profile />
        </Suspense>
      </Nav>
      {/* {session?.user && !session.user.emailVerified && ( */}
      {/* )} */}
      <div className="min-h-screen sm:pl-60 dark:bg-black">
        <UnverifiedEmailBanner />
        {children}
      </div>
    </div>
  );
}
