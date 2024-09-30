import { ReactNode, Suspense } from "react";
import Profile from "@/ui/account/profile";
import Nav from "@/ui/nav";
import Loading from "./post/[id]/loading";

export default function DashboardLayout({ children }: { children: ReactNode }) {
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
      <div className="min-h-screen sm:pl-60 dark:bg-black">{children}</div>
    </div>
  );
}
