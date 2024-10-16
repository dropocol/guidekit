import { ReactNode, Suspense } from "react";
import Profile from "@/ui/account/profile";
import Nav from "@/ui/nav";
import Loading from "@/ui/loading";
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

      <div className="min-h-screen items-center sm:pl-60 dark:bg-black">
        {session?.user && !session.user.isEmailVerified && (
          <UnverifiedEmailBanner />
        )}
        {children}
      </div>
    </div>
  );
}
